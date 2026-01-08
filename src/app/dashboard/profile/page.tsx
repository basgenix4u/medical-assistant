// src/app/dashboard/profile/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Loader2, Save, AlertCircle } from "lucide-react";
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
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProfile();
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
      toast.success("Profile updated successfully!");
    }
    setSaving(false);
  };

  const addCondition = () => {
    if (newCondition.trim() && !profile.medical_conditions.includes(newCondition.trim())) {
      setProfile({
        ...profile,
        medical_conditions: [...profile.medical_conditions, newCondition.trim()],
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
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, newAllergy.trim()],
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
          <User size={40} style={{ color: "var(--primary)" }} />
        </div>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Your Profile</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
          Sign in to manage your profile and health information.
        </p>
        <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "var(--primary)", color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: 500 }}>
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "var(--text-tertiary)" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Profile Settings</h1>
        <p style={{ color: "var(--text-tertiary)" }}>Manage your personal information and health details</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 600 }}>
            {profile.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>{profile.full_name || "Set your name"}</h3>
            <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>{user.email}</p>
          </div>
        </div>

        {/* Full Name */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px", color: "var(--text-primary)" }}>Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Enter your full name"
            style={{ width: "100%", padding: "14px", fontSize: "15px", border: "1px solid var(--border-light)", borderRadius: "12px", background: "var(--bg-secondary)", outline: "none" }}
          />
        </div>

        {/* Date of Birth */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px", color: "var(--text-primary)" }}>Date of Birth</label>
          <input
            type="date"
            value={profile.date_of_birth}
            onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
            style={{ width: "100%", padding: "14px", fontSize: "15px", border: "1px solid var(--border-light)", borderRadius: "12px", background: "var(--bg-secondary)", outline: "none" }}
          />
        </div>

        {/* Gender */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px", color: "var(--text-primary)" }}>Gender</label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["male", "female", "other", "prefer_not_to_say"].map((option) => (
              <button
                key={option}
                onClick={() => setProfile({ ...profile, gender: option })}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: profile.gender === option ? "var(--primary)" : "var(--bg-secondary)",
                  color: profile.gender === option ? "white" : "var(--text-secondary)",
                  textTransform: "capitalize",
                }}
              >
                {option.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Health Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-light)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Health Information</h3>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "20px" }}>This helps us provide safer recommendations</p>

        {/* Medical Conditions */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Medical Conditions</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
              placeholder="Add a condition"
              style={{ flex: 1, padding: "12px", fontSize: "14px", border: "1px solid var(--border-light)", borderRadius: "10px", background: "var(--bg-secondary)", outline: "none" }}
            />
            <button onClick={addCondition} disabled={!newCondition.trim()} style={{ padding: "12px 20px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "10px", cursor: newCondition.trim() ? "pointer" : "not-allowed", opacity: newCondition.trim() ? 1 : 0.5 }}>
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.medical_conditions.map((condition) => (
              <span key={condition} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "var(--accent)", color: "var(--primary)", borderRadius: "20px", fontSize: "13px" }}>
                {condition}
                <button onClick={() => removeCondition(condition)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, fontSize: "16px" }}>×</button>
              </span>
            ))}
            {profile.medical_conditions.length === 0 && <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontStyle: "italic" }}>No conditions added</span>}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Allergies</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
              placeholder="Add an allergy"
              style={{ flex: 1, padding: "12px", fontSize: "14px", border: "1px solid var(--border-light)", borderRadius: "10px", background: "var(--bg-secondary)", outline: "none" }}
            />
            <button onClick={addAllergy} disabled={!newAllergy.trim()} style={{ padding: "12px 20px", background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "10px", cursor: newAllergy.trim() ? "pointer" : "not-allowed", opacity: newAllergy.trim() ? 1 : 0.5 }}>
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.allergies.map((allergy) => (
              <span key={allergy} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#fee2e2", color: "#dc2626", borderRadius: "20px", fontSize: "13px" }}>
                {allergy}
                <button onClick={() => removeAllergy(allergy)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, fontSize: "16px" }}>×</button>
              </span>
            ))}
            {profile.allergies.length === 0 && <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontStyle: "italic" }}>No allergies added</span>}
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: 500,
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </motion.div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}