// src/components/remedies/RemedyRating.tsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { saveRemedyRating, getRemedyRating } from "@/lib/database";
import toast from "react-hot-toast";

interface RemedyRatingProps {
  remedyId: string;
  remedyName: string;
  onRatingSubmit?: () => void;
}

export function RemedyRating({ remedyId, remedyName, onRatingSubmit }: RemedyRatingProps) {
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [effectiveness, setEffectiveness] = useState(0);
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [review, setReview] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingRating, setExistingRating] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  // Load existing rating
  useEffect(() => {
    if (user && remedyId) {
      loadExistingRating();
    }
  }, [user, remedyId]);

  const loadExistingRating = async () => {
    const { data } = await getRemedyRating(remedyId);
    if (data) {
      const rating = data as {
        rating: number;
        effectiveness?: number;
        ease_of_use?: number;
        review_text?: string;
        would_recommend?: boolean | null;
      };
      setExistingRating(rating);
      setRating(rating.rating);
      setEffectiveness(rating.effectiveness || 0);
      setEaseOfUse(rating.ease_of_use || 0);
      setReview(rating.review_text || "");
      setWouldRecommend(rating.would_recommend ?? null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to rate remedies");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      const { error } = await saveRemedyRating({
        remedy_id: remedyId,
        rating,
        effectiveness: effectiveness || undefined,
        ease_of_use: easeOfUse || undefined,
        review_text: review || undefined,
        would_recommend: wouldRecommend ?? undefined,
      });

      if (error) {
        toast.error("Failed to save rating");
      } else {
        toast.success(existingRating ? "Rating updated!" : "Thanks for your rating!");
        setShowForm(false);
        onRatingSubmit?.();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Star rating component
  const StarRating = ({
    value,
    onChange,
    size = 24,
    readonly = false,
  }: {
    value: number;
    onChange?: (val: number) => void;
    size?: number;
    readonly?: boolean;
  }) => (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          style={{
            background: "none",
            border: "none",
            cursor: readonly ? "default" : "pointer",
            padding: "2px",
          }}
        >
          <Star
            size={size}
            fill={(hoverRating || value) >= star ? "#facc15" : "transparent"}
            stroke={(hoverRating || value) >= star ? "#facc15" : "var(--border-default)"}
          />
        </button>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div
        style={{
          padding: "16px",
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginBottom: "8px" }}>
          Sign in to rate this remedy
        </p>
        <a
          href="/auth/login"
          style={{
            fontSize: "14px",
            color: "var(--primary)",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Sign in →
        </a>
      </div>
    );
  }

  if (!showForm && existingRating) {
    return (
      <div
        style={{
          padding: "16px",
          background: "var(--bg-secondary)",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "4px" }}>
              Your rating
            </p>
            <StarRating value={existingRating.rating} readonly size={20} />
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "8px 16px",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{
          width: "100%",
          padding: "16px",
          background: "var(--bg-secondary)",
          border: "1px dashed var(--border-default)",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "var(--text-tertiary)",
          fontSize: "14px",
        }}
      >
        <Star size={18} />
        Rate this remedy
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      style={{
        padding: "20px",
        background: "var(--bg-secondary)",
        borderRadius: "12px",
      }}
    >
      <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
        Rate {remedyName}
      </h4>

      {/* Overall Rating */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
            color: "var(--text-primary)",
          }}
        >
          Overall Rating *
        </label>
        <StarRating value={rating} onChange={setRating} size={32} />
      </div>

      {/* Effectiveness */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
            color: "var(--text-primary)",
          }}
        >
          Effectiveness
        </label>
        <StarRating value={effectiveness} onChange={setEffectiveness} size={24} />
      </div>

      {/* Ease of Use */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
            color: "var(--text-primary)",
          }}
        >
          Ease of Preparation
        </label>
        <StarRating value={easeOfUse} onChange={setEaseOfUse} size={24} />
      </div>

      {/* Would Recommend */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
            color: "var(--text-primary)",
          }}
        >
          Would you recommend this?
        </label>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            style={{
              padding: "10px 20px",
              background: wouldRecommend === true ? "#dcfce7" : "var(--bg-tertiary)",
              border: wouldRecommend === true ? "1px solid #86efac" : "1px solid var(--border-light)",
              borderRadius: "8px",
              fontSize: "14px",
              color: wouldRecommend === true ? "#166534" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            👍 Yes
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            style={{
              padding: "10px 20px",
              background: wouldRecommend === false ? "#fee2e2" : "var(--bg-tertiary)",
              border: wouldRecommend === false ? "1px solid #fca5a5" : "1px solid var(--border-light)",
              borderRadius: "8px",
              fontSize: "14px",
              color: wouldRecommend === false ? "#991b1b" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            👎 No
          </button>
        </div>
      </div>

      {/* Review Text */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "8px",
            color: "var(--text-primary)",
          }}
        >
          Your Review (optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this remedy..."
          rows={3}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            border: "1px solid var(--border-light)",
            borderRadius: "10px",
            background: "var(--bg-tertiary)",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => setShowForm(false)}
          style={{
            flex: 1,
            padding: "12px",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-light)",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Submit Rating"
          )}
        </button>
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}