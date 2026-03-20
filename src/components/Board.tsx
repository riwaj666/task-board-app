
import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskStatus, ActivityLog } from '@/lib/types';
import BoardColumn from './BoardColumn';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskEditDialog } from './TaskEditDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

interface BoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onCreateTask: (task: Partial<Task>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  fetchActivities: (taskId: string) => Promise<ActivityLog[]>;
}

export function Board({ tasks, onTaskMove, onCreateTask, onUpdateTask, fetchActivities }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('todo');

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getFilteredTasks = (status: TaskStatus) => filteredTasks.filter(t => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;

    // Check if over a column or another task
    const isOverAColumn = COLUMNS.some(c => c.id === overId);
    const overTask = tasks.find(t => t.id === overId);

    const newStatus = isOverAColumn ? overId as TaskStatus : overTask?.status;

    if (newStatus && activeTask.status !== newStatus) {
      onTaskMove(activeTaskId, newStatus);
    }
  };

  const handleAddTask = (status: TaskStatus = 'todo') => {
    setCreateStatus(status);
    setIsCreateOpen(true);
  };

  const activeTask = tasks.find(t => t.id === activeId);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-[#8B8B9B] mt-1 text-xs md:text-sm">Manage your work efficiently.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full lg:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#1A1A22]/50 border-card-border"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B9B]">
              <SearchIcon size={16} />
            </div>
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleAddTask('todo')} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <PlusIcon size={16} /> New Task
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(col => (
            <BoardColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={getFilteredTasks(col.id)}
              onAddTask={() => handleAddTask(col.id)}
              onEditTask={setEditingTask}
            />
          ))}
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {filteredTasks.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-[#1A1A22] flex items-center justify-center mb-4">
            <SearchIcon size={24} className="text-[#8B8B9B]" />
          </div>
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-[#8B8B9B]">No tasks match your search "{searchQuery}"</p>
          <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>Clear Search</Button>
        </div>
      )}

      {isCreateOpen && (
        <CreateTaskDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={onCreateTask}
          defaultStatus={createStatus}
        />
      )}

      {editingTask && (
        <TaskEditDialog
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={onUpdateTask}
          fetchActivities={fetchActivities}
        />
      )}
    </div>
  );
}
