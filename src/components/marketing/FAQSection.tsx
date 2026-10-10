// src/components/marketing/FAQSection.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const faqs = [
  {
    question: "Is MedAssist a doctor or a medical device?",
    answer:
      "No. MedAssist is an informational health assistant. It never diagnoses, prescribes, or replaces professional medical advice. Every AI response is labeled informational, and the app is not a medical device.",
  },
  {
    question: "Is MedAssist free to use?",
    answer:
      "Yes — symptom analysis, AI chat, the remedies library, and your private history are all free. There are no subscriptions or paywalls.",
  },
  {
    question: "Is my health data private?",
    answer:
      "Your data is visible only to you, encrypted at rest, and never sold or used for ads. You can export everything or delete your account and all associated data at any time from Settings.",
  },
  {
    question: "What happens in an emergency?",
    answer:
      "If your description matches emergency language, MedAssist immediately shows emergency-services guidance with local numbers (911 in the US/Canada, 999 in the UK, 112 in the EU and many regions). When in doubt, call your local emergency number.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Yes — a free account keeps your history, saved remedies, and ratings private and synced across devices. Signing up takes less than a minute with just an email and password.",
  },
  {
    question: "Can I use MedAssist offline?",
    answer:
      "MedAssist is a Progressive Web App: install it to your home screen, and core pages remain available offline with a branded fallback page. AI features need a connection.",
  },
];

function FAQItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: (typeof faqs)[number];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const contentId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className={`faq-item${isOpen ? " faq-item-open" : ""}`}>
      <h3 style={{ margin: 0 }}>
        <button
          id={buttonId}
          type="button"
          className="faq-question"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span>{item.question}</span>
          <ChevronDown
            size={20}
            className={`faq-chevron${isOpen ? " faq-chevron-open" : ""}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      {prefersReducedMotion ? (
        isOpen && (
          <div id={contentId} role="region" aria-labelledby={buttonId} className="faq-answer-inner">
            {item.answer}
          </div>
        )
      ) : (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              id={contentId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="faq-answer-inner">{item.answer}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-premium" aria-labelledby="faq-heading">
      <div className="container">
        <Reveal>
          <SectionHeader
            eyebrow="FAQ"
            title={
              <>
                Questions, <span className="text-gradient-premium">answered</span>
              </>
            }
            description="Everything you might want to know before you start."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="faq-list">
            {faqs.map((item, index) => (
              <FAQItem
                key={item.question}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
