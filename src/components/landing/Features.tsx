// src/components/landing/Features.tsx

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Brain,
  Leaf,
  User,
  MessageCircle,
  History,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Advanced artificial intelligence analyzes your symptoms to provide accurate insights and personalized health recommendations.",
  },
  {
    icon: Leaf,
    title: "Natural Remedies",
    description:
      "Access a comprehensive database of traditional and home remedies from various cultures around the world.",
  },
  {
    icon: User,
    title: "Interactive Body Map",
    description:
      "Pinpoint your symptoms on an interactive body map for more accurate analysis and better recommendations.",
  },
  {
    icon: MessageCircle,
    title: "24/7 AI Chat Assistant",
    description:
      "Get instant answers to your health questions anytime with our intelligent conversational assistant.",
  },
  {
    icon: History,
    title: "Health History Tracking",
    description:
      "Track your consultations and monitor your health patterns over time for better wellness management.",
  },
  {
    icon: Shield,
    title: "Safety First Approach",
    description:
      "Clear warnings for serious symptoms that require immediate professional medical attention.",
  },
];

export function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="features" className="section bg-surface">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
            <span className="text-sm font-medium text-primary">Features</span>
          </div>
          <h2>
            Everything You Need for <span className="text-gradient">Natural Wellness</span>
          </h2>
          <p>
            Our comprehensive platform combines cutting-edge AI technology with
            centuries of traditional healing wisdom.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="feature-icon">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {[
            { value: "100+", label: "Home Remedies" },
            { value: "50+", label: "Symptoms Covered" },
            { value: "24/7", label: "AI Availability" },
            { value: "Free", label: "To Use" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}