"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getConsultations, deleteConsultation } from "@/lib/database";
import Link from "next/link";
import toast from "react-hot-toast";

interface ConsultationItem {
  id: string;
  symptoms: string[];
  symptoms_description?: string;
  severity_level?: number;
  ai_severity?: string;
  created_at?: string;
  warning_flags?: string[];
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadConsultations = useCallback(async () => {
    setLoading(true);
    const { data } = await getConsultations(50);
    if (data && Array.isArray(data)) setConsultations(data as ConsultationItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadConsultations();
    } else {
      setLoading(false);
    }
  }, [user, loadConsultations]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this consultation from your history?")) return;
    setDeleting(id);
    const { error } = await deleteConsultation(id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted");
      setConsultations(consultations.filter((c) => c.id !== id));
    }
    setDeleting(null);
  };

  const filteredConsultations = consultations.filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      item.symptoms.some((s) => s.toLowerCase().includes(searchLower)) ||
      item.symptoms_description?.toLowerCase().includes(searchLower)
    );
  });

  if (!user) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
          padding: "60px 20px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "80px",
            height: "80px",
            background: "var(--accent)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <Clock size={40} style={{ color: "var(--primary)" }} aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Consultation History</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
          Sign in to view your past symptom analyses.
        </p>
        <Link
          href="/auth/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "14px 28px",
            background: "var(--primary)",
            color: "white",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px" }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Consultation History</h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          {consultations.length === 0
            ? "Your past analyses will appear here."
            : `${consultations.length} ${consultations.length === 1 ? "analysis" : "analyses"} saved`}
        </p>
      </motion.div>

      {consultations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: "24px", position: "relative" }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
            }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by symptom or description..."
            aria-label="Search history"
            style={{
              width: "100%",
              padding: "12px 14px 12px 44px",
              fontSize: "15px",
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              background: "var(--bg-tertiary)",
              outline: "none",
            }}
          />
        </motion.div>
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 20px",
            color: "var(--text-tertiary)",
          }}
        >
          <Loader2
            size={32}
            className="animate-spin"
            style={{ marginBottom: "12px" }}
            aria-hidden="true"
          />
          <p>Loading your history...</p>
        </div>
      ) : filteredConsultations.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredConsultations.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                borderRadius: "14px",
                padding: "18px 20px",
                transition: "border-color 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Date + severity row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--text-tertiary)",
                        fontSize: "12px",
                      }}
                    >
                      <Calendar size={12} aria-hidden="true" />
                      {c.created_at
                        ? new Date(c.created_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown"}
                    </div>
                    {c.severity_level && (
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background:
                            c.severity_level <= 3
                              ? "var(--success-bg)"
                              : c.severity_level <= 6
                              ? "var(--warning-bg)"
                              : "var(--error-bg)",
                          color:
                            c.severity_level <= 3
                              ? "#166534"
                              : c.severity_level <= 6
                              ? "#854d0e"
                              : "#991b1b",
                        }}
                      >
                        Severity {c.severity_level}/10
                      </span>
                    )}
                    {c.warning_flags && c.warning_flags.length > 0 && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: "var(--error-bg)",
                          color: "#991b1b",
                        }}
                      >
                        <AlertCircle size={11} aria-hidden="true" />
                        {c.warning_flags.length} warning
                        {c.warning_flags.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Symptoms */}
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                      textTransform: "capitalize",
                    }}
                  >
                    {Array.isArray(c.symptoms) && c.symptoms.length > 0
                      ? c.symptoms.slice(0, 3).join(", ") +
                        (c.symptoms.length > 3
                          ? ` +${c.symptoms.length - 3} more`
                          : "")
                      : "Analysis"}
                  </div>

                  {c.symptoms_description && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-tertiary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {c.symptoms_description}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting === c.id}
                  aria-label="Delete consultation"
                  style={{
                    padding: "8px",
                    background: "none",
                    border: "none",
                    borderRadius: "8px",
                    cursor: deleting === c.id ? "not-allowed" : "pointer",
                    color: "var(--text-tertiary)",
                    flexShrink: 0,
                    transition: "color 0.2s ease",
                  }}
                  title="Delete"
                >
                  {deleting === c.id ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--bg-tertiary)",
            borderRadius: "16px",
            border: "1px dashed var(--border-default)",
          }}
        >
          <FileText
            size={48}
            style={{
              color: "var(--text-tertiary)",
              margin: "0 auto 16px",
              display: "block",
            }}
            aria-hidden="true"
          />
          <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
            {search ? "No matches" : "No consultations yet"}
          </h3>
          <p style={{ color: "var(--text-tertiary)", marginBottom: "20px" }}>
            {search
              ? "Try a different search term"
              : "Start by analyzing your first symptom"}
          </p>
          {!search && (
            <Link
              href="/dashboard/analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "var(--primary)",
                color: "white",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Start analysis
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
