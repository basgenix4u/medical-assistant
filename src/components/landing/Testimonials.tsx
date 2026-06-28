// src/components/landing/Testimonials.tsx

"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Wellness Enthusiast",
    content:
      "This app has been a game-changer for managing minor health issues at home. The remedy suggestions are practical and effective!",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Fitness Trainer",
    content:
      "I love how it combines traditional remedies with modern AI analysis. It's like having a health consultant in your pocket.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emily Roberts",
    role: "Mother of Three",
    content:
      "The symptom checker is incredibly intuitive. It helped me understand when to use home remedies and when to see a doctor.",
    rating: 5,
    avatar: "ER",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      style={{
        paddingTop: "var(--space-20)",
        paddingBottom: "var(--space-20)",
        background: "var(--bg-secondary)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "var(--accent)",
              borderRadius: "9999px",
              marginBottom: "16px",
            }}
          >
            <Star
              size={14}
              style={{ color: "var(--primary)", fill: "var(--primary)" }}
              aria-hidden="true"
            />
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--primary)",
              }}
            >
              Testimonials
            </span>
          </div>
          <h2>
            Loved by <span className="text-gradient">Thousands</span>
          </h2>
          <p>See what our users say about their experience with MedAssist.</p>
        </motion.div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-8)",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Quote Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "var(--accent)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <Quote size={18} style={{ color: "var(--primary)" }} aria-hidden="true" />
              </div>

              {/* Stars */}
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  marginBottom: "var(--space-4)",
                }}
                aria-label={`Rated ${testimonial.rating} out of 5`}
              >
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    style={{ color: "#facc15", fill: "#facc15" }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="testimonial-content">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">
                  {testimonial.avatar}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {testimonial.name}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-tertiary)",
                      margin: 0,
                    }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
