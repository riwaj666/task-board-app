import React from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { CheckCircle2Icon, ListTodoIcon, AlertCircleIcon } from 'lucide-react';
import { isBefore, startOfDay } from 'date-fns';

interface BoardSummaryProps {
  tasks: Task[];
}

export function BoardSummary({ tasks }: BoardSummaryProps) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  
  const today = startOfDay(new Date());
  const overdue = tasks.filter(t => {
    if (t.status === 'done' || !t.due_date) return false;
    const dueDate = new Date(t.due_date);
    return isBefore(dueDate, today);
  }).length;

  const stats = [
    {
      label: 'Total Tasks',
      value: total,
      icon: ListTodoIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2Icon,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertCircleIcon,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-card-border bg-[#141419]/50 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-[#8B8B9B]">{stat.label}</p>
              <p className="text-xl font-bold text-[#EDEDED]">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
