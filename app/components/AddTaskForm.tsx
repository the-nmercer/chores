"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Category = { id: string; name: string };
type TaskInput = {
  id?: string;
  name: string;
  description: string | null;
  frequency_days: number;
  category_id: string | null;
  last_completed?: string | null;
};

type Props = {
  categories: Category[];
  task?: TaskInput; // optional, prefilled for editing
  onClose: () => void;
  onTaskSaved: () => void;
};

export default function AddTaskForm({ categories, task, onClose, onTaskSaved }: Props) {
  const [formData, setFormData] = useState<TaskInput>({
    name: task?.name || "",
    description: task?.description || "",
    frequency_days: task?.frequency_days || 7,
    category_id: task?.category_id || null,
    last_completed: task?.last_completed || null,
    id: task?.id,
  });

  async function saveTask(e: React.FormEvent) {
    e.preventDefault();

    const insertData: TaskInput = {
      name: formData.name,
      description: formData.description,
      frequency_days: formData.frequency_days,
      category_id: formData.category_id || null,
      last_completed: formData.last_completed || null,
    };

    try {
      if (formData.id) {
        // Edit existing task
        const { error } = await supabase
          .from("tasks")
          .update(insertData)
          .eq("id", formData.id);
        if (error) throw error;
      } else {
        // Add new task
        const { error } = await supabase.from("tasks").insert([insertData]);
        if (error) throw error;
      }

      onTaskSaved();
      onClose();
    } catch (error) {
      console.error("Supabase insert/edit error:", error);
    }
  }

  async function deleteTask() {
    if (!formData.id) return;
    if (!confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", formData.id);
    if (error) console.error("Delete error:", error);
    else {
      onTaskSaved();
      onClose();
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <form
        onSubmit={saveTask}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          minWidth: "300px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "1rem" }}>{task ? "Edit Task" : "Add New Task"}</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Frequency (days):</label>
          <input
            type="number"
            value={formData.frequency_days}
            onChange={(e) => setFormData({ ...formData, frequency_days: parseInt(e.target.value) })}
            min={1}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Category:</label>
          <select
            value={formData.category_id ?? ""}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Description:</label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Last Completed:</label>
          <input
            type="date"
            value={formData.last_completed || ""}
            onChange={(e) => setFormData({ ...formData, last_completed: e.target.value || null })}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {task && (
            <button
              type="button"
              onClick={deleteTask}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#f44336",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#eee",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#4CAF50",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {task ? "Save" : "Add Task"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
