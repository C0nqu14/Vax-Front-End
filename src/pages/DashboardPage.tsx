import { useEffect, useState } from "react";
import { 
  TrendingUp, Users, Briefcase, ChevronRight, Globe,
  ArrowUpRight, Plus, Loader2, Target, ShieldAlert,
  BarChart3, ArrowRight, AlertTriangle, User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { supabase } from "../services/supabase";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { normalizarCategoria } from "../constants";

export const DashboardPage = () => {
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const normalizeCampaignStatus = (status: string) => {
    const clean = (status || "").toString().toLowerCase().trim();
    if (["ativa", "ativo", "active"].includes(clean)) return "ativa";
    if (["suspensa", "suspenso", "suspended"].includes(clean)) return "suspensa";
    if (["concluida", "concluido", "completed", "finalizada", "finalizado"].includes(clean)) return "concluida";
    if (["falhada", "falho", "failed"].includes(clean)) return "falhada";
    return "ativa";
  };

  const normalizeCampaign = (c: any) => {
    const financiamentosConcluidos = (c.financiamento || [])
      .filter((f: any) => f.estado_pagamento === 'concluido');
    
    const valor_arrecadado_real = financiamentosConcluidos.reduce((acc: number, f: any) => acc + Number(f.valor), 0);
    const valor_meta = Number(c.valor_meta ?? c.meta ?? c.target ?? c.goal ?? 0);
    const estado = normalizeCampaignStatus(c.estado || c.status || "");

    return {
      ...c,
      id: c.id || c._id,
      titulo: c.titulo || c.title || "Sem título",
      categoria: normalizarCategoria(c.categoria || ""),
      estado,
      valor_arrecadado: valor_arrecadado_real, 
      valor_meta,
      financiamento: c.financiamento || [],
      imagem_url: c.imagem_url || "",
      usuario_id: c.usuario_id || c.user_id,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (isAdmin) {
          const { data: campanhasData, error: cpErr } = await supabase
            .from("campanhas")
            .select("*, financiamento(valor, estado_pagamento)")
            .order("data_criacao", { ascending: false });

          const { data: usuarios } = await supabase.from("usuarios").select("id");
          const { data: denuncias } = await supabase.from("denuncias").select("id, estado");

          if (cpErr) throw cpErr;

          const normalized = (campanhasData || []).map(c => normalizeCampaign(c));
          setCampanhas(normalized);
          setAdminStats({
            totalCampanhas: normalized.length,
            totalUsuarios: usuarios?.length || 0,
            denunciasPendentes: (denuncias || []).filter(d => d.estado?.toLowerCase() === "pendente").length,
            totalArrecadado: normalized.reduce((acc, curr) => acc + curr.valor_arrecadado, 0)
          });

        } else {
          const { data, error } = await supabase
            .from("campanhas")
            .select("*, financiamento(valor, estado_pagamento)")
            .eq("usuario_id", user?.id || "")
            .order("data_criacao", { ascending: false });

          if (error) throw error;
          setCampanhas((data || []).map(c => normalizeCampaign(c)));
        }
      } catch (err) {
        console.error("Erro no Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, isAdmin]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-vax-primary animate-spin" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">A carregar dados...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-16">
      {!isAdmin && user && !user.ativo && (
        <Card className="p-4 bg-amber-50 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Conta Limitada — NIF Pendente na AGT</p>
              <p className="text-xs text-amber-600">Verifique os seus dados para desbloquear todas as funções.</p>
            </div>
          </div>
          <Button variant="outline" className="border-amber-400 text-amber-700 text-xs h-9" onClick={() => navigate('/perfil')}>
            Resolver Agora
          </Button>
        </Card>
      )}

      {isAdmin ? (
        <AdminOverview stats={adminStats} campanhas={campanhas} navigate={navigate} />
      ) : (
        <UserOverview campanhas={campanhas} user={user} navigate={navigate} />
      )}
    </div>
  );
};

const UserOverview = ({ campanhas, user, navigate }: any) => {
  const totalArrecadado = campanhas.reduce((acc: number, curr: any) => acc + curr.valor_arrecadado, 0);
  const totalMeta = campanhas.reduce((acc: number, curr: any) => acc + curr.valor_meta, 0);
  const firstName = (user?.nome_completo || "Utilizador").split(" ")[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar name={user?.nome_completo} src={user?.avatar_url} size="lg" className="hidden md:flex shadow-xl border-4 border-white" />
          <div className="space-y-2">
            <Badge variant="default" className="bg-vax-primary text-white border-none text-[9px] uppercase font-bold tracking-widest px-3 py-1">
              CONTA VERIFICADA NIF
            </Badge>
            <h1 className="text-4xl font-bold text-vax-primary tracking-tighter">Olá, {firstName}!</h1>
            <p className="text-slate-500 font-medium">
              Arrecadaste <span className="text-vax-primary font-black">{totalArrecadado.toLocaleString()} KZ</span> nas tuas causas.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/meus-projetos")} variant="outline" className="border-vax-border bg-white h-10 text-sm" leftIcon={<Briefcase className="w-4 h-4" />}>
            Projetos
          </Button>
          <Button onClick={() => navigate("/campanhas/nova")} disabled={!user?.ativo} className="h-10 text-sm" leftIcon={<Plus className="w-4 h-4" />}>
            Nova Causa
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard label="Arrecadação Real" value={`${totalArrecadado.toLocaleString()} KZ`} sub={`${totalMeta > 0 ? Math.round((totalArrecadado / totalMeta) * 100) : 0}% da meta global`} icon={<TrendingUp className="w-5 h-5 text-vax-success-DEFAULT" />} />
        <MetricCard label="Minhas Causas" value={campanhas.length.toString()} sub="Total cadastradas" icon={<Target className="w-5 h-5 text-vax-primary" />} />
        <MetricCard label="Apoios Confirmados" value={campanhas.reduce((acc: number, c: any) => acc + (c.financiamento?.filter((f: any) => f.estado_pagamento === 'concluido').length || 0), 0).toString()} sub="Transações liquidadas" icon={<Users className="w-5 h-5 text-amber-500" />} />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-vax-primary tracking-tight">Minhas Campanhas Ativas</h3>
          <Link to="/meus-projetos" className="text-xs font-bold text-vax-primary flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid gap-4">
          {campanhas.length > 0 ? (
            campanhas.map((c: any) => <ProjectItem key={c.id} project={c} navigate={navigate} />)
          ) : (
            <EmptyProjectState navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
};

const AdminOverview = ({ stats, campanhas, navigate }: any) => (
  <div className="space-y-8">
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-vax-border pb-6">
      <div>
        <Badge className="bg-vax-error-light text-vax-error-DEFAULT text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1.5 flex items-center gap-2 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" /> PAINEL DE AUDITORIA
        </Badge>
        <h1 className="text-4xl font-bold text-vax-primary tracking-tighter">Gestão Central</h1>
      </div>
      <Button onClick={() => navigate("/admin/relatorios")} variant="outline" className="border-vax-border bg-white h-10 text-xs font-black uppercase" leftIcon={<BarChart3 className="w-4 h-4 text-vax-error-DEFAULT" />}>
        Gerar Relatório
      </Button>
    </header>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard label="Volume Total" value={`${(stats?.totalArrecadado || 0).toLocaleString()} KZ`} sub="Auditado em tempo real" icon={<TrendingUp className="w-5 h-5 text-vax-success-DEFAULT" />} />
      <MetricCard label="Utilizadores" value={stats?.totalUsuarios?.toString() || "0"} sub="Perfis na rede" icon={<Users className="w-5 h-5 text-vax-primary" />} />
      <MetricCard label="Campanhas" value={stats?.totalCampanhas?.toString() || "0"} sub="Ativas e Pendentes" icon={<Globe className="w-5 h-5 text-amber-500" />} />
      <MetricCard label="Denúncias" value={stats?.denunciasPendentes?.toString() || "0"} sub="Ações críticas" icon={<ShieldAlert className="w-5 h-5 text-vax-error-DEFAULT" />} warning={stats?.denunciasPendentes > 0} />
    </div>

    <div className="space-y-5">
      <h3 className="text-xl font-bold text-vax-primary">Últimas Campanhas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campanhas.slice(0, 6).map((c: any) => (
          <Card key={c.id} className="p-5 flex items-center justify-between group hover:border-vax-primary/30 transition-all cursor-pointer" onClick={() => navigate(`/campanhas/${c.id}`)}>
            <div className="flex items-center gap-4">
              <Avatar name={c.titulo} src={c.imagem_url} size="sm" />
              <div>
                <p className="font-bold text-vax-primary text-sm line-clamp-1">{c.titulo}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.usuario_id?.substring(0, 8)}...</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-vax-primary tabular-nums">{c.valor_arrecadado.toLocaleString()} KZ</p>
                <Badge className="text-[9px] uppercase tracking-tighter">{c.estado}</Badge>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-vax-primary transition-colors" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const MetricCard = ({ label, value, sub, icon, warning }: any) => (
  <Card className={`p-5 bg-white shadow-sm border-vax-border/50 ${warning ? 'border-l-4 border-l-vax-error-DEFAULT' : ''}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${warning ? 'bg-vax-error-light' : 'bg-vax-input'}`}>{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
    </div>
    <h3 className="text-2xl font-bold text-vax-primary tracking-tighter">{value}</h3>
    <p className="text-[10px] font-semibold text-slate-400 uppercase mt-1">{sub}</p>
  </Card>
);

const ProjectItem = ({ project, navigate }: any) => {
  const percentage = Math.min(((project.valor_arrecadado || 0) / (project.valor_meta || 1)) * 100, 100);
  return (
    <Card className="p-5 group hover:border-vax-primary/40 transition-all cursor-pointer rounded-2xl bg-white" onClick={() => navigate(`/campanhas/${project.id}`)}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-vax-input overflow-hidden shrink-0 border border-vax-border">
          {project.imagem_url ? <img src={project.imagem_url} alt={project.titulo} className="w-full h-full object-cover" /> : <Target className="w-6 h-6 opacity-30 mx-auto mt-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-vax-primary text-base tracking-tight truncate">{project.titulo}</h4>
            <span className="text-xs font-black text-vax-primary ml-2">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full h-2 bg-vax-input rounded-full">
            <div className="h-full bg-vax-primary rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400 uppercase">
            <span>{project.valor_arrecadado.toLocaleString()} KZ</span>
            <span className="text-vax-primary flex items-center gap-1">Gerir <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const EmptyProjectState = ({ navigate }: any) => (
  <Card className="p-12 text-center border-dashed border-2 border-vax-border flex flex-col items-center">
    <div className="w-14 h-14 bg-vax-input rounded-2xl flex items-center justify-center mb-5">
      <Plus className="w-7 h-7 text-vax-primary" />
    </div>
    <h3 className="text-xl font-bold text-vax-primary">Nenhuma causa ativa</h3>
    <p className="text-slate-500 mt-2 text-sm max-w-xs">Lance a sua primeira iniciativa social no Cazenga.</p>
    <Button onClick={() => navigate('/campanhas/nova')} className="mt-6 h-10 px-8 rounded-full">
      Lançar Iniciativa
    </Button>
  </Card>
);