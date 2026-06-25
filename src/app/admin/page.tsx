"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ScanLine, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
import QRScanner from "@/components/QRScanner";

import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";

type User = {
  id: string;
  nombre_cliente: string;
  telefono: string;
  contador_visitas: number;
  fecha_registro: string;
};

type Rule = {
  id: string;
  visitNumber: number;
  messageTemplate: string;
  isReset: boolean;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"scan" | "users" | "whatsapp" | "rules">("scan");
  const [users, setUsers] = useState<User[]>([]);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; user?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [waStatus, setWaStatus] = useState<{ status: string, qr: string | null }>({ status: 'LOADING', qr: null });
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Partial<Rule>>({ visitNumber: 1, messageTemplate: "¡Hola {nombre}! Gracias por tu visita.", isReset: false });
  const router = useRouter();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "whatsapp") {
      fetchWaStatus();
      const interval = setInterval(fetchWaStatus, 3000);
      return () => clearInterval(interval);
    } else if (activeTab === "rules") {
      fetchRules();
    }
  }, [activeTab]);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/rules");
      const data = await res.json();
      setRules(data.rules || []);
    } catch (e) {
      console.error("Failed to fetch rules");
    }
  };

  const saveRule = async () => {
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        fetchRules();
        setNewRule({ visitNumber: 1, messageTemplate: "¡Hola {nombre}! Gracias por tu visita.", isReset: false });
      }
    } catch (e) {
      console.error("Failed to save rule");
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("¿Eliminar esta regla?")) return;
    try {
      await fetch("/api/rules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchRules();
    } catch (e) {
      console.error("Failed to delete rule");
    }
  };

  const fetchWaStatus = async () => {
    try {
      const res = await fetch("http://localhost:3001/status");
      const data = await res.json();
      setWaStatus(data);
    } catch (e) {
      setWaStatus({ status: 'ERROR', qr: null });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      console.error("Logout failed");
    }
  };

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    try {
      const parsedData = JSON.parse(decodedText);
      const userId = parsedData.userId;

      if (!userId) throw new Error("Invalid QR code");

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setScanResult({
          success: true,
          message: data.goalReached 
            ? `¡Meta Alcanzada por ${data.user.nombre}! Premio Desbloqueado.`
            : `Visita registrada para ${data.user.nombre}. Total: ${data.user.visitas}`,
          user: data.user
        });
      } else {
        setScanResult({ success: false, message: data.message });
      }

    } catch (err) {
      setScanResult({ success: false, message: "Código QR Inválido." });
    }
  }, []);

  return (
    <main className="page-container" style={{ padding: "0" }}>
      {/* Header Tabs */}
      <header className="glass-panel" style={{ 
        borderRadius: "0 0 24px 24px", 
        padding: "20px 24px", 
        display: "flex", 
        justifyContent: "space-around",
        marginBottom: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
      }}>
        <button 
          onClick={() => { setActiveTab("scan"); setScanResult(null); }}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: activeTab === "scan" ? "var(--color-1)" : "var(--color-4)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            cursor: "pointer", opacity: activeTab === "scan" ? 1 : 0.6,
            transition: "all 0.3s ease"
          }}
        >
          <ScanLine size={28} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Escáner</span>
        </button>

        <button 
          onClick={() => setActiveTab("users")}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: activeTab === "users" ? "var(--color-1)" : "var(--color-4)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            cursor: "pointer", opacity: activeTab === "users" ? 1 : 0.6,
            transition: "all 0.3s ease"
          }}
        >
          <Users size={28} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Clientes</span>
        </button>

        <button 
          onClick={() => setActiveTab("whatsapp")}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: activeTab === "whatsapp" ? "var(--color-1)" : "var(--color-4)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            cursor: "pointer", opacity: activeTab === "whatsapp" ? 1 : 0.6,
            transition: "all 0.3s ease"
          }}
        >
          <MessageCircle size={28} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>WhatsApp</span>
        </button>

        <button 
          onClick={() => setActiveTab("rules")}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: activeTab === "rules" ? "var(--color-1)" : "var(--color-4)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            cursor: "pointer", opacity: activeTab === "rules" ? 1 : 0.6,
            transition: "all 0.3s ease"
          }}
        >
          <Settings size={28} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Reglas</span>
        </button>

        <button 
          onClick={handleLogout}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: "var(--color-4)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            cursor: "pointer", opacity: 0.6,
            transition: "all 0.3s ease",
            marginLeft: "auto"
          }}
          title="Cerrar Sesión"
        >
          <LogOut size={28} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Salir</span>
        </button>
      </header>

      {/* Content Area */}
      <div style={{ padding: "0 24px 24px", flex: 1 }}>
        <AnimatePresence mode="wait">
          {activeTab === "scan" && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
                Escanear Código QR
              </h2>
              
              <div className="glass-panel" style={{ padding: "24px" }}>
                <QRScanner onScanSuccess={handleScanSuccess} />
                
                {scanResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      marginTop: "24px", 
                      padding: "16px", 
                      borderRadius: "12px",
                      background: scanResult.success ? "rgba(33, 193, 221, 0.1)" : "rgba(255, 60, 60, 0.1)",
                      border: `1px solid ${scanResult.success ? "var(--color-1)" : "red"}`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px"
                    }}
                  >
                    {scanResult.success ? <CheckCircle color="var(--color-1)" /> : <AlertCircle color="red" />}
                    <div>
                      <h4 style={{ fontWeight: "700", color: scanResult.success ? "var(--color-1)" : "red", marginBottom: "4px" }}>
                        {scanResult.success ? "Éxito" : "Error"}
                      </h4>
                      <p style={{ fontSize: "0.9rem", color: "var(--foreground)", lineHeight: "1.4" }}>
                        {scanResult.message}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Lista de Clientes
                <button onClick={fetchUsers} style={{ background: "transparent", border: "1px solid var(--color-1)", color: "var(--color-1)", padding: "4px 12px", borderRadius: "16px", fontSize: "0.8rem", cursor: "pointer" }}>
                  Actualizar
                </button>
              </h2>
              
              <div className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {isLoading ? (
                  <p style={{ textAlign: "center", color: "var(--color-4)", padding: "20px" }}>Cargando usuarios...</p>
                ) : users.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--color-4)", padding: "20px" }}>No hay clientes registrados aún.</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                      <div>
                        <h4 style={{ fontWeight: "600", fontSize: "1rem" }}>{user.nombre_cliente}</h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-4)" }}>{user.telefono}</p>
                      </div>
                      <div style={{ background: "rgba(33, 193, 221, 0.2)", color: "var(--color-1)", padding: "8px 16px", borderRadius: "24px", fontWeight: "700", fontSize: "1.1rem" }}>
                        {user.contador_visitas} <span style={{ fontSize: "0.7rem", fontWeight: "400" }}>visitas</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "whatsapp" && (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
                Enlazar WhatsApp
              </h2>
              
              <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <p style={{ textAlign: "center", color: "var(--color-4)", fontSize: "0.95rem", lineHeight: "1.5" }}>
                  Escanea este código QR con la aplicación de WhatsApp en tu celular (Dispositivos Vinculados) para que el sistema pueda enviar los códigos de fidelidad.
                </p>

                <div style={{ background: "white", padding: "16px", borderRadius: "16px", minHeight: "250px", minWidth: "250px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {waStatus.status === 'LOADING' && <p style={{ color: "#0f172a", fontWeight: "600" }}>Cargando...</p>}
                  {waStatus.status === 'ERROR' && <p style={{ color: "red", fontWeight: "600" }}>El servidor de WhatsApp no está corriendo.</p>}
                  {waStatus.status === 'CONNECTED' && <div style={{ textAlign: "center" }}><CheckCircle color="green" size={64} style={{ margin: "0 auto 12px" }} /><p style={{ color: "green", fontWeight: "700" }}>¡WhatsApp Conectado!</p></div>}
                  {waStatus.status === 'DISCONNECTED' && <p style={{ color: "#0f172a", fontWeight: "600" }}>Generando código QR...</p>}
                  {waStatus.status === 'QR_READY' && waStatus.qr && (
                    <img src={waStatus.qr} alt="WhatsApp QR Code" style={{ width: "250px", height: "250px" }} />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "rules" && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
                Reglas de Mensajería
              </h2>
              
              <div className="glass-panel" style={{ padding: "16px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "12px", color: "var(--color-1)" }}>Agregar Regla</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-4)", marginBottom: "4px" }}>Número de Visita</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="input-field" 
                      value={newRule.visitNumber} 
                      onChange={(e) => setNewRule({...newRule, visitNumber: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-4)", marginBottom: "4px" }}>Mensaje (usa {'{nombre}'} para insertar nombre)</label>
                    <textarea 
                      className="input-field" 
                      rows={3} 
                      value={newRule.messageTemplate} 
                      onChange={(e) => setNewRule({...newRule, messageTemplate: e.target.value})} 
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                      type="checkbox" 
                      id="isReset"
                      checked={newRule.isReset} 
                      onChange={(e) => setNewRule({...newRule, isReset: e.target.checked})} 
                      style={{ width: "20px", height: "20px" }}
                    />
                    <label htmlFor="isReset" style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>Esta visita reinicia el contador a 0 (ej. Premio Reclamado)</label>
                  </div>
                  <button onClick={saveRule} className="btn-primary" style={{ marginTop: "8px" }}>
                    Guardar Regla
                  </button>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--color-1)" }}>Reglas Actuales</h3>
                {rules.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--color-4)", padding: "20px" }}>No hay reglas configuradas.</p>
                ) : (
                  rules.map((r) => (
                    <div key={r.id} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid var(--card-border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ background: "rgba(33, 193, 221, 0.2)", color: "var(--color-1)", padding: "4px 12px", borderRadius: "16px", fontWeight: "700", fontSize: "0.9rem" }}>
                          Visita #{r.visitNumber} {r.isReset && "(Reinicia Contador)"}
                        </div>
                        <button onClick={() => deleteRule(r.id)} style={{ background: "transparent", border: "none", color: "red", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
                          Eliminar
                        </button>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--foreground)", whiteSpace: "pre-wrap" }}>{r.messageTemplate}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
