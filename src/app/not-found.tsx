import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        gap: "16px",
      }}
    >
      <p
        aria-hidden="true"
        style={{
          fontSize: "72px",
          fontWeight: 800,
          color: "var(--primary)",
          margin: 0,
        }}
      >
        404
      </p>
      <h1 style={{ fontSize: "24px", margin: 0, color: "var(--text-primary)" }}>
        Page not found
      </h1>
      <p style={{ color: "var(--text-tertiary)", maxWidth: "400px" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "16px",
          padding: "12px 24px",
          background: "var(--primary)",
          color: "white",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Back to home
      </Link>
    </main>
  );
}
