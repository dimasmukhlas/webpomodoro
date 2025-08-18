-- Fix security warnings by properly recreating functions with triggers
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_task_time_trigger ON public.time_logs;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_task_time() CASCADE;

-- Recreate functions with proper search_path security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_task_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_type = 'work' THEN
    UPDATE public.tasks 
    SET total_time_spent = total_time_spent + NEW.duration
    WHERE id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_time_trigger
AFTER INSERT ON public.time_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_task_time();