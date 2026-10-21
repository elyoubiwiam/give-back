ALTER TABLE public.task_cancellations
  ADD COLUMN IF NOT EXISTS reason text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.task_cancellations ADD CONSTRAINT task_cancellations_status_chk CHECK (status IN ('pending','approved','rejected'));
ALTER TABLE public.task_cancellations ALTER COLUMN status SET DEFAULT 'pending';

GRANT SELECT ON public.task_cancellations TO authenticated;
CREATE POLICY "own cancellations read" ON public.task_cancellations FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP FUNCTION IF EXISTS public.cancel_task(uuid);
CREATE OR REPLACE FUNCTION public.cancel_task(_task_id uuid, _reason text) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE uid uuid := auth.uid(); pts integer; newpts integer; signup_id uuid; r text := btrim(coalesce(_reason,''));
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF length(r) < 10 THEN RAISE EXCEPTION 'Please give a short reason (at least 10 characters)'; END IF;
  SELECT id INTO signup_id FROM public.task_signups WHERE user_id = uid AND task_id = _task_id FOR UPDATE;
  IF signup_id IS NULL THEN RAISE EXCEPTION 'You have not booked this task'; END IF;
  SELECT points INTO pts FROM public.tasks WHERE id = _task_id;
  DELETE FROM public.task_signups WHERE id = signup_id AND user_id = uid;
  INSERT INTO public.task_cancellations (task_id, user_id, reason, status) VALUES (_task_id, uid, left(r, 500), 'pending');
  PERFORM set_config('app.allow_points', 'on', true);
  UPDATE public.profiles SET points = GREATEST(0, points - pts) WHERE id = uid RETURNING points INTO newpts;
  RETURN newpts;
END $function$;
REVOKE EXECUTE ON FUNCTION public.cancel_task(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cancel_task(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.my_strikes() RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.task_cancellations WHERE user_id = auth.uid() AND status = 'rejected'
$$;
REVOKE EXECUTE ON FUNCTION public.my_strikes() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_strikes() TO authenticated;

CREATE OR REPLACE FUNCTION public.charity_cancellations()
RETURNS TABLE(id uuid, task_id uuid, task_title text, volunteer_name text, reason text, status text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT x.id, x.task_id, t.title, split_part(coalesce(p.name,''),' ',1), x.reason, x.status, x.created_at
  FROM public.task_cancellations x JOIN public.tasks t ON t.id = x.task_id
  JOIN public.charities c ON c.id = t.charity_id AND c.owner_id = auth.uid()
  LEFT JOIN public.profiles p ON p.id = x.user_id
  ORDER BY x.created_at DESC
$$;
REVOKE EXECUTE ON FUNCTION public.charity_cancellations() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.charity_cancellations() TO authenticated;

CREATE OR REPLACE FUNCTION public.review_cancellation(_id uuid, _approve boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.task_cancellations x SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END, reviewed_at = now()
  FROM public.tasks t WHERE t.id = x.task_id AND x.id = _id AND public.owns_charity(t.charity_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'Not allowed'; END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.review_cancellation(uuid, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.review_cancellation(uuid, boolean) TO authenticated;