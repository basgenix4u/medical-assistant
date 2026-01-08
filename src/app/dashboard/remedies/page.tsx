// src/app/(dashboard)/remedies/page.tsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Leaf,
  Home,
  Sparkles,
  Star,
  Clock,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface Remedy {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  preparation_method: string;
  usage_instructions: string;
  precautions: string;
  remedy_type: string;
  effectiveness_rating: number;
}

const REMEDY_TYPES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "herbal", label: "Herbal", icon: Leaf },
  { id: "home", label: "Home", icon: Home },
  { id: "ayurvedic", label: "Ayurvedic", icon: Star },
  { id: "traditional", label: "Traditional", icon: Clock },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  herbal: { bg: "#dcfce7", text: "#166534" },
  home: { bg: "#dbeafe", text: "#1e40af" },
  ayurvedic: { bg: "#ffedd5", text: "#c2410c" },
  traditional: { bg: "#f3e8ff", text: "#7e22ce" },
};

export default function RemediesPage() {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [selectedRemedy, setSelectedRemedy] = useState<Remedy | null>(null);

  // Fetch remedies
  useEffect(() => {
    async function fetchRemedies() {
      try {
        const response = await fetch("/api/remedies");
        const data = await response.json();
        setRemedies(data);
      } catch (error) {
        console.error("Failed to fetch remedies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRemedies();
  }, []);

  // Filter remedies
  const filteredRemedies = remedies.filter((remedy) => {
    const matchesSearch =
      remedy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remedy.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeType === "all" || remedy.remedy_type === activeType;
    return matchesSearch && matchesType;
  });

  // Get type color
  const getTypeColor = (type: string) => {
    return TYPE_COLORS[type] || { bg: "#f3f4f6", text: "#374151" };
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "24px" }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Natural Remedies</h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          Browse our collection of traditional and home remedies
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: "24px" }}
      >
        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search remedies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 14px 14px 44px",
              fontSize: "15px",
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              background: "var(--bg-tertiary)",
              outline: "none",
            }}
          />
        </div>

        {/* Type Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {REMEDY_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                background: activeType === type.id ? "var(--primary)" : "var(--bg-tertiary)",
                color: activeType === type.id ? "white" : "var(--text-secondary)",
                transition: "all 0.2s ease",
              }}
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Remedies Grid */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            color: "var(--text-tertiary)",
          }}
        >
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
          <p>Loading remedies...</p>
        </div>
      ) : filteredRemedies.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-tertiary)",
          }}
        >
          <Leaf size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
          <p>No remedies found matching your search.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredRemedies.map((remedy, index) => (
            <motion.div
              key={remedy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedRemedy(remedy)}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Leaf size={22} style={{ color: "var(--primary)" }} />
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: getTypeColor(remedy.remedy_type).bg,
                    color: getTypeColor(remedy.remedy_type).text,
                    textTransform: "capitalize",
                  }}
                >
                  {remedy.remedy_type}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "8px" }}>
                {remedy.name}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-tertiary)",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                }}
              >
                {remedy.description.slice(0, 100)}...
              </p>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Star size={16} style={{ color: "#facc15", fill: "#facc15" }} />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>
                  {remedy.effectiveness_rating?.toFixed(1) || "4.5"}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>rating</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Remedy Detail Modal */}
      {selectedRemedy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 100,
          }}
          onClick={() => setSelectedRemedy(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-tertiary)",
              borderRadius: "20px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              padding: "28px",
            }}
          >
            {/* Close Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <button
                onClick={() => setSelectedRemedy(null)}
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-secondary)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Leaf size={28} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "22px", marginBottom: "4px" }}>{selectedRemedy.name}</h2>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    background: getTypeColor(selectedRemedy.remedy_type).bg,
                    color: getTypeColor(selectedRemedy.remedy_type).text,
                    textTransform: "capitalize",
                  }}
                >
                  {selectedRemedy.remedy_type}
                </span>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "24px" }}>
              {selectedRemedy.description}
            </p>

            {/* Ingredients */}
            {selectedRemedy.ingredients && selectedRemedy.ingredients.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>
                  Ingredients
                </h4>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {selectedRemedy.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "6px" }}
                    >
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparation */}
            {selectedRemedy.preparation_method && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>
                  Preparation
                </h4>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {selectedRemedy.preparation_method}
                </p>
              </div>
            )}

            {/* Usage */}
            {selectedRemedy.usage_instructions && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle size={16} style={{ color: "var(--success)" }} />
                  How to Use
                </h4>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {selectedRemedy.usage_instructions}
                </p>
              </div>
            )}

            {/* Precautions */}
            {selectedRemedy.precautions && (
              <div
                style={{
                  padding: "16px",
                  background: "#fef9c3",
                  border: "1px solid #fde047",
                  borderRadius: "12px",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#854d0e",
                  }}
                >
                  <AlertTriangle size={16} />
                  Precautions
                </h4>
                <p style={{ fontSize: "13px", color: "#854d0e", lineHeight: 1.6 }}>
                  {selectedRemedy.precautions}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}