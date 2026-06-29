"use client";

import { useState, useEffect } from "react";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      if (!res.ok) throw new Error("Failed to add task");
      const data = await res.json();
      setTasks([data, ...tasks]);
      setNewTaskTitle("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task._id);
    setEditTaskTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTaskTitle("");
  };

  const saveEdit = async (id: string) => {
    if (!editTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTaskTitle }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t._id === id ? updatedTask : t)));
      cancelEditing();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 transition-all duration-300">
          
          {/* Header */}
          <div className="p-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Tasks
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
              Stay organized, focused, and get things done.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Add Task Form */}
          <div className="p-8">
            <form onSubmit={addTask} className="relative">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full pl-6 pr-16 py-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 transition-all shadow-sm text-lg"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="absolute right-2 top-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center"
              >
                <Plus size={20} className="stroke-[2.5]" />
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="px-8 pb-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">All caught up!</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">You have no tasks remaining. Add a new task above to get started.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task._id}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                      task.completed
                        ? "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800/50 opacity-75"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-md"
                    }`}
                  >
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        task.completed
                          ? "bg-indigo-500 border-indigo-500 text-white"
                          : "border-neutral-300 dark:border-neutral-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-transparent"
                      }`}
                    >
                      <Check size={14} className="stroke-[3]" />
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingTaskId === task._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            autoFocus
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(task._id);
                              if (e.key === "Escape") cancelEditing();
                            }}
                            className="w-full px-3 py-1 bg-white dark:bg-neutral-950 border border-indigo-500 rounded-lg focus:outline-none text-neutral-900 dark:text-neutral-100 text-base"
                          />
                        </div>
                      ) : (
                        <span
                          className={`block truncate text-base transition-all duration-300 ${
                            task.completed
                              ? "text-neutral-400 dark:text-neutral-500 line-through"
                              : "text-neutral-700 dark:text-neutral-200"
                          }`}
                        >
                          {task.title}
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 transition-opacity duration-200 ${editingTaskId === task._id ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"}`}>
                      {editingTaskId === task._id ? (
                        <>
                          <button
                            onClick={() => saveEdit(task._id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          >
                            <Check size={16} className="stroke-[2.5]" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            <X size={16} className="stroke-[2.5]" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(task)}
                            className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-8 font-medium tracking-wide">
          PRESS ENTER TO SAVE EDITS • ESC TO CANCEL
        </p>
      </div>
    </div>
  );
}
