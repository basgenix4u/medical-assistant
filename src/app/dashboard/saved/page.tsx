"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bookmark, Trash2, Loader2, Star, Clock, Leaf, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getSavedRemedies, unsaveRemedy } from "@/lib/database";
import Link from "next/link";
import toast from "react-hot-toast";

interface SavedRemedyItem {
  id: string;
  remedy_id: string;
  notes?: string;
  created_at?: string;
  remedies: {
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
  } | null;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  herbal: { bg: "#dcfce7", text: "#166534" },
  home: { bg: "#dbeafe", text: "#1e40af" },
  ayurvedic: { bg: "#ffedd5", text: "#c2410c" },
  traditional: { bg: "#f3e8ff", text: "#7e22ce" },
};

export default function SavedRemediesPage() {
  const { user } = useAuth();
  const [savedRemedies, setSavedRemedies] = useState<SavedRemedyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadSavedRemedies = useCallback(async () => {
    setLoading(true);
    const { data } = await getSavedRemedies();
    if (data && Array.isArray(data)) {
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
      toast.error("Failed to remove");
    } else {
      toast.success("Removed from saved");
      setSavedRemedies(savedRemedies.filter((item) => item.remedy_id !== remedyId));
    }
    setDeleting(null);
  };

  const getRemedyTypeColor = (type: string) => {
    return TYPE_COLORS[type] || { bg: "#f3f4f6", text: "#374151" };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
          <Bookmark size={40} style={{ color: "var(--primary)" }} aria-hidden="true" />
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
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Saved Remedies</h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          Your favorite remedies for quick reference.
        </p>
      </motion.div>

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
          <Loader2 size={32} className="animate-spin" style={{ marginBottom: "12px" }} aria-hidden="true" />
          <p>Loading saved remedies...</p>
        </div>
      ) : savedRemedies.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {savedRemedies.map((item, index) => {
            const remedy = item.remedies;
            if (!remedy) return null;
            const typeColor = getRemedyTypeColor(remedy.remedy_type);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "14px",
                  padding: "20px",
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
                    {/* Header row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: typeColor.bg,
                          color: typeColor.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {remedy.remedy_type}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "13px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        <Star
                          size={14}
                          style={{ color: "#f59e0b", fill: "#f59e0b" }}
                          aria-hidden="true"
                        />
                        {remedy.effectiveness_rating.toFixed(1)}
                      </div>
                      {item.created_at && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          <Clock size={12} aria-hidden="true" />
                          Saved {formatDate(item.created_at)}
                        </div>
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "8px",
                      }}
                    >
                      {remedy.name}
                    </h3>

                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                        marginBottom: "10px",
                      }}
                    >
                      {remedy.short_description || remedy.description}
                    </p>

                    {item.notes && (
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "var(--info-bg)",
                          borderLeft: "3px solid var(--info)",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          marginBottom: "10px",
                        }}
                      >
                        <strong style={{ color: "var(--text-primary)" }}>Your note:</strong>{" "}
                        {item.notes}
                      </div>
                    )}

                    {remedy.ingredients && remedy.ingredients.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        <Leaf size={14} style={{ color: "var(--primary)" }} aria-hidden="true" />
                        <span>
                          {remedy.ingredients.slice(0, 3).join(", ")}
                          {remedy.ingredients.length > 3 && ` +${remedy.ingredients.length - 3} more`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUnsave(item.remedy_id)}
                    disabled={deleting === item.remedy_id}
                    aria-label="Remove from saved"
                    title="Remove"
                    style={{
                      padding: "8px",
                      background: "none",
                      border: "none",
                      borderRadius: "8px",
                      cursor: deleting === item.remedy_id ? "not-allowed" : "pointer",
                      color: deleting === item.remedy_id ? "var(--text-tertiary)" : "#dc2626",
                      flexShrink: 0,
                      transition: "background 0.2s ease",
                    }}
                  >
                    {deleting === item.remedy_id ? (
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 size={18} aria-hidden="true" />
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
            border: "1px dashed var(--border-default)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Bookmark size={32} style={{ color: "var(--primary)" }} aria-hidden="true" />
          </div>
          <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>No saved remedies</h3>
          <p style={{ color: "var(--text-tertiary)", marginBottom: "20px" }}>
            Browse the library and save your favorites.
          </p>
          <Link
            href="/dashboard/remedies"
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
            <Plus size={16} aria-hidden="true" />
            Browse remedies
          </Link>
        </motion.div>
      )}
    </div>
  );
}
