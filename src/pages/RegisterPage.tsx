import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle, Mail, Loader2, User, Lock, Fingerprint, CheckCircle2, ArrowRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import logo from "../../assets/vax-logo.png";

export const RegisterPage = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Adicionado para experiência de usuário
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nifData, setNifData] = useState<any>(null);
  const [isValidatingNif, setIsValidatingNif] = useState(false);
  const [nifError, setNifError] = useState<string | null>(null);

  const navigate = useNavigate();

  // --- LÓGICA DE SENHA FORTE (ESTILO SITES FAMOSOS) ---
  const requirements = useMemo(() => [
    { label: "8+ Caracteres", met: password.length >= 8 },
    { label: "Letra Maiúscula", met: /[A-Z]/.test(password) },
    { label: "Número", met: /[0-9]/.test(password) },
    { label: "Símbolo (@#$%)", met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (password.length === 0) return { label: "Inexistente", color: "bg-slate-100", text: "text-slate-400", width: "5%" };
    if (metCount <= 2) return { label: "Fraca", color: "bg-red-500", text: "text-red-500", width: "33%" };
    if (metCount === 3) return { label: "Média", color: "bg-orange-400", text: "text-orange-400", width: "66%" };
    return { label: "Forte", color: "bg-green-500", text: "text-green-500", width: "100%" };
  }, [requirements, password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const showMismatchWarning = confirmPassword.length > 0 && password !== confirmPassword;

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  useEffect(() => {
    const validateNIF = async () => {
      if (nif.length < 9) {
        setNifData(null);
        setNifError(null);
        return;
      }

      setIsValidatingNif(true);
      setNifError(null);

      try {
        const response = await fetch(`https://vaquinha.ao/nif/${nif}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setNifData(data.data);

            if (nome.trim().length > 5) {
               const apiWords = normalize(data.data.nome).split(/\s+/);
               const inputWords = normalize(nome).split(/\s+/);
               const nameMatches = inputWords.length >= 2 && inputWords.every(word => apiWords.includes(word));

               if (!nameMatches) {
                 setNifError("O nome não corresponde ao titular deste NIF.");
               } else if (data.data.estado !== 'Activo') {
                 setNifError("Este NIF encontra-se inativo (AGT).");
               }
            }
          } else {
            setNifError("NIF inválido ou não localizado.");
            setNifData(null);
          }
        } else {
          setNifError("Erro ao consultar serviço de NIF.");
        }
      } catch (err) {
        console.error("Erro NIF API:", err);
      } finally {
        setIsValidatingNif(false);
      }
    };

    const timer = setTimeout(validateNIF, 800);
    return () => clearTimeout(timer);
  }, [nif, nome]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas digitadas não são iguais.");
      return;
    }

    if (strength.label !== "Forte") {
      setError("Aumente a segurança da sua senha antes de prosseguir.");
      return;
    }

    if (nifError) {
      setError(nifError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/registar", {
        nome_completo: nome,
        email,
        nif,
        senha: password
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Falha ao criar conta. Verifique os dados fornecidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-vax-bg items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center bg-white border-b border-vax-border z-10 transition-all">
         <div className="flex items-center gap-3">
            <img src={logo} alt="VAX" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
         </div>
         <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-400 hidden sm:block">Já possui acesso?</span>
            <Button variant="outline" className="border-vax-border text-vax-primary hover:bg-vax-primary hover:text-white" onClick={() => navigate('/login')}>Entrar</Button>
         </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[580px] pt-32 pb-12 relative z-0"
      >
        <div className="mb-10 text-center">
          <Badge variant="info" className="mb-4 bg-vax-primary text-white border-none px-4 py-1.5 font-bold uppercase tracking-wider">Identidade Digital</Badge>
          <h2 className="text-4xl font-bold text-vax-primary tracking-tighter mb-3">Bem-vindo à Mudança</h2>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">Sua conta será validada através da AGT para garantir a segurança dos fundos.</p>
        </div>

        <div className="bg-white rounded-[40px] border border-vax-border shadow-2xl shadow-vax-primary/5 p-8 md:p-12 relative overflow-hidden">
          <AnimatePresence>
            {(error || showMismatchWarning) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mb-8 bg-vax-error-light border border-vax-error-DEFAULT/20 p-4 rounded-2xl text-vax-error-DEFAULT text-sm font-bold flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {showMismatchWarning ? "As senhas não coincidem" : error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-vax-success-light border border-vax-success-DEFAULT/20 p-6 rounded-2xl flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-vax-success-DEFAULT" />
                </div>
                <div>
                   <p className="text-base font-bold text-vax-success-DEFAULT">Perfil Criado com Sucesso! 🎉</p>
                   <p className="text-xs text-vax-success-DEFAULT/80 mt-1">Sua identidade foi verificada. Redirecionando para o login...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <Input
                    label="Nome Titular"
                    placeholder="Nome completo no BI"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">Será validado com o NIF</p>
               </div>

               <div className="space-y-1.5 relative">
                  <Input
                    label="NIF de Cadastro"
                    placeholder="9 dígitos obrigatórios"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    required
                    leftIcon={<Fingerprint className="w-4 h-4" />}
                    rightIcon={isValidatingNif ? <Loader2 className="w-4 h-4 animate-spin text-vax-primary" /> : null}
                  />

                  <AnimatePresence>
                    {nifData && !nifError && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="absolute -bottom-6 left-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-vax-success-DEFAULT" />
                        <span className="text-[9px] font-bold text-vax-success-DEFAULT uppercase tracking-widest truncate max-w-[180px]">
                           {nifData.nome}
                        </span>
                      </motion.div>
                    )}
                    {nifError && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="absolute -bottom-6 left-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-vax-error-DEFAULT" />
                        <span className="text-[9px] font-bold text-vax-error-DEFAULT uppercase tracking-widest">{nifError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            <Input
              label="E-mail Corporativo ou Pessoal"
              type="email"
              placeholder="exemplo@dominio.ao"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {/* SEÇÃO DE SENHA E STATUS VISUAL */}
            <div className="space-y-3">
              <Input
                label="Senha de Acesso"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />
              
              {password.length > 0 && (
                <div className="px-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${strength.text}`}>Senha {strength.label}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{strength.width} segura</span>
                  </div>
                  
                  {/* Barra de Status Dinâmica */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: strength.width }}
                      className={`h-full transition-all duration-500 ${strength.color}`} 
                    />
                  </div>

                  {/* Checklist de Requisitos */}
                  <div className="grid grid-cols-2 gap-2">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        {req.met ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-slate-300" />}
                        <span className={`text-[9px] font-bold uppercase ${req.met ? "text-green-600" : "text-slate-400"}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

             <Input
              label="Confirmação de Senha"
              type="password"
              placeholder="Digite a mesma senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              leftIcon={<ShieldCheck className={`w-4 h-4 ${passwordsMatch ? "text-green-500" : ""}`} />}
              className={showMismatchWarning ? "border-red-500 focus:ring-red-100" : passwordsMatch ? "border-green-500" : ""}
            />

            <div className="text-[9px] font-bold text-vax-primary uppercase">
              Ao tocares em Finalizar Ativação, aceitas a criação de uma conta e os <Link to="/termos" className="text-vax-primary hover:underline">Termos de Serviço</Link>, a <Link to="/politica-privacidade" className="text-vax-primary hover:underline">Política de Privacidade</Link> e a <Link to="/politica-taxas" className="text-vax-primary hover:underline">Política de Taxas</Link> da Vax.
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-xs font-black shadow-xl shadow-vax-primary/20 group uppercase tracking-[0.2em] rounded-full"
              isLoading={loading}
              disabled={success || isValidatingNif || !!nifError || strength.label !== "Forte" || !passwordsMatch}
              rightIcon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
            >
              Finalizar Ativação
            </Button>
          </form>
        </div>

        <div className="mt-12 flex justify-center items-center gap-6 opacity-30">
           {["Criptografia Ponta-a-Ponta", "Conformidade AGT", "Proteção de Dados"].map((text, i) => (
             <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-vax-primary uppercase tracking-[0.15em] whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5" /> {text}
             </div>
           ))}
        </div>
      </motion.div>
    </div>
  );
};