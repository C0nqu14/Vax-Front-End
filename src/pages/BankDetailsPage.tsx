import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  User, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle,
  Hash,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

const bankOptions = [
  { value: "", label: "Seleccione o Banco" },
  { value: "BAI", label: "Banco Angolano de Investimentos (BAI)" },
  { value: "BFA", label: "Banco de Fomento Angola (BFA)" },
  { value: "BIC", label: "Banco BIC" },
  { value: "ATLANTICO", label: "Banco Millennium Atlântico" },
  { value: "BPC", label: "Banco de Poupança e Crédito (BPC)" },
  { value: "STANDARD", label: "Standard Bank Angola" },
  { value: "SOL", label: "Banco Sol" },
  { value: "BCGA", label: "Banco Caixa Geral Angola (BCGA)" },
];

export const BankDetailsPage = () => {
  const [nomeTitular, setNomeTitular] = useState("");
  const [banco, setBanco] = useState("");
  const [numeroConta, setNumeroConta] = useState("");
  const [iban, setIban] = useState("AO06");
  const [swift, setSwift] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const response = await api.get("/usuario/banco");
        if (response.data && response.data.iban) {
          const d = response.data;
          setNomeTitular(d.nome_titular || "");
          setBanco(d.banco || "");
          setNumeroConta(d.numero_conta || "");
          setIban(d.iban || "AO06");
          setSwift(d.swift || "");
        }
      } catch (err) {
        console.error("Erro ao carregar dados bancários");
      } finally {
        setFetching(false);
      }
    };
    fetchBankData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post("/usuario/banco", {
        nome_titular: nomeTitular,
        banco,
        numero_conta: numeroConta,
        iban,
        swift
      });
      setMessage({ type: 'success', text: "Dados bancários salvos com sucesso!" });
      setTimeout(() => navigate("/perfil"), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Erro ao salvar dados." });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-vax-input border-t-vax-primary rounded-full animate-spin" />
      <p className="text-sm font-bold text-vax-primary animate-pulse">Buscando dados seguros...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="info" className="mb-4">SEGURANÇA FINANCEIRA</Badge>
          <h1 className="text-4xl font-bold text-vax-primary tracking-tight">Dados Bancários</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Configure sua conta para recebimento de apoios e doações.</p>
        </div>
        <div className="w-16 h-16 bg-vax-primary rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
          <Building2 className="w-8 h-8" />
        </div>
      </header>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-5 rounded-vax flex items-center gap-4 border shadow-sm ${
              message.type === 'success' 
              ? 'bg-vax-success-light border-vax-success-DEFAULT/20 text-vax-success-DEFAULT' 
              : 'bg-vax-error-light border-vax-error-DEFAULT/20 text-vax-error-DEFAULT'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-tight">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Holder Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-vax-primary flex items-center gap-2">
               <User className="w-5 h-5" /> Titularidade
            </h3>
            <Card className="p-8 space-y-6">
              <Input 
                label="Nome do Titular"
                placeholder="Ex: Samuel Cabita"
                value={nomeTitular}
                onChange={(e) => setNomeTitular(e.target.value)}
                required
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input 
                label="NIF / BI associado"
                placeholder="Opcional"
                leftIcon={<Hash className="w-4 h-4" />}
              />
            </Card>
          </div>

          {/* Account Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-vax-primary flex items-center gap-2">
               <CreditCard className="w-5 h-5" /> Detalhes da Conta
            </h3>
            <Card className="p-8 space-y-6">
              <Select 
                label="Seu Banco"
                options={bankOptions}
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                required
                leftIcon={<Building2 className="w-4 h-4" />}
              />
              <Input 
                label="Número da Conta"
                placeholder="000.000.000"
                value={numeroConta}
                onChange={(e) => setNumeroConta(e.target.value)}
                required
                leftIcon={<Hash className="w-4 h-4" />}
              />
            </Card>
          </div>
        </div>

        {/* Global Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-vax-primary flex items-center gap-2">
             <Globe className="w-5 h-5" /> Identificação Bancária
          </h3>
          <Card className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-2">
                 <Input 
                   label="IBAN (Exclusivo Angola)"
                   value={iban}
                   onChange={(e) => setIban(e.target.value)}
                   required
                   leftIcon={<Building2 className="w-4 h-4" />}
                   className="font-mono tracking-widest text-[#1a3a4c]"
                 />
               </div>
               <Input 
                 label="Cód. SWIFT (Opcional)"
                 placeholder="Cód. Internacional"
                 value={swift}
                 onChange={(e) => setSwift(e.target.value)}
                 leftIcon={<Globe className="w-4 h-4" />}
               />
            </div>
            
            <div className="p-5 bg-vax-success-light/30 border border-dashed border-vax-success-DEFAULT/30 rounded-vax flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-vax-success-DEFAULT shrink-0 mt-0.5" />
              <div>
                 <p className="text-xs font-bold text-vax-success-DEFAULT mb-1">PROTEÇÃO BNA</p>
                 <p className="text-xs text-vax-success-DEFAULT/80 leading-relaxed font-medium">
                   Seus dados são criptografados com o padrão AES-256-GCM. A VAX não tem acesso direto aos seus fundos, apenas facilita a liquidação via canais oficiais.
                 </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <Button 
            type="submit"
            isLoading={loading}
            className="flex-1 py-6 text-lg font-bold shadow-xl shadow-vax-primary/10"
            leftIcon={!loading && <CheckCircle2 className="w-5 h-5" />}
          >
            Guardar Dados Bancários
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="md:w-1/3 py-6 text-lg font-bold bg-white text-slate-400 hover:text-vax-primary border-vax-border"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
