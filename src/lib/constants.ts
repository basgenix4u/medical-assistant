// src/lib/constants.ts

import {
  Brain,
  Wind,
  Utensils,
  Bone,
  Sparkles,
  Heart,
  Activity,
  Leaf,
  Home,
  ScrollText,
  MessageCircle,
  History,
  Shield,
  Lightbulb,
  Cpu,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

export const SYMPTOM_CATEGORIES = [
  { id: "neurological", label: "Neurological", icon: "Brain", color: "purple" },
  { id: "respiratory", label: "Respiratory", icon: "Wind", color: "blue" },
  { id: "digestive", label: "Digestive", icon: "Utensils", color: "orange" },
  { id: "musculoskeletal", label: "Musculoskeletal", icon: "Bone", color: "gray" },
  { id: "dermatological", label: "Skin & Hair", icon: "Sparkles", color: "pink" },
  { id: "cardiovascular", label: "Cardiovascular", icon: "Heart", color: "red" },
  { id: "mental-health", label: "Mental Health", icon: "Brain", color: "teal" },
  { id: "general", label: "General", icon: "Activity", color: "green" },
] as const;

export const BODY_PARTS = [
  { id: "head", label: "Head", emoji: "🧠" },
  { id: "neck", label: "Neck", emoji: "🦴" },
  { id: "chest", label: "Chest", emoji: "🫁" },
  { id: "abdomen", label: "Abdomen", emoji: "🫃" },
  { id: "back", label: "Back", emoji: "🔙" },
  { id: "arms", label: "Arms", emoji: "💪" },
  { id: "legs", label: "Legs", emoji: "🦵" },
  { id: "hands", label: "Hands", emoji: "🤲" },
  { id: "feet", label: "Feet", emoji: "🦶" },
  { id: "skin", label: "Skin", emoji: "✨" },
] as const;

export const DURATION_OPTIONS = [
  { value: "few-hours", label: "A few hours" },
  { value: "1-day", label: "About a day" },
  { value: "2-3-days", label: "2-3 days" },
  { value: "1-week", label: "About a week" },
  { value: "2-weeks", label: "2 weeks" },
  { value: "1-month", label: "About a month" },
  { value: "more-than-month", label: "More than a month" },
] as const;

export const SEVERITY_LABELS = [
  { value: 1, label: "Very Mild", description: "Barely noticeable" },
  { value: 2, label: "Mild", description: "Slight discomfort" },
  { value: 3, label: "Mild-Moderate", description: "Noticeable" },
  { value: 4, label: "Moderate", description: "Affecting activities" },
  { value: 5, label: "Moderate", description: "Clearly uncomfortable" },
  { value: 6, label: "Moderate-Severe", description: "Hard to ignore" },
  { value: 7, label: "Severe", description: "Limiting daily life" },
  { value: 8, label: "Severe", description: "Very difficult" },
  { value: 9, label: "Very Severe", description: "Extremely distressing" },
  { value: 10, label: "Worst Possible", description: "Unbearable" },
] as const;

export const REMEDY_TYPES = [
  { id: "herbal", label: "Herbal", icon: "🌿", description: "Plant-based remedies" },
  { id: "home", label: "Home", icon: "🏠", description: "Household remedies" },
  { id: "ayurvedic", label: "Ayurvedic", icon: "🕉️", description: "Indian traditional" },
  { id: "traditional", label: "Traditional", icon: "📜", description: "Time-tested" },
] as const;

export const QUICK_SYMPTOMS = [
  "Headache",
  "Fever",
  "Cough",
  "Sore Throat",
  "Fatigue",
  "Nausea",
  "Body Ache",
  "Runny Nose",
] as const;

export const FEATURES = [
  {
    id: 1,
    title: "AI-Powered Analysis",
    description: "Advanced AI analyzes your symptoms to provide accurate insights and personalized recommendations.",
    icon: "Brain",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    id: 2,
    title: "Natural Remedies",
    description: "Access a vast database of traditional and home remedies from cultures around the world.",
    icon: "Leaf",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: 3,
    title: "Interactive Body Map",
    description: "Pinpoint your symptoms on an interactive body map for more accurate analysis.",
    icon: "User",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 4,
    title: "24/7 Chat Assistant",
    description: "Get instant answers to your health questions anytime with our intelligent chat assistant.",
    icon: "MessageCircle",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: 5,
    title: "Health History",
    description: "Track your consultations and monitor your health patterns over time.",
    icon: "History",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: 6,
    title: "Safety First",
    description: "Clear warnings for serious symptoms that require professional medical attention.",
    icon: "Shield",
    gradient: "from-red-500 to-pink-500",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Describe Symptoms",
    description: "Select your symptoms from our list or describe them in your own words.",
    icon: "ClipboardList",
  },
  {
    step: 2,
    title: "AI Analysis",
    description: "Our AI analyzes your symptoms and identifies potential conditions.",
    icon: "Cpu",
  },
  {
    step: 3,
    title: "Get Recommendations",
    description: "Receive personalized remedy suggestions and health advice.",
    icon: "Lightbulb",
  },
  {
    step: 4,
    title: "Track Progress",
    description: "Monitor your health journey and track remedy effectiveness.",
    icon: "TrendingUp",
  },
] as const;

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Wellness Enthusiast",
    content: "This app has been a game-changer for managing minor health issues at home. The remedy suggestions are practical and effective!",
    rating: 5,
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Fitness Trainer",
    content: "I love how it combines traditional remedies with modern AI analysis. It's like having a health consultant in your pocket.",
    rating: 5,
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Roberts",
    role: "Mother of Three",
    content: "The symptom checker is incredibly intuitive. It helped me understand when to use home remedies and when to see a doctor.",
    rating: 5,
    avatar: "ER",
  },
] as const;

export const DISCLAIMER_TEXT = `This application provides general health information and home remedy suggestions for educational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.`;

export const CHAT_SUGGESTIONS = [
  "What natural remedies help with headaches?",
  "How can I boost my immune system?",
  "What foods help with digestion?",
  "How to get better sleep naturally?",
] as const;

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/analyze", label: "Symptom Checker", icon: "Stethoscope" },
  { href: "/dashboard/remedies", label: "Remedies", icon: "Leaf" },
  { href: "/dashboard/chat", label: "AI Chat", icon: "MessageCircle" },
  { href: "/dashboard/history", label: "History", icon: "History" },
] as const;