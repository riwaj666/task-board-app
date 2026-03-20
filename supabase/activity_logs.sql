-- Create Activity Logs Table
create table if not exists public.activity_logs (
    id uuid default uuid_generate_v4() primary key,
    task_id uuid references public.tasks(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete set null,
    content text not null,
    type text not null,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.activity_logs enable row level security;

-- Policies
create policy "Users can view activities for their tasks" 
    on public.activity_logs for select 
    using (
        exists (
            select 1 from public.tasks 
            where tasks.id = activity_logs.task_id 
            and tasks.user_id = auth.uid()
        )
    );

create policy "Users can insert activity logs for their tasks" 
    on public.activity_logs for insert 
    with check (
        exists (
            select 1 from public.tasks 
            where tasks.id = activity_logs.task_id 
            and tasks.user_id = auth.uid()
        )
    );
