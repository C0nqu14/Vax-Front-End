import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  PieChart, 
  Download, 
  Calendar,
  FileText,
  Loader2,
  Flag,
  Users,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Monitor
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const AdminReportsPage = () => {
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_arrecadado: 0,
    total_denuncias: 0,
    usuarios_ativos: 0,
    campanhas_ativas: 0
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [denunciasRes, campanhasRes, usuariosRes] = await Promise.all([
          api.get("/admin/denuncias"),
          api.get("/campanhas"),
          api.get("/admin/usuarios")
        ]);

        setDenuncias(denunciasRes.data || []);
        setCampanhas(campanhasRes.data || []);
        
        setStats({
           total_arrecadado: (campanhasRes.data || []).reduce((acc: number, curr: any) => acc + (Number(curr.valor_arrecadado) || 0), 0),
           total_denuncias: (denunciasRes.data || []).length,
           usuarios_ativos: (usuariosRes.data || []).filter((u: any) => u.ativo).length,
           campanhas_ativas: (campanhasRes.data || []).filter((c: any) => c.estado === 'ativa').length
        });
      } catch (err) {
        console.error("Erro ao carregar auditoria:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const updateDenunciaStatus = async (id: string, newStatus: string) => {
    try {
      // PATCH é o método REST correto para atualização de estado
      // Se o teu back-end usa PUT ou POST, adjusta aqui
      await api.patch(`/admin/denuncias/${id}`, { estado: newStatus });
      setDenuncias(prev => prev.map(d => d.id === id ? { ...d, estado: newStatus } : d));
    } catch {
      try {
        // Fallback para POST se PATCH não estiver configurado no back-end
        await api.post(`/admin/denuncias/${id}`, { estado: newStatus });
        setDenuncias(prev => prev.map(d => d.id === id ? { ...d, estado: newStatus } : d));
      } catch (err2) {
        alert("Ação registada localmente. Confirme se o endpoint do back-end está ativo.");
        // Atualiza UI mesmo se o back-end falhar (optimistic update)
        setDenuncias(prev => prev.map(d => d.id === id ? { ...d, estado: newStatus } : d));
      }
    }
  };

  // Cálculo real por categoria vindo do back-end
  const categoryCounts = (campanhas || []).reduce((acc: any, curr: any) => {
    const cat = curr.categoria || "Social";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const totalItems = (campanhas || []).length || 1;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24 mt-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-vax-border pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-vax-error-DEFAULT rounded-xl flex items-center justify-center text-white shadow-xl">
                <Monitor className="w-6 h-6" />
             </div>
             <Badge className="bg-vax-error-light text-vax-error-DEFAULT border-none px-4 py-1.5 font-black tracking-widest text-[9px] uppercase">Auditoria Centralizada</Badge>
          </div>
          <h1 className="text-6xl font-bold text-vax-primary tracking-tighter leading-none">Segurança Vax</h1>
          <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-xl">Monitoramento técnico de conformidade AF-NIF e integridade financeira.</p>
        </div>
        <div className="flex gap-4">
           <Button className="bg-vax-primary font-black h-11 px-8 rounded-full text-xs uppercase tracking-widest shadow-xl shadow-vax-primary/10" leftIcon={<Download className="w-4 h-4" />}>
              Exportar Log
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <MetricPanel label="Volume Auditado" value={`${stats.total_arrecadado.toLocaleString()} AKZ`} icon={<TrendingUp className="w-6 h-6 text-vax-success-DEFAULT" />} />
         <MetricPanel label="Denúncias Pendentes" value={denuncias.filter(d => d.estado === 'pendente').length.toString()} icon={<AlertTriangle className="w-6 h-6 text-vax-error-DEFAULT" />} warning={denuncias.filter(d => d.estado === 'pendente').length > 0} />
         <MetricPanel label="Utilizadores Validadores" value={stats.usuarios_ativos.toString()} icon={<Users className="w-6 h-6 text-vax-primary" />} />
         <MetricPanel label="Causas em Operação" value={stats.campanhas_ativas.toString()} icon={<Target className="w-6 h-6 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-10">
            <h3 className="text-3xl font-bold text-vax-primary tracking-tighter flex items-center gap-4">
               <ShieldCheck className="w-8 h-8 text-vax-error-DEFAULT" /> Fila de Resolução Técnica
            </h3>
            
            {loading ? (
              <div className="p-32 flex flex-col items-center justify-center gap-6 bg-vax-input/10 rounded-[60px] border-4 border-dashed border-vax-border">
                 <Loader2 className="w-12 h-12 animate-spin text-vax-primary" />
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronização...</p>
              </div>
            ) : denuncias.length > 0 ? (
              <div className="grid gap-6">
                 {denuncias.map((d) => (
                   <AdminDenunciaRow 
                     key={d.id} 
                     denuncia={d} 
                     onResolve={(status: string) => updateDenunciaStatus(d.id, status)} 
                   />
                 ))}
              </div>
            ) : (
              <Card className="p-32 text-center border-dashed border-4 border-vax-border bg-white rounded-[60px]">
                 <CheckCircle2 className="w-16 h-16 text-vax-success-DEFAULT mx-auto mb-6 opacity-30" />
                 <p className="text-2xl font-bold text-vax-primary opacity-40 uppercase tracking-widest">Sem Ocorrências</p>
                 <p className="text-lg text-slate-400 mt-2 font-medium">A integridade do Cazenga está preservada.</p>
              </Card>
            )}
         </div>

         <div className="space-y-12">
            <Card className="p-10 space-y-10 shadow-3xl border-vax-border rounded-[50px] bg-white">
               <h4 className="text-2xl font-bold text-vax-primary tracking-tighter flex items-center justify-between">
                  Distribuição Real
                  <PieChart className="w-6 h-6 text-slate-200" />
               </h4>
               <div className="space-y-8">
                  {Object.entries(categoryCounts).map(([cat, count]: [string, any]) => (
                     <RealProgressRow key={cat} label={cat} value={Math.round((count / totalItems) * 100)} color="bg-vax-primary" />
                  ))}
               </div>
            </Card>

            <Card className="p-10 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden rounded-[32px] group">
               <FileText className="w-10 h-10 opacity-30 mb-6" />
               <h4 className="text-xl font-bold tracking-tighter">Auditoria de Logs</h4>
               <p className="text-sm text-white/60 mt-3 leading-relaxed">Relatório completo de todas as alterações de estados executadas.</p>
               <Button className="w-full bg-vax-primary text-white h-11 mt-8 rounded-full text-xs font-black uppercase tracking-widest">Gerar Auditoria</Button>
            </Card>
         </div>
      </div>
    </div>
  );
};

const MetricPanel = ({ label, value, icon, warning }: any) => (
  <Card className={`p-10 group bg-white border-vax-border shadow-vax transition-all ${warning ? 'border-l-8 border-l-vax-error-DEFAULT' : ''}`}>
    <div className="flex flex-col gap-6">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${warning ? 'bg-vax-error-light text-vax-error-DEFAULT' : 'bg-vax-input text-vax-primary'}`}>{icon}</div>
       <div>
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
          <span className="text-4xl font-bold text-vax-primary tracking-tighter tabular-nums leading-none">{value}</span>
       </div>
    </div>
  </Card>
);

const RealProgressRow = ({ label, value, color }: any) => (
  <div className="space-y-4">
     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-vax-primary">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
     </div>
     <div className="h-2 bg-vax-input rounded-full overflow-hidden shadow-inner border border-vax-border/50">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full ${color}`} />
     </div>
  </div>
);

const AdminDenunciaRow = ({ denuncia, onResolve }: any) => {
  const isPendente = denuncia.estado === 'pendente';
  const isResolvido = denuncia.estado === 'analisado' || denuncia.estado === 'resolvido';
  
  return (
    <Card className={`p-8 rounded-[24px] border-2 bg-white shadow-vax flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
      isPendente ? 'border-vax-error-DEFAULT/30 hover:border-vax-error-DEFAULT/60' : 'border-vax-border opacity-70'
    }`}>
      <div className="flex items-start gap-6">
        <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-lg ${
          isPendente ? 'bg-vax-error-DEFAULT text-white' : 'bg-vax-success-DEFAULT text-white'
        }`}>
          {isPendente ? <Flag className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
        </div>
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`border-none text-[8px] font-black px-3 py-1 uppercase rounded-full ${
              isPendente ? 'bg-vax-error-light text-vax-error-DEFAULT' : 'bg-vax-success-light text-vax-success-DEFAULT'
            }`}>
              {denuncia.estado || 'pendente'}
            </Badge>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> {new Date(denuncia.data_criacao).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <p className="font-bold text-vax-primary text-lg tracking-tight leading-tight">{denuncia.motivo}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">REF: {denuncia.id?.substring(0, 8)}...</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {isPendente && (
          <>
            <Button 
              onClick={() => onResolve('analisado')} 
              className="h-11 px-6 rounded-full font-black text-[10px] uppercase tracking-widest bg-vax-primary text-white shadow-lg"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Resolver
            </Button>
            <Button 
              onClick={() => onResolve('rejeitado')} 
              variant="outline"
              className="h-11 px-6 rounded-full font-black text-[10px] uppercase tracking-widest border-vax-error-DEFAULT text-vax-error-DEFAULT hover:bg-vax-error-light"
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Rejeitar
            </Button>
          </>
        )}
        {isResolvido && (
          <span className="text-[9px] font-black text-vax-success-DEFAULT uppercase tracking-widest bg-vax-success-light px-4 py-2 rounded-full">
            ✓ {denuncia.estado}
          </span>
        )}
      </div>
    </Card>
  );
};
