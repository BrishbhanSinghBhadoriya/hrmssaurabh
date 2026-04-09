// components/salary/EmployeeSalaryDashboard.tsx
// Path: (your Next.js frontend)/components/salary/EmployeeSalaryDashboard.tsx

"use client";

import React, { useState, useEffect, CSSProperties } from "react";
import { SalaryResponse, KRARatingCategory, ApiResponse } from "@/types/Hrms";
import SalarySlipModal from "@/components/salary/Salaryslipmodal";

// ── Config ────────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const KRA_COLORS: Record<KRARatingCategory, { bg: string; text: string; border: string }> = {
  Excellent: { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  Good:      { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  Average:   { bg: "#fef9c3", text: "#a16207", border: "#fde047" },
  Poor:      { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  token: string;        // JWT token — apne auth context se pass karo
  employeeId?: string;  // optional — nahi diya to /api/salary/my use karega
}

// ── Component ─────────────────────────────────────────────────────────────────
const EmployeeSalaryDashboard: React.FC<Props> = ({ token, employeeId }) => {
  const now = new Date();
  const [month,    setMonth]    = useState(now.getMonth() + 1);
  const [year,     setYear]     = useState(now.getFullYear());
  const [data,     setData]     = useState<SalaryResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  const fetchSalary = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Employee ID diya hai to uski salary, warna apni
      const endpoint = employeeId
        ? `${API_URL}/api/salary/${employeeId}?month=${month}&year=${year}`
        : `${API_URL}/api/salary/my?month=${month}&year=${year}`;

      const res  = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json: ApiResponse<SalaryResponse> = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.message || "Data load nahi hua");
      }
    } catch (e) {
      setError("did not connect the Backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchSalary(); }, [month, year, token]);

  return (
    <div style={s.wrapper}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>💰 Salary Overview</h2>
          <p style={s.subtitle}>Attendance + KRA  basis  suggested salary</p>
        </div>
        <div style={s.filters}>
          <select value={month} onChange={e => setMonth(+e.target.value)} style={s.select}>
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} style={s.select}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── States ── */}
      {loading && <div style={s.loading}>⏳ Loading salary data...</div>}
      {error   && <div style={s.errorBox}>⚠️ {error}</div>}

      {!loading && !error && data && (
        <>
          {/* ── Attendance Stats ── */}
          <div style={s.statsGrid}>
            <StatCard icon="✅" label="Present"   value={data.salary.presentDays}       color="#22c55e" />
            <StatCard icon="🌗" label="Half Days" value={data.salary.halfDays}           color="#f59e0b" />
            <StatCard icon="❌" label="Absent"    value={data.salary.absentDays}         color="#ef4444" />
            <StatCard icon="⏰" label="Late Days" value={data.salary.lateDays}           color="#8b5cf6" />
          </div>

          {/* ── KRA Card ── */}
          {data.kra && (
            <div style={s.kraCard}>
              <div style={s.kraLeft}>
                <span style={s.kraLabel}>KRA Rating (Manager)</span>
                <div style={s.kraStars}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ fontSize: 22, color: star <= Math.round(data.kra!.average) ? "#f59e0b" : "#e5e7eb" }}>★</span>
                  ))}
                  <span style={s.kraAvg}>{data.kra.average}/5</span>
                </div>
              </div>
              <div style={{
                ...s.kraBadge,
                background: KRA_COLORS[data.kra.category]?.bg,
                color:      KRA_COLORS[data.kra.category]?.text,
                border:    `1px solid ${KRA_COLORS[data.kra.category]?.border}`,
              }}>
                {data.kra.category}
                <span style={s.kraBonus}>
                  {data.kra.bonus > 0 ? `+${data.kra.bonus}%` : `${data.kra.bonus}%`} Bonus
                </span>
              </div>
            </div>
          )}

          {/* ── Salary Breakdown ── */}
          <div style={s.salaryCard}>
            <h3 style={s.salaryTitle}>Salary Breakdown — {MONTHS[month]} {year}</h3>
            <div style={s.breakdownList}>
              <Row label="Basic Salary"                              value={data.salary.basicSalary}   />
              <Row label={`Earned (${data.salary.effectiveDays} days)`} value={data.salary.earnedSalary} />
              {data.salary.lateDeduction > 0 && <Row label="Late Deduction" value={-data.salary.lateDeduction} isDeduction />}
              {data.salary.kraAmount !== 0    && <Row label={`KRA ${data.salary.kraAmount >= 0 ? "Bonus" : "Penalty"}`} value={data.salary.kraAmount} isBonus={data.salary.kraAmount >= 0} />}
              <div style={s.divider} />
              <Row label="Gross Salary"  value={data.salary.grossSalary} isBold />
              <Row label="PF (12%)"      value={-data.salary.pf}         isDeduction />
              <Row label="TDS (10%)"     value={-data.salary.tds}        isDeduction />
              {data.salary.esic > 0 && <Row label="ESIC (0.75%)" value={-data.salary.esic} isDeduction />}
            </div>
            <div style={s.netSalary}>
              <span style={s.netLabel}>Net Salary (Take Home)</span>
              <span style={s.netAmount}>₹{(data.salary.netSalary ?? 0).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* ── Download Button ── */}
          <button style={s.downloadBtn} onClick={() => setShowSlip(true)}>
            📄 Salary Slip Download — {MONTHS[month]} {year}
          </button>
        </>
      )}

      {showSlip && data && (
        <SalarySlipModal data={data} month={month} year={year} onClose={() => setShowSlip(false)} />
      )}
    </div>
  );
};

export default EmployeeSalaryDashboard;

// ── Sub-Components ────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: string; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span style={{ ...s.statValue, color }}>{value}</span>
    <span style={s.statLabel}>{label}</span>
  </div>
);

const Row: React.FC<{ label: string; value: number; isDeduction?: boolean; isBonus?: boolean; isBold?: boolean }> = ({ label, value, isDeduction, isBonus, isBold }) => {
  const color = isDeduction ? "#ef4444" : isBonus ? "#22c55e" : "#111827";
  return (
    <div style={s.breakdownRow}>
      <span style={{ fontWeight: isBold ? 700 : 400, color: "#374151" }}>{label}</span>
      <span style={{ fontWeight: isBold ? 700 : 500, color }}>
        {value < 0 ? "-" : ""}₹{(Math.abs(value ?? 0)).toLocaleString("en-IN")}
      </span>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  wrapper:       { fontFamily: "'Sora','Segoe UI',sans-serif", maxWidth: 720, margin: "0 auto", padding: 24 },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title:         { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  subtitle:      { fontSize: 13, color: "#6b7280", marginTop: 4 },
  filters:       { display: "flex", gap: 8 },
  select:        { border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: "#fff", color: "#374151" },
  loading:       { textAlign: "center", padding: 40, color: "#9ca3af" },
  errorBox:      { background: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 },
  statsGrid:     { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 },
  statCard:      { background: "#fff", borderRadius: 10, padding: "14px 12px", textAlign: "center", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 1px 4px rgba(0,0,0,.06)" },
  statValue:     { fontSize: 26, fontWeight: 800 },
  statLabel:     { fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".5px" },
  kraCard:       { background: "#fff", borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,.06)", marginBottom: 16 },
  kraLeft:       { display: "flex", flexDirection: "column", gap: 6 },
  kraLabel:      { fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".5px" },
  kraStars:      { display: "flex", alignItems: "center", gap: 2 },
  kraAvg:        { marginLeft: 8, fontSize: 14, fontWeight: 700, color: "#374151" },
  kraBadge:      { borderRadius: 10, padding: "10px 18px", textAlign: "center", fontWeight: 700, fontSize: 16, display: "flex", flexDirection: "column", gap: 4 },
  kraBonus:      { fontSize: 12, fontWeight: 600 },
  salaryCard:    { background: "#fff", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", marginBottom: 16 },
  salaryTitle:   { fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 },
  breakdownList: { display: "flex", flexDirection: "column", gap: 10 },
  breakdownRow:  { display: "flex", justifyContent: "space-between", fontSize: 14 },
  divider:       { height: 1, background: "#f3f4f6", margin: "4px 0" },
  netSalary:     { marginTop: 16, background: "linear-gradient(135deg,#1e3a5f,#2563eb)", borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  netLabel:      { color: "rgba(255,255,255,.85)", fontSize: 14, fontWeight: 500 },
  netAmount:     { color: "#fff", fontSize: 26, fontWeight: 800 },
  downloadBtn:   { width: "100%", padding: "14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
