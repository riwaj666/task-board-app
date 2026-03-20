

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { PlusIcon } from 'lucide-react';

interface BoardColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export default function BoardColumn({ id, title, tasks, onAddTask, onEditTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-[320px] flex-shrink-0 flex-col rounded-xl bg-card border border-card-border">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onAddTask} className="h-6 w-6">
          <PlusIcon size={14} />
        </Button>
      </div>

      <div 
        ref={setNodeRef} 
        className={`flex flex-1 flex-col gap-3 p-3 transition-colors ${isOver ? 'bg-accent/30' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onEditTask(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
