import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, senha: password });
      
      const token = response.data.token;
      const user = response.data.user;

      // Guardar token imediatamente para que o próximo pedido seja autenticado
      localStorage.setItem("vax_token", token);

      // --- VERIFICAÇÃO DE ADMIN SEGURA (Backend-driven) ---
      // Testamos um endpoint exclusivo de admin. O servidor decide quem tem acesso.
      // Se responder 200 → is_admin: true. Se 403 → utilizador normal.
      let isAdminUser = false;
      try {
        await api.get("/admin/usuarios");
        isAdminUser = true; // Só chega aqui se o backend autorizou
      } catch {
        isAdminUser = false; // 403 Forbidden → não é admin
      }

      // Guardar utilizador com flag de admin definida pelo próprio servidor
      localStorage.setItem("vax_user", JSON.stringify({ ...user, is_admin: isAdminUser }));

      navigate("/dashboard");
    } catch (err: any) {
      // Limpar token se o login falhou
      localStorage.removeItem("vax_token");
      setError(err.response?.data?.error || "Nome ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-vax-bg items-center justify-center p-4 relative overflow-hidden">
      {/* Header Logo purely for Auth */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center bg-white border-b border-vax-border z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-vax-primary rounded-xl flex items-center justify-center text-white">
                <Mail className="w-6 h-6" />
             </div>
             <span className="text-xl font-bold text-vax-primary tracking-tight">Vax</span>
          </div>
          <Button variant="outline" className="bg-vax-input" leftIcon={<HelpCircle className="w-4 h-4" />}>
             Ajuda
          </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-white rounded-vax border border-vax-border shadow-vax p-10 pt-12 mt-20 relative z-0"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-vax-primary tracking-tight mb-2">Bem-vindo de volta</h2>
          <p className="text-slate-500 text-sm">Acesse sua conta com segurança para gerenciar seus investimentos</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 bg-vax-error-light border border-vax-error-DEFAULT/20 p-4 rounded-vax flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <AlertCircle className="w-5 h-5 text-vax-error-DEFAULT" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-vax-error-DEFAULT uppercase tracking-wider">Erro de acesso</span>
                  <button type="button" onClick={() => setError(null)} className="text-[10px] font-bold text-vax-error-DEFAULT hover:underline uppercase">Tentar novamente {'>'}</button>
                </div>
                <p className="text-sm text-vax-error-DEFAULT font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Usuário ou E-mail"
            type="email"
            placeholder="Seu nome de usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-sm font-medium text-vax-primary">Senha</label>
              <button type="button" className="text-xs font-bold text-vax-primary/60 hover:text-vax-primary transition-colors">Esqueci minha senha</button>
            </div>
            <Input 
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          <div className="flex items-center gap-2 px-1">
            <input 
              id="remember" 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-vax-border text-vax-primary focus:ring-vax-primary/20 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs font-semibold text-vax-primary/60 cursor-pointer select-none">Lembrar deste dispositivo</label>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-base font-bold shadow-md shadow-vax-primary/10"
            isLoading={loading}
          >
            Entrar na conta
          </Button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            Ainda não tem uma conta?{" "}
            <Link to="/register" className="text-vax-primary font-bold hover:underline ml-1">Criar conta</Link>
          </p>
        </div>
      </motion.div>
      
      <div className="absolute bottom-6 text-center w-full">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           © 2024 Crowdfund Fintech. Conectando investidores e projetos inovadores.
         </p>
      </div>
    </div>
  );
};

