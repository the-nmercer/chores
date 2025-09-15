"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AddTaskForm from "./components/AddTaskForm";
import TaskTable from "./components/TaskTable";

type Task = {
  id: string;
  name: string;
  description: string | null;
  frequency_days: number;
  last_completed: string | null;
  category_id: string | null;
  completed_by: string | null;
};

type Category = {
  id: string;
  name: string;
};

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [completedBy, setCompletedBy] = useState("Team");

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    else setTasks(data || []);
    setLoading(false);
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error(error);
    else setCategories(data || []);
  }

  async function markComplete(taskId: string) {
  const { error } = await supabase
    .from("tasks")
    .update({
      last_completed: new Date().toISOString().split("T")[0],
      completed_by: completedBy, // 👈 save selection
    })
    .eq("id", taskId);

  if (error) console.error(error);
  else fetchTasks();
}

  if (loading) return <div>Loading...</div>;

  // filter tasks by selected category
  const filteredTasks =
    selectedCategory === "all"
      ? tasks
      : tasks.filter((t) => t.category_id === selectedCategory);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>Chores Tracker</h1>

      {/* Filter dropdown */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Filter by category: </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: "0.25rem 0.5rem", borderRadius: "4px" }}
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle Add Task form */}
      <button
        onClick={() => {
          setShowForm((prev) => !prev);
          setEditingTask(null);
        }}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#4CAF50",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {showForm ? "Cancel" : "Add Task"}
      </button>

      {/* Completed By Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Completed By:</label>
        <label>
          <input
            type="radio"
            value="Nick"
            checked={completedBy === "Nick"}
            onChange={(e) => setCompletedBy(e.target.value)}
          />
          Nick
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="Krista"
            checked={completedBy === "Krista"}
            onChange={(e) => setCompletedBy(e.target.value)}
          />
          Krista
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            value="Team"
            checked={completedBy === "Team"}
            onChange={(e) => setCompletedBy(e.target.value)}
          />
          Team
        </label>
      </div>

      {/* Add/Edit Task modal */}
      {(showForm || editingTask) && (
        <AddTaskForm
          categories={categories}
          task={editingTask ?? undefined}
          onTaskSaved={() => {
            fetchTasks();
            setEditingTask(null);
            setShowForm(false);
          }}
          onClose={() => {
            setEditingTask(null);
            setShowForm(false);
          }}
        />
      )}

      {/* Task Table */}
      <TaskTable
        tasks={filteredTasks}
        categories={categories}
        onComplete={markComplete}
        onEdit={(task) => {
          setEditingTask(task);
          setShowForm(true);
        }}
      />
    </div>
  );
}
