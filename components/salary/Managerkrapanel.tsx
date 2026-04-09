// components/salary/ManagerKRAPanel.tsx
// Path: (your Next.js frontend)/components/salary/ManagerKRAPanel.tsx

"use client";

import React, { useState, CSSProperties } from "react";
import { IKRA, ApiResponse } from "@/types/Hrms";

const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/+$/, '');
const API_URL = `${NEXT_PUBLIC_API_URL}/`;

interface Employee { _id: string; name: string; employeeId: string; }

interface Props {
  token:     string;
  employees: Employee[];
}

interface Alert { type: "success" | "error"; text: string; }

const ManagerKRAPanel: React.FC<Props> = ({ token, employees }) => {
  const [empId,   setEmpId]   = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [alert,   setAlert]   = useState<Alert | null>(null);

  const handleSave = async () => {
    if (!empId || !rating) {
      setAlert({ type: "error", text: "Employee aur rating select karo!" });
      return;
    }
    setSaving(true);
    try {
      const payload = { employeeId: empId, date, rating, comment };
      let res;
      try {
        res = await fetch(`${API_URL}kra/mark`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("API call failed");
      } catch (err) {
        res = await fetch(`${API_URL}kra/markDailyKRA`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
      
      const json: ApiResponse<IKRA> = await res.json();

      if (json.success || (json as any).status === "success") {
        setAlert({
          type: "success",
          text: `✅ KRA saved!`,
        });
        setRating(0);
        setComment("");
      } else {
        setAlert({ type: "error", text: json.message || "Save karne mein error" });
      }
    } catch {
      setAlert({ type: "error", text: "Network error!" });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <div style={s.wrap}>
      <h3 style={s.title}>📊 KRA Rating — Manager Panel</h3>

      <Field label="Employee">
        <select value={empId} onChange={e => setEmpId(e.target.value)} style={s.input}>
          <option value="">-- Employee chuno --</option>
          {employees.map(e => <option key={e._id} value={e._id}>{e.employeeId} - {e.name}</option>)}
        </select>
      </Field>

      <Field label="Date">
        <input
          type="date"
          value={date}
          max={new Date().toISOString().split("T")[0]}
          onChange={e => setDate(e.target.value)}
          style={s.input}
        />
      </Field>

      <Field label="Rating (1–5)">
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{ fontSize: 34, cursor: "pointer", userSelect: "none", color: star <= (hovered || rating) ? "#f59e0b" : "#e5e7eb", transition: "color .1s" }}
            >★</span>
          ))}
          {rating > 0 && (
            <span style={{ marginLeft: 6, fontSize: 13, color: "#6b7280" }}>
              {["","Poor","Below Avg","Average","Good","Excellent"][rating]}
            </span>
          )}
        </div>
      </Field>

      <Field label="Comment (Optional)">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Is din ka performance kaisa raha..."
          style={{ ...s.input, resize: "vertical" }}
        />
      </Field>

      {alert && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13,
          background: alert.type === "success" ? "#dcfce7" : "#fee2e2",
          color:      alert.type === "success" ? "#15803d"  : "#b91c1c",
        }}>
          {alert.text}
        </div>
      )}

      <button
        onClick={() => void handleSave()}
        disabled={saving}
        style={{ ...s.btn, background: saving ? "#9ca3af" : "#1e3a5f", cursor: saving ? "not-allowed" : "pointer" }}
      >
        {saving ? "Saving..." : "✅ KRA Rating Save Karo"}
      </button>
    </div>
  );
};

export default ManagerKRAPanel;

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>
      {label}
    </label>
    {children}
  </div>
);

const s: Record<string, CSSProperties> = {
  wrap:  { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)", maxWidth: 480 },
  title: { fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#111827" },
  input: { width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#374151", background: "#fafafa", outline: "none" },
  btn:   { width: "100%", padding: "12px", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700 },
};