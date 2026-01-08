// src/app/dashboard/analyze/page.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Save,
  RotateCcw,
  Stethoscope
} from "lucide-react";
import { saveConsultation } from "@/lib/database";
import toast from "react-hot-toast";
import Link from "next/link";

// --- TYPES ---
interface Symptom {
  id: string;
  name: string;
  category: string;
  body_part: string;
}

interface Remedy {
  id: string;
  name: string;
  description: string;
  remedy_type: string;
}

interface AnalysisResult {
  severity_assessment: string;
  confidence_score: number;
  summary: string;
  conditions: Array<{ name: string; probability: number; description: string; severity: string }>;
  recommendations: string[];
  remedies: Remedy[];
  warnings: string[];
  see_doctor: { recommended: boolean; urgency: string; reason: string };
}

export default function AnalyzePage() {
  // --- STATE ---
  const [step, setStep] = useState<"select" | "details" | "analyzing" | "results">("select");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Details State
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(5);
  
  // Processing State
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  // --- EFFECTS ---
  useEffect(() => {
    async function fetchSymptoms() {
      try {
        const response = await fetch("/api/symptoms");
        const data = await response.json();
        setSymptoms(data);
      } catch (err) {
        console.error("Failed to fetch symptoms:", err);
        // Fallback data if API fails
        setSymptoms([
          { id: "1", name: "Headache", category: "Neurological", body_part: "Head" },
          { id: "2", name: "Fever", category: "General", body_part: "Body" },
          { id: "3", name: "Cough", category: "Respiratory", body_part: "Chest" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchSymptoms();
  }, []);

  // --- HELPERS ---
  const filteredSymptoms = symptoms.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSymptoms = filteredSymptoms.reduce((acc, symptom) => {
    const category = symptom.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(symptom);
    return acc;
  }, {} as Record<string, Symptom[]>);

  const toggleSymptom = (symptom: Symptom) => {
    const exists = selectedSymptoms.find((s) => s.id === symptom.id);
    if (exists) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s.id !== symptom.id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const getSeverityStyle = (sev: string) => {
    const s = sev?.toLowerCase() || "mild";
    if (s.includes("emergency") || s.includes("severe")) return { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" };
    if (s.includes("moderate")) return { bg: "#fef9c3", color: "#854d0e", border: "#fde047" };
    return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
  };

  // --- ACTIONS ---
  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom");
      return;
    }

    setError("");
    setStep("analyzing");
    setAnalyzing(true);

    try {
      // 1. Call AI API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms.map((s) => ({ name: s.name })), // Send just names or objects based on your API
          description,
          duration,
          severity,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      const analysisResult = data.analysis || data; // Handle different API response structures
      
      setResult(analysisResult);

      // 2. Save to Database History
      await saveToHistory(analysisResult);

      setStep("results");
    } catch (err) {
      console.error(err);
      setError("Failed to analyze symptoms. Please try again.");
      setStep("details");
    } finally {
      setAnalyzing(false);
    }
  };

    const saveToHistory = async (aiResult: AnalysisResult) => {
    try {
      console.log("Attempting to save history...");

      // Ensure data is safe for Database (no undefined values)
      const consultationData = {
        symptoms: selectedSymptoms.map(s => s.name),
        symptoms_description: description || "",
        duration: duration || "Unknown",
        severity_level: severity,
        ai_analysis: aiResult, // JSONB
        ai_severity: aiResult.severity_assessment || "unknown",
        conditions_identified: aiResult.conditions || [],
        recommendations: aiResult.recommendations || [],
        suggested_remedies: aiResult.remedies || [],
        warning_flags: aiResult.warnings || [],
        follow_up_recommended: aiResult.see_doctor?.recommended || false,
      };

      console.log("Payload:", consultationData);

      const { data, error } = await saveConsultation(consultationData);
      
      if (error) {
        // Log the full error structure to see what's wrong
        console.error("Supabase Save Error:", JSON.stringify(error, null, 2));
        toast.error(`Save failed: ${error.message || "Unknown database error"}`);
      } else {
        console.log("Saved successfully:", data);
        toast.success("Analysis saved to history!");
      }
    } catch (e) {
      console.error("Unexpected Save Exception:", e);
      toast.error("An unexpected error occurred while saving.");
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setDescription("");
    setDuration("");
    setSeverity(5);
    setResult(null);
    setError("");
    setStep("select");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "24px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
          {step !== "select" && step !== "analyzing" && (
            <button
              onClick={() => setStep(step === "results" ? "details" : "select")}
              style={{
                width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "8px", cursor: "pointer"
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Symptom Checker</h1>
        </div>
      </motion.div>

      {/* Progress Bar */}
      {step !== "analyzing" && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["select", "details", "results"].map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1, height: "4px", borderRadius: "2px",
                background: step === s || (step === "results" && i < 2) || (step === "details" && i < 1)
                  ? "var(--primary)" : "var(--border-light)",
                transition: "background 0.3s ease"
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STEP 1: SELECT SYMPTOMS */}
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder="Search symptoms (e.g., headache, fever)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "14px 14px 14px 44px", fontSize: "15px",
                  border: "1px solid var(--border-light)", borderRadius: "12px", background: "var(--bg-tertiary)", outline: "none"
                }}
              />
            </div>

            {/* Selected Tags */}
            {selectedSymptoms.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {selectedSymptoms.map((symptom) => (
                  <div key={symptom.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "var(--primary)", borderRadius: "20px", fontSize: "14px", color: "white" }}>
                    {symptom.name}
                    <button onClick={() => toggleSymptom(symptom)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex" }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && <div style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}

            {/* Symptom List */}
            <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", overflow: "hidden", maxHeight: "500px", overflowY: "auto" }}>
              {loading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <Loader2 className="animate-spin" style={{ margin: "0 auto", color: "var(--primary)" }} />
                  <p style={{ marginTop: "10px", color: "var(--text-tertiary)" }}>Loading symptoms...</p>
                </div>
              ) : (
                Object.entries(groupedSymptoms).map(([category, list]) => (
                  <div key={category}>
                    <div style={{ padding: "10px 20px", background: "var(--bg-secondary)", fontSize: "13px", fontWeight: "bold", color: "var(--text-tertiary)", textTransform: "uppercase" }}>{category}</div>
                    <div style={{ padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {list.map((symptom) => {
                        const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
                        return (
                          <button
                            key={symptom.id}
                            onClick={() => toggleSymptom(symptom)}
                            style={{
                              padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-light)",
                              background: isSelected ? "var(--accent)" : "var(--bg-primary)",
                              color: isSelected ? "var(--primary)" : "var(--text-primary)",
                              cursor: "pointer", fontSize: "14px", transition: "all 0.2s"
                            }}
                          >
                            {symptom.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Next Button */}
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  if (selectedSymptoms.length === 0) setError("Select at least one symptom");
                  else setStep("details");
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px",
                  background: "var(--primary)", color: "white", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: 500
                }}
              >
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ADD DETAILS */}
        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "24px" }}>
              
              {/* Severity Slider */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Severity (1-10)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <input
                    type="range" min="1" max="10" value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--primary)" }}
                  />
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--primary)", width: "30px", textAlign: "center" }}>{severity}</span>
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>How long have you had these symptoms?</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["Less than a day", "1-2 days", "3-5 days", "1 week", "2+ weeks"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setDuration(opt)}
                      style={{
                        padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-light)",
                        background: duration === opt ? "var(--primary)" : "var(--bg-secondary)",
                        color: duration === opt ? "white" : "var(--text-primary)",
                        cursor: "pointer"
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Additional Notes (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your symptoms in more detail..."
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-light)",
                    background: "var(--bg-secondary)", minHeight: "100px", outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Analyze Button */}
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep("select")} style={{ padding: "14px 24px", background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Back</button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px",
                  background: "var(--primary)", color: "white", borderRadius: "12px", border: "none",
                  cursor: analyzing ? "not-allowed" : "pointer", fontWeight: 500, opacity: analyzing ? 0.7 : 1
                }}
              >
                {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Stethoscope size={18} />}
                {analyzing ? "Analyzing..." : "Analyze Symptoms"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: LOADING SCREEN */}
        {step === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "60px 20px" }}>
            <Loader2 size={48} className="animate-spin" style={{ margin: "0 auto 20px", color: "var(--primary)" }} />
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Analyzing your symptoms...</h2>
            <p style={{ color: "var(--text-tertiary)" }}>Our AI is consulting medical databases to find the best remedies for you.</p>
          </motion.div>
        )}

        {/* STEP 4: RESULTS */}
        {step === "results" && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            
            {/* Severity Card */}
            <div style={{
              background: getSeverityStyle(result.severity_assessment).bg,
              border: `1px solid ${getSeverityStyle(result.severity_assessment).border}`,
              borderRadius: "16px", padding: "20px", marginBottom: "24px",
              display: "flex", alignItems: "center", gap: "16px"
            }}>
              <AlertTriangle size={32} style={{ color: getSeverityStyle(result.severity_assessment).color }} />
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: getSeverityStyle(result.severity_assessment).color, textTransform: "capitalize" }}>
                  {result.severity_assessment} Severity
                </h3>
                <p style={{ color: getSeverityStyle(result.severity_assessment).color, opacity: 0.9, fontSize: "14px" }}>
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Doctor Recommendation */}
            {result.see_doctor?.recommended && (
              <div style={{ background: "#fee2e2", border: "1px solid #ef4444", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                <h4 style={{ color: "#991b1b", fontWeight: "bold", marginBottom: "8px" }}>Medical Attention Recommended</h4>
                <p style={{ color: "#7f1d1d", fontSize: "14px" }}>{result.see_doctor.reason}</p>
              </div>
            )}

            {/* Conditions */}
            <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Potential Causes</h3>
              {result.conditions?.map((cond, i) => (
                <div key={i} style={{ marginBottom: i < result.conditions.length - 1 ? "16px" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 500 }}>{cond.name}</span>
                    <span style={{ color: "var(--primary)", fontWeight: "bold" }}>{cond.probability}% Match</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--border-light)", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                    <div style={{ height: "100%", width: `${cond.probability}%`, background: "var(--primary)" }} />
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{cond.description}</p>
                </div>
              ))}
            </div>

            {/* Remedies */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Recommended Remedies</h3>
              <div style={{ display: "grid", gap: "16px" }}>
                {result.remedies?.map((remedy: any, i: number) => (
                  <div key={i} style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "20px" }}>
                    <h4 style={{ fontWeight: "bold", marginBottom: "8px" }}>{remedy.name}</h4>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>{remedy.description}</p>
                    <Link href={`/dashboard/remedies/${remedy.id || ""}`} style={{ color: "var(--primary)", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "40px" }}>
              <button
                onClick={handleReset}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-light)",
                  borderRadius: "12px", cursor: "pointer", fontWeight: 500
                }}
              >
                <RotateCcw size={18} /> Start Over
              </button>
              
              <Link
                href="/dashboard/history"
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px",
                  background: "var(--primary)", color: "white", borderRadius: "12px",
                  textDecoration: "none", fontWeight: 500
                }}
              >
                <Save size={18} /> View in History
              </Link>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}