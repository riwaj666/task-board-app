

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { format, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { CalendarIcon, GripVerticalIcon, AlertCircleIcon, ClockIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isOverlay = false, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const daysUntilDue = task.due_date && task.status !== 'done' 
    ? differenceInDays(startOfDay(new Date(task.due_date)), startOfDay(new Date()))
    : null;

  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 2;

  const outerClasses = `group relative rounded-lg transition-all ${
    isOverlay ? 'shadow-xl scale-105 rotate-2 cursor-grabbing z-50' : 'cursor-grab hover:-translate-y-0.5'
  } ${
    isDueSoon 
      ? 'p-[1px] bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' 
      : 'p-0'
  }`;

  const innerClasses = `flex flex-col gap-2 rounded-lg p-3 text-left h-full w-full ${
    isOverdue 
      ? 'border border-rose-500/50 bg-[#1A1A22]' 
      : isDueSoon 
        ? 'bg-[#1A1A22] border-none' 
        : 'border border-card-border bg-[#1A1A22] hover:border-primary-hover hover:ring-1 hover:ring-primary-hover'
  }`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={outerClasses}
      onClick={(e) => {
        // Prevent click if dragging
        if (isDragging) return;
        onClick?.();
      }}
      {...attributes}
      {...listeners}
    >
      <div className={innerClasses}>
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-tight text-foreground">{task.title}</h4>
        </div>

        {task.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {task.priority && (
              <Badge variant={task.priority === 'high' ? 'high' : task.priority === 'normal' ? 'normal' : 'low'}>
                {task.priority}
              </Badge>
            )}
          </div>
          {task.due_date && (
            <div className={`flex items-center gap-1 text-[10px] font-medium ${
              isOverdue ? 'text-rose-400' : isDueSoon ? 'text-orange-400' : 'text-muted-foreground'
            }`}>
              {isOverdue ? <AlertCircleIcon size={12} /> : isDueSoon ? <ClockIcon size={12} /> : <CalendarIcon size={12} />}
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
