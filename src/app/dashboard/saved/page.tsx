// src/app/dashboard/saved/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bookmark, Trash2, Loader2, Star, Clock, Leaf } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getSavedRemedies, unsaveRemedy } from "@/lib/database";
import Link from "next/link";
import toast from "react-hot-toast";

interface RemedyData {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  remedy_type: string;
  effectiveness_rating: number;
  ingredients?: string[];
  preparation_method?: string;
  usage_instructions?: string;
  precautions?: string;
  tags?: string[];
}

interface SavedRemedyItem {
  id: string;
  remedy_id: string;
  notes?: string;
  created_at?: string;
  remedies: RemedyData | null;
}

export default function SavedRemediesPage() {
  const { user } = useAuth();
  const [savedRemedies, setSavedRemedies] = useState<SavedRemedyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadSavedRemedies = useCallback(async () => {
    setLoading(true);
    const { data } = await getSavedRemedies();
    if (data) {
      setSavedRemedies(data as unknown as SavedRemedyItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadSavedRemedies();
    } else {
      setLoading(false);
    }
  }, [user, loadSavedRemedies]);

  const handleUnsave = async (remedyId: string) => {
    setDeleting(remedyId);
    const { error } = await unsaveRemedy(remedyId);

    if (error) {
      toast.error("Failed to remove remedy");
    } else {
      toast.success("Remedy removed");
      setSavedRemedies(savedRemedies.filter((item) => item.remedy_id !== remedyId));
    }
    setDeleting(null);
  };

  const getRemedyTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      herbal: { bg: "#dcfce7", text: "#16a34a" },
      home: { bg: "#fef3c7", text: "#d97706" },
      ayurvedic: { bg: "#fce7f3", text: "#db2777" },
      traditional: { bg: "#e0e7ff", text: "#4f46e5" },
      chinese: { bg: "#fee2e2", text: "#dc2626" },
      naturopathic: { bg: "#d1fae5", text: "#059669" },
    };
    return colors[type] || { bg: "#f3f4f6", text: "#6b7280" };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
          <Bookmark size={40} style={{ color: "var(--primary)" }} />
        </div>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Saved Remedies</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
          Sign in to view your saved remedies.
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
        <p style={{ color: "var(--text-tertiary)" }}>Loading saved remedies...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Saved Remedies</h1>
        <p style={{ color: "var(--text-tertiary)" }}>Your collection of favorite natural remedies</p>
      </motion.div>

      {savedRemedies.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {savedRemedies.map((item, index) => {
            const remedy = item.remedies;
            if (!remedy) return null;

            const typeColor = getRemedyTypeColor(remedy.remedy_type);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    {/* Type Badge and Rating */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 500,
                          background: typeColor.bg,
                          color: typeColor.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {remedy.remedy_type}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--text-tertiary)" }}>
                        <Star size={14} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                        {remedy.effectiveness_rating.toFixed(1)}
                      </div>
                      {item.created_at && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-tertiary)" }}>
                          <Clock size={12} />
                          Saved {formatDate(item.created_at)}
                        </div>
                      )}
                    </div>

                    {/* Remedy Name */}
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{remedy.name}</h3>

                    {/* Description */}
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>
                      {remedy.short_description || remedy.description.slice(0, 150)}
                      {remedy.description.length > 150 && "..."}
                    </p>

                    {/* User Notes */}
                    {item.notes && (
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "var(--bg-secondary)",
                          borderRadius: "10px",
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <strong>Your note:</strong> {item.notes}
                      </div>
                    )}

                    {/* Ingredients Preview */}
                    {remedy.ingredients && remedy.ingredients.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                        <Leaf size={14} style={{ color: "var(--primary)" }} />
                        <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                          {remedy.ingredients.slice(0, 3).join(", ")}
                          {remedy.ingredients.length > 3 && ` +${remedy.ingredients.length - 3} more`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleUnsave(item.remedy_id)}
                    disabled={deleting === item.remedy_id}
                    style={{
                      padding: "10px",
                      background: deleting === item.remedy_id ? "var(--bg-secondary)" : "none",
                      border: "none",
                      borderRadius: "10px",
                      cursor: deleting === item.remedy_id ? "not-allowed" : "pointer",
                      color: deleting === item.remedy_id ? "var(--text-tertiary)" : "#dc2626",
                      transition: "all 0.2s ease",
                    }}
                    title="Remove from saved"
                  >
                    {deleting === item.remedy_id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
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
          <Bookmark size={48} style={{ color: "var(--text-tertiary)", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>No saved remedies</h3>
          <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
            Browse remedies and save your favorites for quick access
          </p>
          <Link
            href="/dashboard/remedies"
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
            Browse Remedies
          </Link>
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
