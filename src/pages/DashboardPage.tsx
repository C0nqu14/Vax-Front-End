import { useEffect, useState } from "react";
import { 
  TrendingUp, Users, Briefcase, ChevronRight, Globe,
  ArrowUpRight, Plus, Loader2, Target, ShieldAlert,
  BarChart3, ArrowRight, AlertTriangle, User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { useAuth } from "../contexts/AuthContext";

export const DashboardPage = () => {
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isAdmin) {
          // ADMIN: dados globais reais das tabelas SQL
          const [campanhasRes, denunciasRes, usuariosRes] = await Promise.all([
            api.get("/campanhas"),
            api.get("/admin/denuncias"),
            api.get("/admin/usuarios")
          ]);
          setCampanhas(campanhasRes.data || []);
          setAdminStats({
            totalCampanhas: (campanhasRes.data || []).length,
            totalUsuarios: (usuariosRes.data || []).length,
            denunciasPendentes: (denunciasRes.data || []).filter((d: any) => d.estado === 'pendente').length,
            totalArrecadado: (campanhasRes.data || []).reduce((acc: number, curr: any) => acc + (Number(curr.valor_arrecadado) || 0), 0)
          });
        } else {
          // UTILIZADOR: campanhas que criou
          const response = await api.get("/campanhas");
          const myItems = (response.data || []).filter((c: any) => c.usuario_id === user?.id);
          setCampanhas(myItems);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do SQL");
      } finally {
        setLoading(false);
      }
    };

    if (user !== null) {
      fetchData();
    }
  }, [user, isAdmin]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-vax-primary animate-spin" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">A carregar dados...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Alerta conta inativa */}
      {!isAdmin && user && !user.ativo && (
        <Card className="p-4 bg-amber-50 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-700 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Conta Limitada — NIF Pendente na AGT</p>
              <p className="text-xs text-amber-600 mt-0.5">Pode navegar mas não pode criar campanhas ou financiar.</p>
            </div>
          </div>
          <Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100 text-xs h-9 shrink-0" onClick={() => navigate('/perfil')}>
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

// --- VISÃO DO UTILIZADOR ---
const UserOverview = ({ campanhas, user, navigate }: any) => {
  const totalArrecadado = campanhas.reduce((acc: number, curr: any) => acc + (Number(curr.valor_arrecadado) || 0), 0);
  const totalMeta = campanhas.reduce((acc: number, curr: any) => acc + (Number(curr.valor_meta) || 0), 0);
  const firstName = (user?.nome_completo || "Mobilizador").split(" ")[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar name={user?.nome_completo} src={user?.avatar_url} size="lg" className="hidden md:flex shadow-xl border-4 border-white" />
          <div className="space-y-2">
            <Badge variant="info" className="bg-vax-primary text-white border-none text-[9px] uppercase font-bold tracking-widest px-3 py-1">
              CONTA VERIFICADA NIF
            </Badge>
            <h1 className="text-4xl font-bold text-vax-primary tracking-tighter leading-none">Olá, {firstName}! 🇦🇴</h1>
            <p className="text-slate-500 font-medium">
              Mobilizaste <span className="text-vax-primary font-black">{totalArrecadado.toLocaleString()} AKZ</span> na rede.
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
        <MetricCard label="Arrecadação Total" value={`${totalArrecadado.toLocaleString()} AKZ`} sub={`${campanhas.length > 0 ? Math.round((totalArrecadado / (totalMeta || 1)) * 100) : 0}% da meta`} icon={<TrendingUp className="w-5 h-5 text-vax-success-DEFAULT" />} />
        <MetricCard label="Campanhas Ativas" value={campanhas.filter((c: any) => c.estado === 'ativa').length.toString()} sub="Em curso" icon={<Target className="w-5 h-5 text-vax-primary" />} />
        <MetricCard label="Apoios Recebidos" value={campanhas.reduce((acc: number, c: any) => acc + (c.financiamento?.length || 0), 0).toString()} sub="Vizinhos engajados" icon={<Users className="w-5 h-5 text-amber-500" />} />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-vax-primary tracking-tight">Meus Projetos</h3>
          <Link to="/meus-projetos" className="text-xs font-bold text-vax-primary hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid gap-4">
          {campanhas.length > 0 ? (
            campanhas.slice(0, 3).map((c: any) => <ProjectItem key={c.id} project={c} navigate={navigate} />)
          ) : (
            <EmptyProjectState navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- VISÃO DO ADMINISTRADOR ---
const AdminOverview = ({ stats, campanhas, navigate }: any) => (
  <div className="space-y-8">
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-vax-border pb-6">
      <div>
        <Badge className="bg-vax-error-light text-vax-error-DEFAULT border-none text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1.5 flex items-center gap-2 w-fit mb-3">
          <ShieldAlert className="w-3.5 h-3.5" /> PAINEL DE AUDITORIA
        </Badge>
        <h1 className="text-4xl font-bold text-vax-primary tracking-tighter leading-none">Gestão Central</h1>
        <p className="text-slate-500 font-medium mt-2">Integridade e segurança da rede Vax.</p>
      </div>
      <Button onClick={() => navigate("/admin/relatorios")} variant="outline" className="border-vax-border bg-white h-10 text-xs font-black uppercase tracking-widest" leftIcon={<BarChart3 className="w-4 h-4 text-vax-error-DEFAULT" />}>
        Auditar Relatórios
      </Button>
    </header>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard label="Volume Auditado" value={`${(stats?.totalArrecadado || 0).toLocaleString()} AKZ`} sub="Total arrecadado" icon={<TrendingUp className="w-5 h-5 text-vax-success-DEFAULT" />} />
      <MetricCard label="Utilizadores SQL" value={stats?.totalUsuarios?.toString() || "0"} sub="Perfis NIF" icon={<Users className="w-5 h-5 text-vax-primary" />} />
      <MetricCard label="Campanhas" value={stats?.totalCampanhas?.toString() || "0"} sub="Na plataforma" icon={<Globe className="w-5 h-5 text-amber-500" />} />
      <MetricCard label="Denúncias" value={stats?.denunciasPendentes?.toString() || "0"} sub="Ação imediata" icon={<ShieldAlert className="w-5 h-5 text-vax-error-DEFAULT" />} warning={stats?.denunciasPendentes > 0} />
    </div>

    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-vax-primary tracking-tight">Auditoria de Campanhas</h3>
        <Button onClick={() => navigate("/admin/campanhas")} variant="outline" className="text-xs font-bold uppercase tracking-widest px-5 rounded-full border-vax-border h-9">
          Ver todas
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(campanhas || []).slice(0, 6).map((c: any) => (
          <Card key={c.id} className="p-5 flex items-center justify-between group hover:border-vax-primary/30 transition-all cursor-pointer rounded-2xl" onClick={() => navigate(`/campanhas/${c.id}`)}>
            <div className="flex items-center gap-4">
              <Avatar name={c.titulo} src={c.imagem_url} size="sm" className="rounded-xl border border-vax-border" />
              <div>
                <p className="font-bold text-vax-primary text-sm tracking-tight">{c.titulo}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <User className="w-3 h-3" /> {c.usuario_id?.substring(0, 8)}…
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-vax-primary tabular-nums">{Number(c.valor_arrecadado || 0).toLocaleString()} <span className="text-[10px] opacity-50">AKZ</span></p>
                <Badge className="mt-0.5 text-[9px] bg-vax-input py-0 px-2 uppercase tracking-widest border-none">{c.estado}</Badge>
              </div>
              <div className="w-8 h-8 rounded-full bg-vax-input flex items-center justify-center group-hover:bg-vax-primary group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>

    {stats?.denunciasPendentes > 0 && (
      <Card className="p-8 bg-vax-error-DEFAULT text-white border-none rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-xl font-bold tracking-tight">Denúncias Pendentes</h4>
            <p className="text-white/80 text-sm mt-1">{stats.denunciasPendentes} denúncias aguardam auditoria imediata.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/admin/relatorios")} className="bg-white text-vax-error-DEFAULT hover:bg-white/95 font-black h-11 px-8 rounded-full text-xs uppercase tracking-widest shrink-0">
          Resolver Agora
        </Button>
      </Card>
    )}
  </div>
);

// --- COMPONENTES ---
const MetricCard = ({ label, value, sub, icon, warning }: any) => (
  <Card className={`p-5 bg-white border-vax-border/50 shadow-sm hover:shadow-md transition-all ${warning ? 'border-l-4 border-l-vax-error-DEFAULT' : ''}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${warning ? 'bg-vax-error-light' : 'bg-vax-input'}`}>{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
    </div>
    <h3 className="text-2xl font-bold text-vax-primary tracking-tighter tabular-nums">{value}</h3>
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{sub}</p>
  </Card>
);

const ProjectItem = ({ project, navigate }: any) => {
  const percentage = Math.min(((project.valor_arrecadado || 0) / (project.valor_meta || 1)) * 100, 100);
  return (
    <Card className="p-5 group hover:border-vax-primary/40 transition-all cursor-pointer rounded-2xl bg-white" onClick={() => navigate(`/campanhas/${project.id}`)}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-vax-input flex items-center justify-center overflow-hidden shrink-0 border border-vax-border">
          {project.imagem_url ? <img src={project.imagem_url} alt={project.titulo} className="w-full h-full object-cover" /> : <Target className="w-6 h-6 opacity-30" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-vax-primary text-base tracking-tight truncate">{project.titulo}</h4>
            <span className="text-xs font-black text-vax-primary ml-2 shrink-0">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full h-2 bg-vax-input rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-vax-primary rounded-full" />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{Number(project.valor_arrecadado || 0).toLocaleString()} AKZ</span>
            <span className="text-vax-primary flex items-center gap-1">Gerir <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const EmptyProjectState = ({ navigate }: any) => (
  <Card className="p-12 text-center border-dashed border-2 border-vax-border flex flex-col items-center rounded-3xl">
    <div className="w-14 h-14 bg-vax-input rounded-2xl flex items-center justify-center mb-5 border border-vax-border">
      <Plus className="w-7 h-7 text-vax-primary" />
    </div>
    <h3 className="text-xl font-bold text-vax-primary tracking-tight">O Cazenga espera por você</h3>
    <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">NIF verificado. Já pode lançar a sua primeira causa social.</p>
    <Button onClick={() => navigate('/campanhas/nova')} className="mt-6 h-10 px-8 text-sm font-bold rounded-full shadow-lg shadow-vax-primary/15">
      Lançar Iniciativa
    </Button>
  </Card>
);
