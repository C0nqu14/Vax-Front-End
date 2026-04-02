import { useState, useEffect } from "react";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight,
  AlertCircle,
  Briefcase,
  Target,
  Loader2,
  Search,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { normalizarCategoria } from "../constants";

export const MyCampaignsPage = () => {
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) return;

        // Buscamos as campanhas com o JOIN dos financiamentos para soma real
        const { data: supaData, error: supaError } = await supabase
          .from("campanhas")
          .select(`
            *,
            financiamento (
              valor,
              estado_pagamento
            )
          `)
          .eq("usuario_id", user.id)
          .order("data_criacao", { ascending: false });

        if (supaError) throw supaError;

        // Processamento e Normalização (Cálculo da Arrecadação Real)
        const normalized = (supaData || []).map((c: any) => {
          // Filtramos apenas pagamentos concluídos para a soma real
          const financiamentosValidos = (c.financiamento || [])
            .filter((f: any) => f.estado_pagamento === 'concluido' || f.estado_pagamento === 'sucesso');
          
          const somaReal = financiamentosValidos.reduce((acc: number, f: any) => acc + Number(f.valor), 0);

          return {
            ...c,
            categoria: normalizarCategoria(c.categoria || ""),
            estado: (c.estado || "pendente").toString().toLowerCase(),
            valor_arrecadado: somaReal, // Substituímos o valor estático pelo real auditado
            contagem_apoios: financiamentosValidos.length
          };
        });

        setCampanhas(normalized);
      } catch (err: any) {
        console.error("Erro ao carregar campanhas:", err);
        setError("Não foi possível sincronizar seus dados com o banco do Cazenga.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyCampaigns();
  }, [user]);

  // Cálculos de Totais para os Stats
  const totalArrecadado = campanhas.reduce((acc, curr) => acc + curr.valor_arrecadado, 0);
  const totalMeta = campanhas.reduce((acc, curr) => acc + (Number(curr.valor_meta) || 0), 0);
  
  const filtered = campanhas.filter(c => 
    (c.titulo?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
         <Loader2 className="w-16 h-16 text-vax-primary animate-spin" />
         <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-vax-primary opacity-50" />
         </div>
      </div>
      <p className="text-sm font-bold text-vax-primary animate-pulse tracking-[0.2em] uppercase">Sincronizando Seus Impactos...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 mt-8">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <Badge variant="info" className="bg-vax-primary/10 text-vax-primary border-none px-4 py-1.5 font-bold tracking-widest text-[10px] uppercase">Painel do Usuário</Badge>
              <div className="h-1 w-1 bg-slate-300 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controlo de Fluxo</span>
           </div>
           <h1 className="text-5xl font-bold text-vax-primary tracking-tighter">Minhas Iniciativas</h1>
           <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-2xl">
             Gerencie a arrecadação e o progresso das suas causas de impacto no Cazenga.
           </p>
        </div>
        <Button 
          onClick={() => navigate("/campanhas/nova")}
          leftIcon={<Plus className="w-6 h-6" />}
          className="shadow-2xl shadow-vax-primary/20 px-10 py-8 text-xl font-bold rounded-[32px] w-full xl:w-auto"
        >
          Lançar Ideia
        </Button>
      </header>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatSummary 
          label="Total Arrecadado" 
          value={`${totalArrecadado.toLocaleString()} KZ`} 
          icon={<TrendingUp className="w-5 h-5 text-vax-success-DEFAULT" />} 
          subText={`${totalMeta > 0 ? Math.round((totalArrecadado / totalMeta) * 100) : 0}% da meta atingida`}
        />
        <StatSummary 
          label="Causas Criadas" 
          value={campanhas.length.toString()} 
          icon={<Briefcase className="w-5 h-5 text-vax-primary" />} 
          subText="Registo Vitalício"
        />
        <StatSummary 
          label="Metas Batidas" 
          value={campanhas.filter(c => c.valor_arrecadado >= Number(c.valor_meta)).length.toString()} 
          icon={<Target className="w-5 h-5 text-amber-500" />} 
          subText="Impacto Concluído"
        />
        <StatSummary 
          label="Total Apoiadores" 
          value={campanhas.reduce((acc, curr) => acc + curr.contagem_apoios, 0).toString()} 
          icon={<Users className="w-5 h-5 text-vax-primary" />} 
          subText="Vizinhos engajados"
        />
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
           <h3 className="text-2xl font-bold text-vax-primary tracking-tight">Projetos em Andamento ({campanhas.length})</h3>
           <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-vax-primary transition-colors" />
              <input 
                type="text"
                placeholder="Filtrar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-vax-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-vax-primary transition-all shadow-sm"
              />
           </div>
        </div>
        
        <AnimatePresence>
          {error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 border-vax-error-DEFAULT/20 bg-vax-error-light/10 text-center rounded-[40px]">
               <AlertCircle className="w-12 h-12 text-vax-error-DEFAULT mx-auto mb-4" />
               <p className="font-bold text-vax-error-DEFAULT text-lg">{error}</p>
               <Button className="mt-6 bg-vax-error-DEFAULT" onClick={() => window.location.reload()}>Tentar Re-sincronizar</Button>
            </motion.div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {filtered.map((c) => (
                <CampaignManagementRow key={c.id} campaign={c} onClick={() => navigate(`/campanhas/${c.id}`)} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-24 text-center border-dashed border-2 rounded-[60px] flex flex-col items-center bg-slate-50/50">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl border border-vax-border">
                  <Plus className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-3xl font-bold text-vax-primary tracking-tighter">O Cazenga espera pela sua ideia</h3>
               <p className="text-slate-500 mt-4 font-medium max-w-sm mx-auto text-lg leading-relaxed">Não encontramos iniciativas registradas.</p>
               <Button onClick={() => navigate("/campanhas/nova")} className="mt-12 px-12 py-7 text-lg font-bold shadow-xl">
                 Criar Primeira Campanha
               </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatSummary = ({ label, value, icon, subText }: any) => (
  <Card className="p-8 group hover:border-vax-primary transition-all bg-white border-vax-border/50 shadow-vax">
    <div className="flex flex-col gap-6">
      <div className="w-12 h-12 bg-vax-input rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">{icon}</div>
      <div>
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-bold text-vax-primary tracking-tighter tabular-nums">{value}</span>
        <p className="text-[9px] font-bold text-vax-primary/60 mt-1 uppercase tracking-wider">{subText}</p>
      </div>
    </div>
  </Card>
);

const CampaignManagementRow = ({ campaign, onClick }: any) => {
  const percentage = Math.min((campaign.valor_arrecadado / Number(campaign.valor_meta || 1)) * 100, 100);
  
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card 
        onClick={onClick}
        className="p-8 flex flex-col md:flex-row items-center gap-10 group hover:border-vax-primary transition-all cursor-pointer border-vax-border/50 shadow-vax rounded-[40px] bg-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-vax-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="w-32 h-32 bg-vax-input rounded-[32px] overflow-hidden shrink-0 shadow-lg border border-vax-border">
           {campaign.imagem_url ? (
              <img src={campaign.imagem_url} alt={campaign.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
           ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                 <Briefcase className="w-10 h-10" />
              </div>
           )}
        </div>
        
        <div className="flex-1 space-y-6 w-full">
           <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <Badge variant="neutral" className="bg-vax-input text-vax-primary border-none text-[9px] px-3 font-bold uppercase">{campaign.categoria || 'Social'}</Badge>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> Expira em {new Date(campaign.data_fim).toLocaleDateString()}
                    </span>
                 </div>
                 <h3 className="text-3xl font-bold text-vax-primary tracking-tighter">{campaign.titulo}</h3>
              </div>
              
              <div className="xl:text-right bg-vax-input/40 p-4 rounded-3xl border border-vax-border px-8">
                 <span className="block text-3xl font-bold text-vax-primary leading-none tabular-nums">
                    {campaign.valor_arrecadado.toLocaleString()} <span className="text-sm font-medium opacity-30">AKZ</span>
                 </span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Auditado Real</span>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center gap-6">
                 <div className="flex-1 h-3 bg-vax-input rounded-full overflow-hidden shadow-inner border border-vax-border/30">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${percentage >= 100 ? 'bg-vax-success-DEFAULT' : 'bg-vax-primary'} shadow-lg`} 
                    />
                 </div>
                 <div className="flex items-baseline gap-1">
                    <span className="font-bold text-vax-primary text-xl tabular-nums">{Math.round(percentage)}</span>
                    <span className="text-[10px] font-bold text-slate-400">%</span>
                 </div>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-vax-border/50">META: {Number(campaign.valor_meta).toLocaleString()} AKZ</span>
                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-vax-border/50">{campaign.contagem_apoios} APOIOS</span>
                 </div>
                 <span className="flex items-center gap-2 text-vax-primary group-hover:translate-x-1 transition-transform">PAINEL DE GESTÃO <ChevronRight className="w-4 h-4" /></span>
              </div>
           </div>
        </div>
      </Card>
    </motion.div>
  );
};