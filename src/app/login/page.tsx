"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (e) {
      setError("Error de red");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-container" style={{ alignItems: "center", justifyContent: "center" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ width: "100%", maxWidth: "380px", padding: "40px 32px", textAlign: "center" }}
      >
        <Lock size={48} color="var(--color-1)" style={{ margin: "0 auto 16px" }} />
        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>
          Acceso Administrador
        </h1>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <div>
            <label className="input-label" htmlFor="username">Usuario</label>
            <div style={{ position: "relative" }}>
              <User size={18} color="var(--color-4)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
                placeholder="FidelidadAdmin"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="password">Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--color-4)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "42px" }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p style={{ color: "red", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ marginTop: "8px" }}
          >
            {isLoading ? "Iniciando..." : "Ingresar"}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          style={{ background: "transparent", border: "none", color: "var(--color-4)", marginTop: "24px", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
        >
          Volver al Inicio
        </button>
      </motion.div>
    </main>
  );
}
