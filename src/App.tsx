import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Board } from '@/components/Board';
import { BoardSummary } from '@/components/BoardSummary';

function App() {
  const { tasks, loading, authError, updateTaskStatus, createTask, updateTask, fetchActivities } = useTasks();

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D12] p-4 text-[#EDEDED]">
        <div className="max-w-md w-full rounded-xl border border-red-500/20 bg-[#141419] p-6 shadow-2xl text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Error</h2>
          <p className="text-[#8B8B9B] mb-6">{authError}</p>
          <div className="bg-[#1A1A22] p-4 rounded-md text-left text-sm text-[#EDEDED]">
            <p className="font-semibold mb-2">How to fix this:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open your Supabase Dashboard</li>
              <li>Go to <b>Authentication</b> {'>'} <b>Providers</b></li>
              <li>Find and expand <b>Anonymous</b></li>
              <li>Toggle it to <b>ON</b> and click Save</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D12]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A1A22] border-t-[#5244E1]"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0D0D12] p-8 text-[#EDEDED]">
      <BoardSummary tasks={tasks} />
      <Board 
        tasks={tasks} 
        onTaskMove={updateTaskStatus} 
        onCreateTask={createTask} 
        onUpdateTask={updateTask}
        fetchActivities={fetchActivities}
      />
    </main>
  );
}

export default App;
