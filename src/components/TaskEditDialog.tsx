import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskPriority, TaskStatus, ActivityLog } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { ChevronDownIcon, ChevronRightIcon, HistoryIcon, XIcon } from 'lucide-react';

interface TaskEditDialogProps {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  fetchActivities: (taskId: string) => Promise<ActivityLog[]>;
}

export function TaskEditDialog({ isOpen, task, onClose, onUpdate, fetchActivities }: TaskEditDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority || 'normal');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset state when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'normal');
    setStatus(task.status);
    setDueDate(task.due_date || '');
    
    // Fetch activities if history is open
    if (isOpen && isHistoryOpen) {
      setLoadingActivities(true);
      fetchActivities(task.id).then(data => {
        setActivities(data);
        setLoadingActivities(false);
      });
    }
  }, [task, isOpen, fetchActivities, isHistoryOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Escape to close
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const renderActivityContent = (content: string) => {
    const statuses = ['To Do', 'In Progress', 'In Review', 'Done'];
    const parts = content.split(new RegExp(`(${statuses.join('|')})`, 'g'));
    
    return parts.map((part, i) => {
      if (statuses.includes(part)) {
        let colorClass = 'text-muted-foreground';
        if (part === 'To Do') colorClass = 'text-[#8B8B9B] bg-[#1A1A22] px-2 py-0.5 rounded text-[11px]';
        if (part === 'In Progress') colorClass = 'text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded text-[11px]';
        if (part === 'In Review') colorClass = 'text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded text-[11px]';
        if (part === 'Done') colorClass = 'text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[11px]';
        
        return (
          <span key={i} className={`font-semibold mx-1 ${colorClass}`}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUpdate(task.id, {
      title,
      description,
      priority,
      status,
      due_date: dueDate || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div ref={dialogRef} className="relative w-full max-w-md rounded-xl border border-card-border bg-card p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Edit Task</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-[#2A2A32]"
          >
            <XIcon size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Title</label>
            <Input 
              autoFocus
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-card-border bg-card/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-card-border bg-card/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Priority</label>
              <select
                className="flex h-10 w-full rounded-md border border-card-border bg-card/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Due Date</label>
            <Input 
              type="date" 
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
              className="w-full text-foreground"
            />
          </div>

          <div className="mt-2 border-t border-card-border pt-4">
            <button 
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              {isHistoryOpen ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
              <HistoryIcon size={14} />
              Activity History
            </button>
            
            {isHistoryOpen && (
              <div className="mt-4 flex flex-col gap-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {loadingActivities ? (
                  <p className="text-xs text-[#8B8B9B]">Loading history...</p>
                ) : activities.length === 0 ? (
                  <p className="text-xs text-[#8B8B9B]">No history available yet.</p>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="flex flex-col gap-1 border-l-2 border-[#2A2A32] pl-3 py-0.5">
                      <div className="text-sm text-[#EDEDED] flex items-center flex-wrap">
                        {renderActivityContent(activity.content)}
                      </div>
                      <p className="text-[10px] text-[#8B8B9B]">
                        {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-card-border">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
