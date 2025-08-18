-- Add color and completion tracking to tasks table
ALTER TABLE public.tasks 
ADD COLUMN color TEXT DEFAULT '#3b82f6',
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on completed tasks
CREATE INDEX idx_tasks_completed_at ON public.tasks(completed_at) WHERE completed_at IS NOT NULL;