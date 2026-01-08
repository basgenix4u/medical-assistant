// src/components/symptoms/BodyMap.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";

interface BodyPart {
  id: string;
  name: string;
  symptoms: string[];
  path: string;
  labelPosition: { x: number; y: number };
}

interface BodyMapProps {
  selectedSymptoms: string[];
  onSymptomToggle: (symptom: string) => void;
}

const BODY_PARTS: BodyPart[] = [
  {
    id: "head",
    name: "Head",
    symptoms: ["Headache", "Migraine", "Dizziness", "Eye Strain"],
    path: "M150,30 Q150,10 170,10 L230,10 Q250,10 250,30 L250,70 Q250,100 200,100 Q150,100 150,70 Z",
    labelPosition: { x: 200, y: 55 },
  },
  {
    id: "neck",
    name: "Neck & Throat",
    symptoms: ["Sore Throat", "Neck Pain", "Stiffness"],
    path: "M175,100 L225,100 L220,130 L180,130 Z",
    labelPosition: { x: 200, y: 115 },
  },
  {
    id: "chest",
    name: "Chest",
    symptoms: ["Cough", "Shortness of Breath", "Heartburn", "Chest Pain"],
    path: "M140,130 L260,130 L270,200 Q270,220 250,220 L150,220 Q130,220 130,200 Z",
    labelPosition: { x: 200, y: 175 },
  },
  {
    id: "abdomen",
    name: "Abdomen",
    symptoms: ["Stomach Pain", "Nausea", "Bloating", "Indigestion", "Constipation", "Diarrhea"],
    path: "M130,220 L270,220 L265,320 Q260,340 200,340 Q140,340 135,320 Z",
    labelPosition: { x: 200, y: 280 },
  },
  {
    id: "left-arm",
    name: "Left Arm",
    symptoms: ["Joint Pain", "Muscle Cramps", "Weakness"],
    path: "M130,130 L140,130 L130,200 L100,280 L80,280 L110,200 L120,130 Z",
    labelPosition: { x: 95, y: 200 },
  },
  {
    id: "right-arm",
    name: "Right Arm",
    symptoms: ["Joint Pain", "Muscle Cramps", "Weakness"],
    path: "M260,130 L270,130 L280,130 L290,200 L320,280 L300,280 L270,200 Z",
    labelPosition: { x: 305, y: 200 },
  },
  {
    id: "left-leg",
    name: "Left Leg",
    symptoms: ["Joint Pain", "Muscle Cramps", "Weakness", "Swelling"],
    path: "M140,340 L180,340 L175,450 L160,520 L140,520 L155,450 Z",
    labelPosition: { x: 150, y: 430 },
  },
  {
    id: "right-leg",
    name: "Right Leg",
    symptoms: ["Joint Pain", "Muscle Cramps", "Weakness", "Swelling"],
    path: "M220,340 L260,340 L245,450 L260,520 L240,520 L225,450 Z",
    labelPosition: { x: 250, y: 430 },
  },
  {
    id: "back",
    name: "Back",
    symptoms: ["Back Pain", "Stiffness", "Muscle Ache"],
    path: "", // We'll show this as a button instead
    labelPosition: { x: 350, y: 200 },
  },
  {
    id: "skin",
    name: "Skin (General)",
    symptoms: ["Skin Rash", "Dry Skin", "Itching", "Acne"],
    path: "",
    labelPosition: { x: 350, y: 280 },
  },
];

// General symptoms not tied to specific body parts
const GENERAL_SYMPTOMS = [
  "Fever",
  "Fatigue",
  "Body Ache",
  "Weakness",
  "Chills",
  "Loss of Appetite",
  "Anxiety",
  "Insomnia",
  "Stress",
  "Low Mood",
];

export function BodyMap({ selectedSymptoms, onSymptomToggle }: BodyMapProps) {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [showGeneral, setShowGeneral] = useState(false);

  const hasSelectedSymptomInPart = (part: BodyPart) => {
    return part.symptoms.some((s) => selectedSymptoms.includes(s));
  };

  const getPartColor = (part: BodyPart) => {
    if (hasSelectedSymptomInPart(part)) {
      return "var(--primary)";
    }
    return "#E8D1C5";
  };

  return (
    <div style={{ position: "relative" }}>
      {/* SVG Body Map */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          background: "var(--bg-secondary)",
          borderRadius: "16px",
          marginBottom: "16px",
        }}
      >
        <svg
          viewBox="0 0 400 550"
          style={{
            width: "100%",
            maxWidth: "320px",
            height: "auto",
          }}
        >
          {/* Body Parts */}
          {BODY_PARTS.filter((part) => part.path).map((part) => (
            <g key={part.id}>
              <motion.path
                d={part.path}
                fill={getPartColor(part)}
                stroke="var(--primary)"
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                whileHover={{ scale: 1.02, opacity: 0.8 }}
                onClick={() => setSelectedPart(part)}
              />
              {/* Small indicator if has symptoms */}
              {hasSelectedSymptomInPart(part) && (
                <circle
                  cx={part.labelPosition.x}
                  cy={part.labelPosition.y - 15}
                  r="8"
                  fill="var(--primary)"
                />
              )}
            </g>
          ))}

          {/* Labels */}
          {BODY_PARTS.filter((part) => part.path).map((part) => (
            <text
              key={`label-${part.id}`}
              x={part.labelPosition.x}
              y={part.labelPosition.y}
              textAnchor="middle"
              fontSize="11"
              fill="var(--text-secondary)"
              style={{ pointerEvents: "none", fontWeight: 500 }}
            >
              {part.name}
            </text>
          ))}
        </svg>
      </div>

      {/* Quick Access Buttons for non-visual parts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {BODY_PARTS.filter((part) => !part.path).map((part) => (
          <button
            key={part.id}
            onClick={() => setSelectedPart(part)}
            style={{
              padding: "12px",
              background: hasSelectedSymptomInPart(part) ? "var(--primary)" : "var(--bg-tertiary)",
              color: hasSelectedSymptomInPart(part) ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {part.name}
          </button>
        ))}
        <button
          onClick={() => setShowGeneral(true)}
          style={{
            padding: "12px",
            background: GENERAL_SYMPTOMS.some((s) => selectedSymptoms.includes(s))
              ? "var(--primary)"
              : "var(--bg-tertiary)",
            color: GENERAL_SYMPTOMS.some((s) => selectedSymptoms.includes(s))
              ? "white"
              : "var(--text-secondary)",
            border: "1px solid var(--border-light)",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          General
        </button>
      </div>

      {/* Instructions */}
      <p
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "var(--text-muted)",
        }}
      >
        Click on a body part to select symptoms for that area
      </p>

      {/* Symptom Selection Modal */}
      <AnimatePresence>
        {(selectedPart || showGeneral) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            onClick={() => {
              setSelectedPart(null);
              setShowGeneral(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-tertiary)",
                borderRadius: "20px",
                padding: "24px",
                width: "100%",
                maxWidth: "400px",
                maxHeight: "80vh",
                overflow: "auto",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                  {showGeneral ? "General Symptoms" : `${selectedPart?.name} Symptoms`}
                </h3>
                <button
                  onClick={() => {
                    setSelectedPart(null);
                    setShowGeneral(false);
                  }}
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg-secondary)",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Symptoms List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(showGeneral ? GENERAL_SYMPTOMS : selectedPart?.symptoms || []).map(
                  (symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        onClick={() => onSymptomToggle(symptom)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          background: isSelected ? "var(--primary)" : "var(--bg-secondary)",
                          color: isSelected ? "white" : "var(--text-secondary)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "15px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <span>{symptom}</span>
                        {isSelected ? <Check size={18} /> : <Plus size={18} />}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Done Button */}
              <button
                onClick={() => {
                  setSelectedPart(null);
                  setShowGeneral(false);
                }}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "20px" }}
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}