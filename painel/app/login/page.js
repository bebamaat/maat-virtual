"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#e8f4ff",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "#FDFDFD",
        borderRadius: "16px",
        padding: "3rem 2.5rem",
        boxShadow: "0 8px 32px rgba(25,67,58,0.12)",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%",
      }}>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "2rem",
          fontWeight: 800,
          color: "#19433A",
          letterSpacing: "4px",
          marginBottom: "0.3rem",
        }}>MAAT</h1>
        <p style={{
          fontSize: "0.85rem",
          color: "#8a9691",
          marginBottom: "2rem",
          fontWeight: 500,
        }}>VIRTUAL — Painel Central</p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            width: "100%",
            padding: "0.9rem 1.5rem",
            border: "2px solid #19433A",
            borderRadius: "50px",
            background: "#19433A",
            color: "#FDFDFD",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseOver={e => { e.target.style.background = "#E07434"; e.target.style.borderColor = "#E07434"; }}
          onMouseOut={e => { e.target.style.background = "#19433A"; e.target.style.borderColor = "#19433A"; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Entrar com Google
        </button>

        <p style={{
          marginTop: "1.5rem",
          fontSize: "0.75rem",
          color: "#8a9691",
        }}>Somente emails @bebamaat.com.br</p>
      </div>
    </div>
  );
}
