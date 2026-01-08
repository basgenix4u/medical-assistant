// src/components/landing/HowItWorks.tsx

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ClipboardList, Cpu, Lightbulb, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Describe Symptoms",
    description: "Select from our list or describe your symptoms in detail.",
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our AI analyzes and identifies potential conditions.",
  },
  {
    icon: Lightbulb,
    title: "Get Recommendations",
    description: "Receive personalized remedy suggestions and advice.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your journey and remedy effectiveness.",
  },
];

export function HowItWorks() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="how-it-works" className="section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="badge" style={{ marginBottom: "16px" }}>
            <span>How It Works</span>
          </div>
          <h2>
            Get Started in <span className="text-gradient">4 Simple Steps</span>
          </h2>
          <p>
            Our streamlined process makes it easy to get personalized health insights.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
          className="grid-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="step-card"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.4 }}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-icon">
                <step.icon size={28} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}