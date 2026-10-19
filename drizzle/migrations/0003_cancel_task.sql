CREATE OR REPLACE FUNCTION public.cancel_task(_task_id uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); pts integer; newpts integer; signup_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT id INTO signup_id FROM public.task_signups WHERE user_id = uid AND task_id = _task_id FOR UPDATE;
  IF signup_id IS NULL THEN RAISE EXCEPTION 'You have not booked this task'; END IF;
  SELECT points INTO pts FROM public.tasks WHERE id = _task_id;
  DELETE FROM public.task_signups WHERE id = signup_id AND user_id = uid;
  PERFORM set_config('app.allow_points', 'on', true);
  UPDATE public.profiles SET points = GREATEST(0, points - pts) WHERE id = uid RETURNING points INTO newpts;
  RETURN newpts;
END $$;
REVOKE ALL ON FUNCTION public.cancel_task(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cancel_task(uuid) TO authenticated;