ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS starts_at timestamptz;
UPDATE public.tasks SET starts_at = date_trunc('day', now()) + ((row_number) || ' days')::interval + interval '10 hours'
FROM (SELECT id AS rid, row_number() OVER (ORDER BY title) AS row_number FROM public.tasks) r WHERE r.rid = tasks.id AND starts_at IS NULL;