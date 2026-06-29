// src/app/dashboard/analyze/page.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import { saveConsultation } from "@/lib/database";
import toast from "react-hot-toast";
import Link from "next/link";
import { EmergencyBanner } from "@/components/shared/EmergencyBanner";

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
  conditions: Array<{
    name: string;
    probability: number;
    description: string;
    severity?: string;
  }>;
  recommendations: string[];
  remedies: Remedy[];
  warnings: string[];
  see_doctor: { recommended: boolean; urgency: string; reason: string };
  isEmergency?: boolean;
  emergencyMessage?: string;
}

type ApiResponse = {
  severity: "low" | "moderate" | "high" | "emergency";
  conditions: Array<{ name: string; probability: number; description: string }>;
  recommendations: string[];
  remedies: Remedy[];
  warningFlags: string[];
  followUpNeeded: boolean;
  isEmergency?: boolean;
  emergencyMessage?: string;
  disclaimer?: string;
};

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
        if (!response.ok) throw new Error("Failed to fetch symptoms");
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
    const s = (sev || "").toLowerCase();
    if (s.includes("emergency") || s.includes("severe")) return { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" };
    if (s.includes("moderate")) return { bg: "#fef9c3", color: "#854d0e", border: "#fde047" };
    if (s.includes("high")) return { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" };
    return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
  };

  // Normalize API response to AnalysisResult shape used by the UI
  function normalizeApiResponse(api: ApiResponse): AnalysisResult {
    return {
      severity_assessment: api.severity,
      confidence_score: 0,
      summary: api.isEmergency
        ? api.emergencyMessage ?? "Possible medical emergency detected."
        : "Analysis complete. Please review the findings below.",
      conditions: api.conditions.map((c) => ({ ...c, severity: api.severity })),
      recommendations: api.recommendations,
      remedies: api.remedies,
      warnings: api.warningFlags,
      see_doctor: {
        recommended:
          api.severity === "high" ||
          api.severity === "emergency" ||
          api.followUpNeeded,
        urgency:
          api.severity === "emergency"
            ? "immediate"
            : api.severity === "high"
            ? "within 24 hours"
            : "within a few days",
        reason: api.isEmergency
          ? api.emergencyMessage ?? "Immediate evaluation needed."
          : api.warningFlags.join(" ") ||
            "Please consult a qualified healthcare provider for proper evaluation.",
      },
      isEmergency: api.isEmergency ?? false,
      emergencyMessage: api.emergencyMessage,
    };
  }

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
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms.map((s) => ({ name: s.name })),
          description,
          duration,
          severity,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to analyze symptoms.");
        }
        if (response.status === 429) {
          throw new Error("You're sending too many requests. Please wait a minute.");
        }
        throw new Error("Analysis failed. Please try again.");
      }

      const apiData: ApiResponse = await response.json();
      const analysisResult = normalizeApiResponse(apiData);

      setResult(analysisResult);

      // Save to history (non-blocking on failure)
      try {
        await saveToHistory(analysisResult);
      } catch (saveErr) {
        console.warn("Save failed (non-fatal):", saveErr);
      }

      setStep("results");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to analyze symptoms.";
      setError(msg);
      setStep("details");
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveToHistory = async (aiResult: AnalysisResult) => {
    const consultationData = {
      symptoms: selectedSymptoms.map((s) => s.name),
      symptoms_description: description || "",
      duration: duration || "Unknown",
      severity_level: severity,
      ai_analysis: aiResult,
      ai_severity: aiResult.severity_assessment || "unknown",
      conditions_identified: aiResult.conditions || [],
      recommendations: aiResult.recommendations || [],
      suggested_remedies: aiResult.remedies || [],
      warning_flags: aiResult.warnings || [],
      follow_up_recommended: aiResult.see_doctor?.recommended || false,
    };

    const { error } = await saveConsultation(consultationData as unknown as Parameters<typeof saveConsultation>[0]);

    if (error) {
      console.error("Supabase Save Error:", error);
      toast.error(`Save failed: ${(error as { message?: string })?.message || "Unknown database error"}`);
    } else {
      toast.success("Analysis saved to history!");
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
              aria-label="Go back"
              style={{
                width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "8px", cursor: "pointer"
              }}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
          )}
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Symptom Checker</h1>
        </div>
        <p
          style={{
            color: "var(--text-tertiary)",
            fontSize: "14px",
            padding: "12px 16px",
            background: "var(--bg-secondary)",
            borderRadius: "10px",
            borderLeft: "3px solid var(--primary)",
          }}
        >
          <strong>Informational only:</strong> This tool does not provide
          medical diagnoses. If you believe this is an emergency, call your
          local emergency number immediately.
        </p>
      </motion.div>

      {/* Progress Bar */}
      {step !== "analyzing" && (
        <div
          role="progressbar"
          aria-label="Symptom checker progress"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={
            step === "select" ? 1 : step === "details" ? 2 : 3
          }
          style={{ display: "flex", gap: "8px", marginBottom: "24px" }}
        >
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
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search symptoms (e.g., headache, fever)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search symptoms"
                style={{
                  width: "100%", padding: "14px 14px 14px 44px", fontSize: "15px",
                  border: "1px solid var(--border-light)", borderRadius: "12px", background: "var(--bg-tertiary)", outline: "none"
                }}
              />
            </div>

            {selectedSymptoms.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {selectedSymptoms.map((symptom) => (
                  <span key={symptom.id} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "var(--primary)", borderRadius: "20px", fontSize: "14px", color: "white" }}>
                    {symptom.name}
                    <button
                      onClick={() => toggleSymptom(symptom)}
                      aria-label={`Remove ${symptom.name}`}
                      style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", padding: 0 }}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {error && <div role="alert" style={{ padding: "12px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}

            <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", overflow: "hidden", maxHeight: "500px", overflowY: "auto" }}>
              {loading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <Loader2 className="animate-spin" style={{ margin: "0 auto", color: "var(--primary)" }} aria-hidden="true" />
                  <p style={{ marginTop: "10px", color: "var(--text-tertiary)" }}>Loading symptoms…</p>
                </div>
              ) : (
                Object.entries(groupedSymptoms).map(([category, list]) => (
                  <div key={category}>
                    <div style={{ padding: "10px 20px", background: "var(--bg-secondary)", fontSize: "13px", fontWeight: "bold", color: "var(--text-tertiary)", textTransform: "uppercase" }}>{category}</div>
                    <div style={{ padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {list.map((symptom) => {
                        const isSelected = selectedSymptoms.some((s) => s.id === symptom.id);
                        return (
                          <button
                            key={symptom.id}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            aria-pressed={isSelected}
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
                Next Step <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ADD DETAILS */}
        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "24px" }}>
              <div style={{ marginBottom: "24px" }}>
                <label htmlFor="severity-slider" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Severity (1-10)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <input
                    id="severity-slider"
                    type="range"
                    min={1}
                    max={10}
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--primary)" }}
                  />
                  <span
                    aria-live="polite"
                    style={{ fontSize: "18px", fontWeight: "bold", color: "var(--primary)", width: "30px", textAlign: "center" }}
                  >
                    {severity}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                    How long have you had these symptoms?
                  </legend>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {["Less than a day", "1-2 days", "3-5 days", "1 week", "2+ weeks"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDuration(opt)}
                        aria-pressed={duration === opt}
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
                </fieldset>
              </div>

              <div>
                <label htmlFor="notes" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your symptoms in more detail..."
                  maxLength={2000}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-light)",
                    background: "var(--bg-secondary)", minHeight: "100px", outline: "none", resize: "vertical"
                  }}
                />
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                  {description.length}/2000 characters
                </p>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => setStep("select")}
                style={{ padding: "14px 24px", background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                Back
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                aria-busy={analyzing}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px",
                  background: "var(--primary)", color: "white", borderRadius: "12px", border: "none",
                  cursor: analyzing ? "not-allowed" : "pointer", fontWeight: 500, opacity: analyzing ? 0.7 : 1
                }}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Stethoscope size={18} aria-hidden="true" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: LOADING SCREEN */}
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="status"
            aria-live="polite"
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <Loader2 size={48} className="animate-spin" style={{ margin: "0 auto 20px", color: "var(--primary)" }} aria-hidden="true" />
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Analyzing your symptoms…</h2>
            <p style={{ color: "var(--text-tertiary)" }}>This usually takes a few seconds.</p>
          </motion.div>
        )}

        {/* STEP 4: RESULTS */}
        {step === "results" && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* EMERGENCY BANNER - shown whenever severity=emergency OR isEmergency */}
            {(result.isEmergency || result.severity_assessment === "emergency") && (
              <EmergencyBanner message={result.emergencyMessage} />
            )}

            {/* Severity Card */}
            <div
              style={{
                background: getSeverityStyle(result.severity_assessment).bg,
                border: `1px solid ${getSeverityStyle(result.severity_assessment).border}`,
                borderRadius: "16px", padding: "20px", marginBottom: "24px",
                display: "flex", alignItems: "center", gap: "16px"
              }}
              role="status"
            >
              <AlertTriangle size={32} style={{ color: getSeverityStyle(result.severity_assessment).color }} aria-hidden="true" />
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: getSeverityStyle(result.severity_assessment).color, textTransform: "capitalize", margin: 0 }}>
                  {result.severity_assessment} Severity
                </h3>
                <p style={{ color: getSeverityStyle(result.severity_assessment).color, opacity: 0.9, fontSize: "14px", margin: "4px 0 0 0" }}>
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div
              style={{
                padding: "16px",
                background: "var(--bg-secondary)",
                borderLeft: "3px solid var(--warning)",
                borderRadius: "10px",
                marginBottom: "24px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <strong>Reminder:</strong> This information is general and
              educational only. It is NOT a medical diagnosis. Always
              consult a qualified healthcare provider for proper
              evaluation.
            </div>

            {/* Doctor Recommendation */}
            {result.see_doctor?.recommended && !result.isEmergency && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                <h4 style={{ color: "#854d0e", fontWeight: "bold", marginBottom: "8px", margin: 0 }}>
                  See a Doctor ({result.see_doctor.urgency})
                </h4>
                <p style={{ color: "#854d0e", fontSize: "14px", margin: "8px 0 0 0" }}>
                  {result.see_doctor.reason}
                </p>
              </div>
            )}

            {/* Conditions */}
            {result.conditions && result.conditions.length > 0 && (
              <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "4px" }}>Possible Explanations</h3>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                  These are informational possibilities, not diagnoses.
                </p>
                {result.conditions.map((cond, i) => (
                  <div key={i} style={{ marginBottom: i < result.conditions.length - 1 ? "16px" : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 500 }}>{cond.name}</span>
                      <span style={{ color: "var(--primary)", fontWeight: "bold" }}>
                        {Math.round((cond.probability || 0) * 100)}% match
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round((cond.probability || 0) * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ height: "6px", background: "var(--border-light)", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}
                    >
                      <div style={{ height: "100%", width: `${(cond.probability || 0) * 100}%`, background: "var(--primary)" }} />
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{cond.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>General Considerations</h3>
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {result.recommendations.map((rec, i) => (
                    <li key={i} style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Remedies */}
            {result.remedies && result.remedies.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Suggested Remedies</h3>
                <div style={{ display: "grid", gap: "16px" }}>
                  {result.remedies.map((remedy, i) => (
                    <div key={i} style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "20px" }}>
                      <h4 style={{ fontWeight: "bold", marginBottom: "8px" }}>{remedy.name}</h4>
                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>{remedy.description}</p>
                      <p
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          padding: "2px 8px",
                          background: "var(--accent)",
                          color: "var(--primary)",
                          borderRadius: "10px",
                          fontWeight: 500,
                          margin: 0,
                        }}
                      >
                        {remedy.remedy_type}
                      </p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "12px" }}>
                  Browse the <Link href="/dashboard/remedies" style={{ color: "var(--primary)" }}>full remedies library</Link> for preparation instructions.
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}>
              <button
                onClick={handleReset}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px",
                  background: "var(--bg-secondary)", border: "1px solid var(--border-light)",
                  borderRadius: "12px", cursor: "pointer", fontWeight: 500
                }}
              >
                <RotateCcw size={18} aria-hidden="true" /> Start Over
              </button>

              <Link
                href="/dashboard/history"
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px",
                  background: "var(--primary)", color: "white", borderRadius: "12px",
                  textDecoration: "none", fontWeight: 500
                }}
              >
                View in History
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
