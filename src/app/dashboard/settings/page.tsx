// src/app/dashboard/settings/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Lock,
  Loader2,
  Save,
  Moon,
  Sun,
  Monitor,
  Mail,
  Download,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getProfile,
  updateProfile,
  getUserPreferences,
  updateUserPreferences,
  exportUserData,
  deleteUserAccount,
} from "@/lib/database";
import toast from "react-hot-toast";
import Link from "next/link";

type TabType = "profile" | "notifications" | "appearance" | "security" | "privacy";

export default function SettingsPage() {
  const { user, signOut, updatePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    medical_conditions: [] as string[],
    allergies: [] as string[],
  });
  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  // Preferences State
  const [preferences, setPreferences] = useState({
    theme: "system" as "light" | "dark" | "system",
    email_notifications: true,
    reminder_notifications: true,
    preferred_remedy_types: [] as string[],
    language: "en",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);

    const { data: profileData } = await getProfile();
    if (profileData) {
      setProfile({
        full_name: profileData.full_name || "",
        date_of_birth: profileData.date_of_birth || "",
        gender: profileData.gender || "",
        medical_conditions: profileData.medical_conditions || [],
        allergies: profileData.allergies || [],
      });
    }

    const { data: prefsData } = await getUserPreferences();
    if (prefsData) {
      setPreferences({
        theme: prefsData.theme || "system",
        email_notifications: prefsData.email_notifications ?? true,
        reminder_notifications: prefsData.reminder_notifications ?? true,
        preferred_remedy_types: prefsData.preferred_remedy_types || [],
        language: prefsData.language || "en",
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  // Handlers
  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile(profile);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    const { error } = await updateUserPreferences(preferences);
    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Preferences saved!");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    const { error } = await updatePassword(passwordData.new);
    if (error) {
      toast.error(error.message || "Failed to update password");
    } else {
      toast.success("Password updated!");
      setPasswordData({ current: "", new: "", confirm: "" });
    }
    setChangingPassword(false);
  };

  const handleExportData = async () => {
    setExporting(true);
    const { data, error } = await exportUserData();
    if (error) {
      toast.error("Failed to export data");
    } else if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medassist-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported!");
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    const input = prompt('Type "DELETE" to confirm:');
    if (input !== "DELETE") {
      toast.error("Account deletion cancelled");
      return;
    }

    const { error } = await deleteUserAccount();
    if (error) {
      toast.error("Failed to delete account");
    } else {
      toast.success("Account deleted");
      window.location.href = "/";
    }
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

  const toggleRemedyType = (type: string) => {
    setPreferences({
      ...preferences,
      preferred_remedy_types: preferences.preferred_remedy_types.includes(type)
        ? preferences.preferred_remedy_types.filter((t) => t !== type)
        : [...preferences.preferred_remedy_types, type],
    });
  };

  // Tab Config
  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "security" as const, label: "Security", icon: Lock },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
  ];

  const remedyTypes = [
    { id: "herbal", label: "Herbal" },
    { id: "home", label: "Home Remedies" },
    { id: "ayurvedic", label: "Ayurvedic" },
    { id: "traditional", label: "Traditional" },
    { id: "chinese", label: "Chinese Medicine" },
    { id: "naturopathic", label: "Naturopathic" },
  ];

  // Not logged in
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
          <Settings size={40} style={{ color: "var(--primary)" }} />
        </div>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Settings</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "24px" }}>
          Sign in to manage your settings.
        </p>
        <Link
          href="/auth/login"
          style={{
            display: "inline-flex",
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

  // Loading
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
        <Loader2
          size={32}
          style={{ animation: "spin 1s linear infinite", marginBottom: "12px", color: "var(--primary)" }}
        />
        <p style={{ color: "var(--text-tertiary)" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px" }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Settings</h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          Manage your account, preferences, and privacy
        </p>
      </motion.div>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ width: "220px", flexShrink: 0 }}
        >
          <nav
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              padding: "8px",
              position: "sticky",
              top: "100px",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  background: activeTab === tab.id ? "var(--primary)" : "transparent",
                  color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                }}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1, minWidth: 0 }}
        >
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              {/* Account Overview Card */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  <div
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
                      fontWeight: 600,
                    }}
                  >
                    {profile.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>
                      {profile.full_name || "Set your name"}
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>{user.email}</p>
                  </div>
                </div>

                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
                  Personal Information
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        fontSize: "15px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                      Date of Birth
                    </label>
                    <input
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
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                    Gender
                  </label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["male", "female", "other", "prefer_not_to_say"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setProfile({ ...profile, gender: option })}
                        style={{
                          padding: "10px 18px",
                          fontSize: "13px",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          background: profile.gender === option ? "var(--primary)" : "var(--bg-secondary)",
                          color: profile.gender === option ? "white" : "var(--text-secondary)",
                          textTransform: "capitalize",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {option.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Health Information Card */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                  Health Information
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "20px" }}>
                  This helps us provide safer remedy recommendations
                </p>

                {/* Medical Conditions */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                    Medical Conditions
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
                      placeholder="Add a condition (e.g., Diabetes)"
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        fontSize: "14px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={addCondition}
                      disabled={!newCondition.trim()}
                      style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "10px",
                        cursor: newCondition.trim() ? "pointer" : "not-allowed",
                        opacity: newCondition.trim() ? 1 : 0.5,
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {profile.medical_conditions.length > 0 ? (
                      profile.medical_conditions.map((condition) => (
                        <span
                          key={condition}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            background: "var(--accent)",
                            color: "var(--primary)",
                            borderRadius: "20px",
                            fontSize: "13px",
                          }}
                        >
                          {condition}
                          <button
                            onClick={() => removeCondition(condition)}
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
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                        No conditions added
                      </span>
                    )}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                    Allergies
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                      placeholder="Add an allergy (e.g., Peanuts)"
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        fontSize: "14px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={addAllergy}
                      disabled={!newAllergy.trim()}
                      style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "10px",
                        cursor: newAllergy.trim() ? "pointer" : "not-allowed",
                        opacity: newAllergy.trim() ? 1 : 0.5,
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {profile.allergies.length > 0 ? (
                      profile.allergies.map((allergy) => (
                        <span
                          key={allergy}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            borderRadius: "20px",
                            fontSize: "13px",
                          }}
                        >
                          {allergy}
                          <button
                            onClick={() => removeAllergy(allergy)}
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
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                        No allergies added
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>
                Notification Preferences
              </h4>

              {/* Email Notifications */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Mail size={20} style={{ color: "var(--primary)" }} />
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>Email Notifications</p>
                    <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                      Receive updates and alerts via email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreferences({ ...preferences, email_notifications: !preferences.email_notifications })
                  }
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: preferences.email_notifications ? "var(--primary)" : "var(--border-light)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: preferences.email_notifications ? "22px" : "2px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              {/* Reminder Notifications */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Bell size={20} style={{ color: "var(--primary)" }} />
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>Reminder Notifications</p>
                    <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                      Get health check-in reminders
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      reminder_notifications: !preferences.reminder_notifications,
                    })
                  }
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: preferences.reminder_notifications ? "var(--primary)" : "var(--border-light)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: preferences.reminder_notifications ? "22px" : "2px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <>
              {/* Theme Selection */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Theme</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {[
                    { id: "light" as const, label: "Light", icon: Sun },
                    { id: "dark" as const, label: "Dark", icon: Moon },
                    { id: "system" as const, label: "System", icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setPreferences({ ...preferences, theme: option.id })}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        padding: "16px",
                        border: preferences.theme === option.id ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                        borderRadius: "12px",
                        cursor: "pointer",
                        background: preferences.theme === option.id ? "var(--accent)" : "var(--bg-secondary)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <option.icon
                        size={24}
                        style={{
                          color: preferences.theme === option.id ? "var(--primary)" : "var(--text-tertiary)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: preferences.theme === option.id ? "var(--primary)" : "var(--text-secondary)",
                        }}
                      >
                        {option.label}
                      </span>
                      {preferences.theme === option.id && <Check size={16} style={{ color: "var(--primary)" }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Remedy Types */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                  Preferred Remedy Types
                </h4>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                  We&apos;ll prioritize these in recommendations
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {remedyTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleRemedyType(type.id)}
                      style={{
                        padding: "10px 16px",
                        fontSize: "13px",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        background: preferences.preferred_remedy_types.includes(type.id)
                          ? "var(--primary)"
                          : "var(--bg-secondary)",
                        color: preferences.preferred_remedy_types.includes(type.id)
                          ? "white"
                          : "var(--text-secondary)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {preferences.preferred_remedy_types.includes(type.id) && (
                        <Check size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                      )}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Appearance"}
                </button>
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <>
              {/* Change Password */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Change Password</h4>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                    Current Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      placeholder="Enter current password"
                      style={{
                        width: "100%",
                        padding: "12px 44px 12px 14px",
                        fontSize: "15px",
                        border: "1px solid var(--border-light)",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                      New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        placeholder="Enter new password"
                        style={{
                          width: "100%",
                          padding: "12px 44px 12px 14px",
                          fontSize: "15px",
                          border: "1px solid var(--border-light)",
                          borderRadius: "10px",
                          background: "var(--bg-secondary)",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                      Confirm Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        placeholder="Confirm new password"
                        style={{
                          width: "100%",
                          padding: "12px 44px 12px 14px",
                          fontSize: "15px",
                          border: "1px solid var(--border-light)",
                          borderRadius: "10px",
                          background: "var(--bg-secondary)",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwordData.new || !passwordData.confirm}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor:
                      changingPassword || !passwordData.new || !passwordData.confirm ? "not-allowed" : "pointer",
                    opacity: changingPassword || !passwordData.new || !passwordData.confirm ? 0.5 : 1,
                  }}
                >
                  {changingPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>

              {/* Sign Out */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Sign Out</h4>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                  Sign out of your account on this device
                </p>
                <button
                  onClick={signOut}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <>
              {/* Export Data */}
              <div
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "20px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Export Your Data</h4>
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                  Download all your data including consultations and saved remedies
                </p>
                <button
                  onClick={handleExportData}
                  disabled={exporting}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "10px",
                    cursor: exporting ? "not-allowed" : "pointer",
                    opacity: exporting ? 0.7 : 1,
                  }}
                >
                  {exporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {exporting ? "Exporting..." : "Export All Data"}
                </button>
              </div>

              {/* Delete Account */}
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <AlertTriangle size={20} style={{ color: "#dc2626", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#991b1b", marginBottom: "4px" }}>
                      Danger Zone
                    </h4>
                    <p style={{ fontSize: "13px", color: "#b91c1c", marginBottom: "16px" }}>
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontWeight: 500,
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Global Styles for Animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}