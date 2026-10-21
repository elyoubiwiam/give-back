CREATE TYPE public.app_role AS ENUM ('admin', 'charity');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'elyoubi.wia@gmail.com' ON CONFLICT DO NOTHING;

CREATE TABLE public.charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid UNIQUE,
  login_email text,
  name text NOT NULL,
  logo_url text,
  description text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT 'London',
  causes text[] NOT NULL DEFAULT '{}',
  charity_number text NOT NULL DEFAULT '',
  regulator text NOT NULL DEFAULT '',
  registered_address text NOT NULL DEFAULT '',
  safeguarding_lead text NOT NULL DEFAULT '',
  dbs_checks boolean NOT NULL DEFAULT false,
  insurance boolean NOT NULL DEFAULT false,
  insurance_expiry date,
  doc_path text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.charities TO anon, authenticated;
GRANT UPDATE ON public.charities TO authenticated;
GRANT ALL ON public.charities TO service_role;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "charities public read" ON public.charities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "charity owner update" ON public.charities FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "admin update charities" ON public.charities FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- owners cannot change owner/active/login email themselves
CREATE OR REPLACE FUNCTION public.protect_charity_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.owner_id := OLD.owner_id; NEW.active := OLD.active; NEW.login_email := OLD.login_email;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_charity_fields BEFORE UPDATE ON public.charities FOR EACH ROW EXECUTE FUNCTION public.protect_charity_fields();

INSERT INTO public.charities (name, city) SELECT org, min(city) FROM public.tasks GROUP BY org;

ALTER TABLE public.tasks ADD COLUMN charity_id uuid REFERENCES public.charities(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN description text NOT NULL DEFAULT '';
ALTER TABLE public.tasks ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
UPDATE public.tasks t SET charity_id = c.id FROM public.charities c WHERE c.name = t.org;

CREATE OR REPLACE FUNCTION public.owns_charity(_charity_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.charities WHERE id = _charity_id AND owner_id = auth.uid() AND active)
$$;

CREATE OR REPLACE FUNCTION public.normalize_task() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.minutes < 5 OR NEW.minutes > 240 THEN RAISE EXCEPTION 'Tasks must take between 5 minutes and half a day (4 hours)'; END IF;
  IF NEW.spots < 1 OR NEW.spots > 500 THEN RAISE EXCEPTION 'Volunteers needed must be between 1 and 500'; END IF;
  NEW.points := NEW.minutes;
  IF NEW.charity_id IS NOT NULL THEN SELECT name INTO NEW.org FROM public.charities WHERE id = NEW.charity_id; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER normalize_task BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.normalize_task();

GRANT INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
CREATE POLICY "charity insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.owns_charity(charity_id));
CREATE POLICY "charity update tasks" ON public.tasks FOR UPDATE TO authenticated USING (public.owns_charity(charity_id)) WITH CHECK (public.owns_charity(charity_id));
CREATE POLICY "charity delete tasks" ON public.tasks FOR DELETE TO authenticated USING (public.owns_charity(charity_id));

ALTER TABLE public.task_signups DROP CONSTRAINT task_signups_task_id_fkey;
ALTER TABLE public.task_signups ADD CONSTRAINT task_signups_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

CREATE TABLE public.task_cancellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.task_cancellations TO service_role;
ALTER TABLE public.task_cancellations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id uuid NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  user_id uuid,
  amount_pence integer NOT NULL CHECK (amount_pence > 0 AND amount_pence <= 100000000),
  giveback_pence integer NOT NULL DEFAULT 0 CHECK (giveback_pence >= 0),
  monthly boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.donations TO anon, authenticated;
GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone pledges" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "charity reads own donations" ON public.donations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.charities c WHERE c.id = charity_id AND c.owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.join_task(_task_id uuid) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE pts int; cap int; taken int; uid uuid := auth.uid(); newpts int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT points, spots INTO pts, cap FROM tasks WHERE id = _task_id FOR UPDATE;
  IF pts IS NULL THEN RAISE EXCEPTION 'Task not found'; END IF;
  SELECT count(*) INTO taken FROM task_signups WHERE task_id = _task_id;
  IF taken >= cap THEN RAISE EXCEPTION 'This task is fully booked'; END IF;
  INSERT INTO task_signups (user_id, task_id) VALUES (uid, _task_id);
  PERFORM set_config('app.allow_points', 'on', true);
  UPDATE profiles SET points = points + pts WHERE id = uid RETURNING points INTO newpts;
  RETURN newpts;
END $function$;

CREATE OR REPLACE FUNCTION public.cancel_task(_task_id uuid) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE uid uuid := auth.uid(); pts integer; newpts integer; signup_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT id INTO signup_id FROM public.task_signups WHERE user_id = uid AND task_id = _task_id FOR UPDATE;
  IF signup_id IS NULL THEN RAISE EXCEPTION 'You have not booked this task'; END IF;
  SELECT points INTO pts FROM public.tasks WHERE id = _task_id;
  DELETE FROM public.task_signups WHERE id = signup_id AND user_id = uid;
  INSERT INTO public.task_cancellations (task_id, user_id) VALUES (_task_id, uid);
  PERFORM set_config('app.allow_points', 'on', true);
  UPDATE public.profiles SET points = GREATEST(0, points - pts) WHERE id = uid RETURNING points INTO newpts;
  RETURN newpts;
END $function$;

CREATE OR REPLACE FUNCTION public.task_booked_counts() RETURNS TABLE(task_id uuid, booked integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT task_id, count(*)::int FROM public.task_signups GROUP BY task_id
$$;
GRANT EXECUTE ON FUNCTION public.task_booked_counts() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.charity_activity()
RETURNS TABLE(kind text, task_id uuid, volunteer_id uuid, volunteer_name text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'booked', s.task_id, s.user_id, split_part(coalesce(p.name, ''), ' ', 1), s.created_at
  FROM public.task_signups s JOIN public.tasks t ON t.id = s.task_id
  JOIN public.charities c ON c.id = t.charity_id AND c.owner_id = auth.uid()
  LEFT JOIN public.profiles p ON p.id = s.user_id
  UNION ALL
  SELECT 'cancelled', x.task_id, x.user_id, '', x.created_at
  FROM public.task_cancellations x JOIN public.tasks t ON t.id = x.task_id
  JOIN public.charities c ON c.id = t.charity_id AND c.owner_id = auth.uid()
$$;
REVOKE EXECUTE ON FUNCTION public.charity_activity() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.charity_activity() TO authenticated;

CREATE POLICY "charity logos public read" ON storage.objects FOR SELECT USING (bucket_id = 'charity-logos');
CREATE POLICY "charity logos owner write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'charity-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "charity logos owner update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'charity-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "charity docs owner read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'charity-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "charity docs owner write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'charity-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "charity docs owner update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'charity-docs' AND (storage.foldername(name))[1] = auth.uid()::text);