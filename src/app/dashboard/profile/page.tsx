// src/app/dashboard/profile/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Loader2, Save, Mail, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile } from "@/lib/database";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    medical_conditions: [] as string[],
    allergies: [] as string[],
  });
  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProfile();
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          medical_conditions: data.medical_conditions || [],
          allergies: data.allergies || [],
        });
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
      // Cache for greeting use elsewhere
      try {
        const data = { full_name: profile.full_name };
        localStorage.setItem("medassist-profile-cache", JSON.stringify(data));
      } catch { /* ignore */ }
    } else {
      setLoading(false);
    }
  }, [user, loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(profile);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile saved!");
      try {
        localStorage.setItem(
          "medassist-profile-cache",
          JSON.stringify({ full_name: profile.full_name })
        );
      } catch { /* ignore */ }
    }
    setSaving(false);
  };

  const addCondition = () => {
    const trimmed = newCondition.trim();
    if (trimmed && !profile.medical_conditions.includes(trimmed)) {
      setProfile({
        ...profile,
        medical_conditions: [...profile.medical_conditions, trimmed],
      });
      setNewCondition("");
    }
  };

  const removeCondition = (condition: string) => {
    setProfile({
      ...profile,
      medical_conditions: profile.medical_conditions.filter((c) => c !== condition),
    });
  };

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !profile.allergies.includes(trimmed)) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, trimmed],
      });
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter((a) => a !== allergy),
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
          <User size={40} style={{ color: "var(--primary)" }} aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Your Profile</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
          Sign in to manage your profile and health information.
        </p>
        <Link
          href="/auth/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            background: "var(--primary)",
            color: "white",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Sign in to continue
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
          color: "var(--text-tertiary)",
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ marginBottom: "12px" }} aria-hidden="true" />
        <p>Loading profile...</p>
      </div>
    );
  }

  const initials = (profile.full_name || user.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ maxWidth: "700px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px" }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Profile</h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          Manage your personal information and health details.
        </p>
      </motion.div>

      {/* Account card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
            paddingBottom: "20px",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "var(--primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "2px",
              }}
            >
              {profile.full_name || "Set your name"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Mail size={14} aria-hidden="true" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Full name */}
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="full-name-input"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "6px",
              color: "var(--text-primary)",
            }}
          >
            Full name
          </label>
          <input
            id="full-name-input"
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Jane Doe"
            autoComplete="name"
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: "15px",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Date of birth */}
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="dob-input"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "6px",
              color: "var(--text-primary)",
            }}
          >
            Date of birth
          </label>
          <input
            id="dob-input"
            type="date"
            value={profile.date_of_birth}
            onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: "15px",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Gender */}
        <div>
          <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
            <legend
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              Gender
            </legend>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProfile({ ...profile, gender: opt.value })}
                  aria-pressed={profile.gender === opt.value}
                  style={{
                    padding: "10px 18px",
                    fontSize: "14px",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background:
                      profile.gender === opt.value
                        ? "var(--primary)"
                        : "var(--bg-secondary)",
                    color:
                      profile.gender === opt.value
                        ? "white"
                        : "var(--text-secondary)",
                    transition: "all 0.2s ease",
                    fontWeight: profile.gender === opt.value ? 600 : 500,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </motion.div>

      {/* Health info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "2px" }}>
            Health information
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Helps us provide safer informational recommendations.
          </p>
        </div>

        {/* Medical conditions */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="new-condition"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "8px",
            }}
          >
            Medical conditions
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              id="new-condition"
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCondition();
                }
              }}
              placeholder="e.g., Diabetes"
              style={{
                flex: 1,
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                background: "var(--bg-secondary)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={addCondition}
              disabled={!newCondition.trim()}
              style={{
                padding: "12px 20px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                cursor: newCondition.trim() ? "pointer" : "not-allowed",
                opacity: newCondition.trim() ? 1 : 0.5,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.medical_conditions.length === 0 ? (
              <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                No conditions added
              </span>
            ) : (
              profile.medical_conditions.map((condition) => (
                <span
                  key={condition}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    background: "var(--accent)",
                    color: "var(--primary)",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {condition}
                  <button
                    type="button"
                    onClick={() => removeCondition(condition)}
                    aria-label={`Remove ${condition}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      padding: 0,
                      fontSize: "16px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label
            htmlFor="new-allergy"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "8px",
            }}
          >
            Allergies
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              id="new-allergy"
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAllergy();
                }
              }}
              placeholder="e.g., Peanuts"
              style={{
                flex: 1,
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                background: "var(--bg-secondary)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={addAllergy}
              disabled={!newAllergy.trim()}
              style={{
                padding: "12px 20px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                cursor: newAllergy.trim() ? "pointer" : "not-allowed",
                opacity: newAllergy.trim() ? 1 : 0.5,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.allergies.length === 0 ? (
              <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                No allergies added
              </span>
            ) : (
              profile.allergies.map((allergy) => (
                <span
                  key={allergy}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeAllergy(allergy)}
                    aria-label={`Remove ${allergy}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      padding: 0,
                      fontSize: "16px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div
          role="note"
          style={{
            marginTop: "20px",
            padding: "12px 14px",
            background: "var(--info-bg)",
            borderLeft: "3px solid var(--info)",
            borderRadius: "8px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            display: "flex",
            gap: "10px",
          }}
        >
          <AlertCircle size={16} style={{ color: "var(--info)", flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
          <span>Stored securely in your account. Only used to personalize informational recommendations.</span>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: 600,
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} aria-hidden="true" />
              Save Profile
              <Check size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
