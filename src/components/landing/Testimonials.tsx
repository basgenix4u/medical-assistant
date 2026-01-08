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
    <section id="testimonials" className="section bg-surface">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
            <Star size={14} className="text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>
          <h2>
            Loved by <span className="text-gradient">Thousands</span>
          </h2>
          <p>
            See what our users say about their experience with MedAssist.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Quote size={18} className="text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="testimonial-content">&quot;{testimonial.content}&quot;</p>

              {/* Author */}
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                  <p className="text-sm text-muted">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}