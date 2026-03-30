import { Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, LogOut, Loader2, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useAuth } from "../contexts/AuthContext";

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAdmin, loading, logout } = useAuth();
  const token = localStorage.getItem("vax_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-vax-bg">
        <Loader2 className="w-10 h-10 text-vax-primary animate-spin" />
        <span className="text-[10px] font-black text-vax-primary uppercase tracking-[0.3em] animate-pulse">A verificar sessão...</span>
      </div>
    );
  }

  // Admin nunca é bloqueado. Utilizadores sem NIF ativo são bloqueados.
  const isInactive = user && !user.ativo && !isAdmin;

  return (
    <div className="flex min-h-screen bg-vax-bg overflow-x-hidden relative">
      <AnimatePresence>
        {isInactive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full"
            >
              <Card className="p-12 border-4 border-vax-error-DEFAULT/30 shadow-3xl bg-white rounded-[40px] text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-vax-error-DEFAULT" />
                <div className="w-20 h-20 bg-vax-error-light/30 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <ShieldAlert className="w-10 h-10 text-vax-error-DEFAULT" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-vax-primary tracking-tighter leading-none">Acesso Bloqueado</h2>
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-vax-error-DEFAULT" />
                    <span className="text-[10px] font-black text-vax-error-DEFAULT uppercase tracking-[0.3em]">Protocolo AF-NIF (AGT/SEPE)</span>
                  </div>
                  <p className="text-slate-500 text-base font-medium leading-relaxed max-w-xs mx-auto">
                    Conta suspensa por <span className="text-vax-error-DEFAULT font-black">NIF Pendente ou Inativo</span>.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-vax-primary"
                    onClick={() => window.location.href = "mailto:suporte@vax.ao"}
                  >
                    Contactar Suporte
                  </Button>
                  <Button
                    onClick={logout}
                    className="w-full bg-vax-primary h-11 rounded-full shadow-xl shadow-vax-primary/20 text-sm font-black uppercase tracking-widest"
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Sair e Trocar de Perfil
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-10 bg-vax-input/30">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
