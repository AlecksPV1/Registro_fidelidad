"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, User, Phone, Sparkles } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [lookupPhone, setLookupPhone] = useState("");
  const [mode, setMode] = useState<"register" | "lookup">("register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userData, setUserData] = useState<{name: string, visits: number} | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: formData.name, telefono: formData.phone }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setQrCodeUrl(data.qrCodeDataUrl);
        setUserData({ name: formData.name, visits: 0 });
        setIsSuccess(true);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Hubo un error al registrarse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users?phone=${encodeURIComponent(lookupPhone)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setQrCodeUrl(data.user.qr_code_url);
        setUserData({ name: data.user.nombre_cliente, visits: data.user.contador_visitas });
        setIsSuccess(true);
      } else {
        alert("Usuario no encontrado con ese número.");
      }
    } catch (e) {
      alert("Error al buscar usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-container" style={{ alignItems: "center", justifyContent: "center" }}>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel"
            style={{ width: "100%", maxWidth: "420px", padding: "40px 32px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", background: "rgba(33,193,221,0.1)", marginBottom: "16px" }}
              >
                <Sparkles size={32} color="var(--color-1)" />
              </motion.div>
              <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>
                <span className="gradient-text">{mode === "register" ? "Únete al Club" : "Mi Código QR"}</span>
              </h1>
              <p style={{ color: "var(--color-4)", fontSize: "0.95rem" }}>
                {mode === "register" 
                  ? "Regístrate y comienza a ganar recompensas exclusivas hoy mismo."
                  : "Ingresa tu número de teléfono para recuperar tu código QR."}
              </p>
            </div>

            {mode === "register" ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="input-label" htmlFor="name">Nombre Completo</label>
                  <div style={{ position: "relative" }}>
                    <User size={18} color="var(--color-4)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      style={{ paddingLeft: "42px" }}
                      placeholder="Ej. Juan Pérez"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label" htmlFor="phone">Número de Teléfono</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} color="var(--color-4)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      style={{ paddingLeft: "42px" }}
                      placeholder="5551234567"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{ marginTop: "12px" }}
                >
                  {isSubmitting ? "Procesando..." : "Registrarme Ahora"}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="input-label" htmlFor="lookupPhone">Número de Teléfono</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} color="var(--color-4)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="tel"
                      id="lookupPhone"
                      value={lookupPhone}
                      onChange={(e) => setLookupPhone(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: "42px" }}
                      placeholder="5551234567"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{ marginTop: "12px" }}
                >
                  {isSubmitting ? "Buscando..." : "Ver mi Código QR"}
                </motion.button>
              </form>
            )}

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => setMode(mode === "register" ? "lookup" : "register")}
                style={{ background: "transparent", border: "none", color: "var(--color-1)", cursor: "pointer", fontSize: "0.9rem", textDecoration: "underline" }}
              >
                {mode === "register" ? "¿Ya estás registrado? Consulta tu código" : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="glass-panel"
            style={{ width: "100%", maxWidth: "420px", padding: "48px 32px", textAlign: "center" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 size={64} color="var(--color-2)" style={{ margin: "0 auto 24px" }} />
            </motion.div>
            
            <h2 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "12px", color: "var(--foreground)" }}>
              {mode === "register" ? "¡Registro Exitoso!" : "¡Hola de nuevo!"}
            </h2>
            <p style={{ color: "var(--color-4)", marginBottom: "32px", lineHeight: "1.5" }}>
              {mode === "register" 
                ? `Bienvenido, ${userData?.name}. Hemos generado tu código QR personal. Preséntalo en cada visita.`
                : `Bienvenido, ${userData?.name}. Tienes ${userData?.visits} visitas registradas. Preséntalo en tu próxima compra.`}
            </p>

            {qrCodeUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ background: "#fff", padding: "16px", borderRadius: "16px", display: "inline-block", marginBottom: "24px" }}
              >
                <Image src={qrCodeUrl} alt="Tu Código QR" width={200} height={200} />
              </motion.div>
            )}

            {mode === "register" && (
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                Te hemos enviado un mensaje de bienvenida.
              </p>
            )}

            <button
              onClick={() => {
                setIsSuccess(false);
                setFormData({ name: "", phone: "" });
                setLookupPhone("");
              }}
              className="btn-primary"
              style={{ marginTop: "24px", padding: "10px 20px" }}
            >
              Volver al inicio
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ position: "absolute", bottom: "16px", right: "16px" }}>
        <a href="/login" style={{ color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center" }} title="Admin">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </a>
      </footer>
    </main>
  );
}
