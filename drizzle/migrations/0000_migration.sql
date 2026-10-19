CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT 'London',
  causes text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  max_minutes int NOT NULL DEFAULT 120,
  points int NOT NULL DEFAULT 0,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- prevent users from changing their own points directly
CREATE OR REPLACE FUNCTION public.protect_points() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('app.allow_points', true) IS DISTINCT FROM 'on' THEN
    NEW.points := OLD.points;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect_points BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_points();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  org text NOT NULL,
  city text NOT NULL,
  cause text NOT NULL,
  minutes int NOT NULL,
  points int NOT NULL,
  when_label text NOT NULL,
  spots int NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL
);
GRANT SELECT ON public.tasks TO anon, authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks public" ON public.tasks FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.task_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id)
);
GRANT SELECT ON public.task_signups TO authenticated;
GRANT ALL ON public.task_signups TO service_role;
ALTER TABLE public.task_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own signups" ON public.task_signups FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.join_task(_task_id uuid) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pts int; uid uuid := auth.uid(); newpts int;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT points INTO pts FROM tasks WHERE id = _task_id;
  IF pts IS NULL THEN RAISE EXCEPTION 'Task not found'; END IF;
  INSERT INTO task_signups (user_id, task_id) VALUES (uid, _task_id);
  PERFORM set_config('app.allow_points', 'on', true);
  UPDATE profiles SET points = points + pts WHERE id = uid RETURNING points INTO newpts;
  RETURN newpts;
END $$;
REVOKE ALL ON FUNCTION public.join_task(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.join_task(uuid) TO authenticated;

CREATE TABLE public.city_baseline (
  city text PRIMARY KEY, hours int NOT NULL, actions int NOT NULL, volunteers int NOT NULL
);
GRANT SELECT ON public.city_baseline TO anon, authenticated;
GRANT ALL ON public.city_baseline TO service_role;
ALTER TABLE public.city_baseline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "baseline public" ON public.city_baseline FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.city_stats() RETURNS TABLE(city text, hours int, actions int, volunteers int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.city,
    b.hours + COALESCE((SELECT SUM(t.minutes)/60 FROM task_signups s JOIN tasks t ON t.id=s.task_id WHERE t.city=b.city),0)::int,
    b.actions + COALESCE((SELECT COUNT(*) FROM task_signups s JOIN tasks t ON t.id=s.task_id WHERE t.city=b.city),0)::int,
    b.volunteers + COALESCE((SELECT COUNT(DISTINCT s.user_id) FROM task_signups s JOIN tasks t ON t.id=s.task_id WHERE t.city=b.city),0)::int
  FROM city_baseline b;
$$;
GRANT EXECUTE ON FUNCTION public.city_stats() TO anon, authenticated;

INSERT INTO public.city_baseline VALUES
('Manchester',4820,1630,712),('London',4510,1890,1204),('Bristol',3120,980,401),
('Edinburgh',2760,845,366),('Leeds',2210,702,298),('Glasgow',1980,655,274);

INSERT INTO public.tasks (title,org,city,cause,minutes,points,when_label,spots,lat,lng) VALUES
('Sort donated tins at the food bank','Hackney Food Bank','London','Food & Hunger',60,40,'Sat, 10:00',4,51.5450,-0.0553),
('Walk two senior dogs','Battersea Friends','London','Animals',30,20,'Today, 17:30',2,51.4791,-0.1490),
('Litter pick along the canal','Canal Keepers','London','Environment',120,70,'Sun, 09:00',12,51.5362,-0.1030),
('Tea & chat with a resident','Age Together','London','Elderly Care',60,45,'Wed, 15:00',3,51.4613,-0.1156),
('Read with Year 4 pupils','Brixton Readers','London','Youth & Education',60,45,'Thu, 13:30',2,51.4620,-0.1140),
('Carry chairs for a community fair','Ancoats Hub','Manchester','Arts & Culture',120,60,'Sat, 08:30',6,53.4846,-2.2260),
('Serve hot meals','Mustard Tree','Manchester','Homelessness',240,120,'Fri, 18:00',5,53.4870,-2.2470),
('Read with Year 3 pupils','Reading Buddies','Manchester','Youth & Education',60,45,'Thu, 14:00',2,53.4600,-2.2300),
('Plant bulbs in the community garden','Bristol Green','Bristol','Environment',120,65,'Sun, 11:00',8,51.4600,-2.5900),
('Drive meal deliveries','Bristol Meals on Wheels','Bristol','Elderly Care',120,80,'Tue, 11:30',1,51.4545,-2.5879),
('Pack hygiene kits','Streetwise Edinburgh','Edinburgh','Homelessness',30,25,'Today, 19:00',10,55.9533,-3.1883),
('Help at a blood drive','Edinburgh Health Hub','Edinburgh','Health',120,60,'Mon, 10:00',4,55.9440,-3.1900),
('Steward a charity 5k','Leeds Heart Run','Leeds','Health',240,110,'Sun, 07:30',15,53.8008,-1.5491),
('Clean cat enclosures','Glasgow Cat Rescue','Glasgow','Animals',60,40,'Sat, 13:00',3,55.8642,-4.2518);