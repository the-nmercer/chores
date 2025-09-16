"use client";

import React from "react";
import { Check, Edit2 } from "lucide-react";

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

type Props = {
  tasks: Task[];
  categories: Category[];
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
};

export default function TaskTable({ tasks, categories, onComplete, onEdit }: Props) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [sortColumn, setSortColumn] = React.useState<keyof Task | "status" | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function getStatusColor(task: Task) {
    if (!task.last_completed) return "#e0e0e0";
    const daysSince = (new Date().getTime() - new Date(task.last_completed).getTime()) / (1000 * 60 * 60 * 24);
    const fraction = daysSince / task.frequency_days;
    if (fraction > 1) return "#f28b82";
    if (fraction > 0.9) return "#fbbc04";
    if (fraction > 0.75) return "#fff475";
    return "#ccff90";
  }

  function getStatusText(task: Task) {
    if (!task.last_completed) return "Not Completed";
    const daysSince = (new Date().getTime() - new Date(task.last_completed).getTime()) / (1000 * 60 * 60 * 24);
    const fraction = daysSince / task.frequency_days;
    if (fraction > 1) return "Overdue";
    if (fraction > 0.9) return "Almost Due";
    if (fraction > 0.75) return "Due Soon";
    return "On Track";
  }

  function handleSort(column: keyof Task | "status") {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const sortedTasks = React.useMemo(() => {
    if (!sortColumn) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === "status") {
        const aDue = a.last_completed ? new Date(a.last_completed).getTime() + a.frequency_days * 86400000 : 0;
        const bDue = b.last_completed ? new Date(b.last_completed).getTime() + b.frequency_days * 86400000 : 0;
        aValue = aDue;
        bValue = bDue;
      } else {
        aValue = a[sortColumn] ?? "";
        bValue = b[sortColumn] ?? "";
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [tasks, sortColumn, sortDirection]);

  const headers = [
    { label: "Task", key: "name" },
    { label: "Description", key: "description" },
    { label: "Frequency (days)", key: "frequency_days" },
    { label: "Last Completed", key: "last_completed" },
    { label: "Status", key: "status" },
    { label: "Category", key: "category_id" },
    { label: "Completed By", key: "completed_by" },
    { label: "Actions", key: "actions" },
  ];

  if (isMobile) {
    // Mobile card layout
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: "1rem",
              backgroundColor: getStatusColor(task),
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0" }}>{task.name}</h3>
            {task.description && <p style={{ margin: "0 0 0.5rem 0" }}>{task.description}</p>}
            <p style={{ margin: "0.25rem 0" }}>
              <strong>Frequency:</strong> {task.frequency_days} days
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>Last Completed:</strong> {task.last_completed || "-"}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>Status:</strong> {getStatusText(task)}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>Category:</strong> {categories.find((c) => c.id === task.category_id)?.name || "Uncategorized"}
            </p>
            {task.completed_by && (
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Completed By:</strong> {task.completed_by}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button onClick={() => onComplete(task.id)} style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", backgroundColor: "#4CAF50", color: "#fff", border: "none", cursor: "pointer" }}>
                <Check size={18} />
              </button>
              <button onClick={() => onEdit(task)} style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", backgroundColor: "#2196F3", color: "#fff", border: "none", cursor: "pointer" }}>
                <Edit2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            {headers.map((header) => (
              <th
                key={header.label}
                style={{ textAlign: "left", padding: "0.75rem", borderBottom: "1px solid #ddd", cursor: header.key !== "actions" ? "pointer" : "default" }}
                onClick={() => header.key !== "actions" && handleSort(header.key as keyof Task | "status")}
              >
                {header.label}
                {sortColumn === header.key && (sortDirection === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => (
            <tr key={task.id} style={{ backgroundColor: getStatusColor(task), transition: "background-color 0.3s" }}>
              <td style={{ padding: "0.5rem" }}>{task.name}</td>
              <td style={{ padding: "0.5rem" }}>{task.description}</td>
              <td style={{ padding: "0.5rem" }}>{task.frequency_days}</td>
              <td style={{ padding: "0.5rem" }}>{task.last_completed || "-"}</td>
              <td style={{ padding: "0.5rem", fontWeight: 500 }}>{getStatusText(task)}</td>
              <td style={{ padding: "0.5rem" }}>{categories.find((c) => c.id === task.category_id)?.name || "Uncategorized"}</td>
              <td style={{ padding: "0.5rem" }}>{task.completed_by || "-"}</td>
              <td style={{ padding: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button onClick={() => onComplete(task.id)} style={{ padding: "0.25rem", borderRadius: "4px", backgroundColor: "#4CAF50", color: "#fff", border: "none", cursor: "pointer" }}>
                    <Check size={16} />
                  </button>
                  <button onClick={() => onEdit(task)} style={{ padding: "0.25rem", borderRadius: "4px", backgroundColor: "#2196F3", color: "#fff", border: "none", cursor: "pointer" }}>
                    <Edit2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
