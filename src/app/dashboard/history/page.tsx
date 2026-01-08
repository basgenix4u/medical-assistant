// src/app/dashboard/history/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Trash2, Search, Loader2, AlertCircle, FileText } from "lucide-react";
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
  recommendations?: string[];
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
    const { data } = await getConsultations();
    if (data) {
      setConsultations(data as ConsultationItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadConsultations();
    } else {
      setLoading(false);
    }
  }, [user, loadConsultations]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this consultation?")) return;

    setDeleting(id);
    const { error } = await deleteConsultation(id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted successfully");
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

  const getSeverityColor = (level?: number) => {
    if (!level) return { bg: "#f3f4f6", text: "#6b7280" };
    if (level <= 3) return { bg: "#dcfce7", text: "#16a34a" };
    if (level <= 6) return { bg: "#fef3c7", text: "#d97706" };
    if (level <= 8) return { bg: "#ffedd5", text: "#ea580c" };
    return { bg: "#fee2e2", text: "#dc2626" };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
        <div
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
          <Clock size={40} style={{ color: "var(--primary)" }} />
        </div>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Consultation History</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
          Sign in to view your consultation history.
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
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
        }}
      >
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "12px", color: "var(--primary)" }} />
        <p style={{ color: "var(--text-tertiary)" }}>Loading history...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Consultation History</h1>
        <p style={{ color: "var(--text-tertiary)" }}>View and manage your past symptom analyses</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: "24px" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symptoms..."
            style={{
              width: "100%",
              padding: "14px 14px 14px 44px",
              fontSize: "15px",
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              background: "var(--bg-secondary)",
              outline: "none",
            }}
          />
        </div>
      </motion.div>

      {/* Consultation List */}
      {filteredConsultations.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredConsultations.map((consultation, index) => {
            const severity = getSeverityColor(consultation.severity_level);

            return (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "20px",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    {/* Date and Severity */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-tertiary)", fontSize: "13px" }}>
                        <Calendar size={14} />
                        {formatDate(consultation.created_at)}
                      </div>
                      {consultation.severity_level && (
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                            background: severity.bg,
                            color: severity.text,
                          }}
                        >
                          Severity: {consultation.severity_level}/10
                        </span>
                      )}
                    </div>

                    {/* Symptoms */}
                    <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", textTransform: "capitalize" }}>
                      {consultation.symptoms.slice(0, 3).join(", ")}
                      {consultation.symptoms.length > 3 && ` +${consultation.symptoms.length - 3} more`}
                    </h3>

                    {/* Description Preview */}
                    {consultation.symptoms_description && (
                      <p
                        style={{
                          fontSize: "14px",
                          color: "var(--text-tertiary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "500px",
                        }}
                      >
                        {consultation.symptoms_description}
                      </p>
                    )}

                    {/* Warning Flags */}
                    {consultation.warning_flags && consultation.warning_flags.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", color: "#dc2626", fontSize: "13px" }}>
                        <AlertCircle size={14} />
                        {consultation.warning_flags.length} warning{consultation.warning_flags.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => handleDelete(consultation.id)}
                      disabled={deleting === consultation.id}
                      style={{
                        padding: "10px",
                        background: "none",
                        border: "none",
                        borderRadius: "10px",
                        cursor: deleting === consultation.id ? "not-allowed" : "pointer",
                        color: "var(--text-tertiary)",
                        transition: "all 0.2s ease",
                      }}
                      title="Delete"
                    >
                      {deleting === consultation.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
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
            border: "1px solid var(--border-light)",
          }}
        >
          <FileText size={48} style={{ color: "var(--text-tertiary)", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
            {search ? "No results found" : "No consultations yet"}
          </h3>
          <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
            {search ? "Try a different search term" : "Start by analyzing your symptoms"}
          </p>
          {!search && (
            <Link
              href="/dashboard/analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 24px",
                background: "var(--primary)",
                color: "white",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Analyze Symptoms
            </Link>
          )}
        </motion.div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
