import { useState, useEffect } from "react";
import { 
  Search, Filter, Download, TrendingUp, Clock,
  CheckCircle2, Eye, ShieldCheck, XCircle, Loader2,
  AlertTriangle, Users, Globe, ShieldAlert, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { supabase } from "../services/supabase";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { normalizarCategoria } from "../constants";

export const AdminCampaignsPage = () => {
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);



  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // GET /campanhas — retorna todas as campanhas do banco SQL
      let campanhasData: any[] = [];
      try {
        const response = await api.get("/admin/campanhas");
        campanhasData = response.data || [];
      } catch (apiError) {
        console.warn("API /admin/campanhas falhou. Fallback /campanhas/Supabase.", apiError);
        const { data, error } = await supabase.from("campanhas").select("*").order("data_criacao", { ascending: false });
        if (error) throw error;
        campanhasData = data || [];
      }

      setCampanhas(campanhasData.map(c => ({
        ...c,
        categoria: normalizarCategoria(c.categoria || c.category || c.tipo || c.type),
        estado: (c.estado || c.status || c.state || "pendente").toString().toLowerCase()
      })));

    } catch (err) {
      console.error("Erro ao carregar campanhas do SQL/Supabase", err);
      setCampanhas([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      // PATCH/POST /admin/campanhas/:id/avaliar — atualiza estado no SQL
      // Tentar primeiro com 'estado', se falhar tentar com 'status'
      try {
        await api.post(`/admin/campanhas/${id}/avaliar`, { estado: newStatus });
      } catch (error: any) {
        if (error.response?.data?.message?.includes('estado') || error.response?.data?.message?.includes('status') || error.response?.status === 400) {
          try {
            await api.post(`/admin/campanhas/${id}/avaliar`, { status: newStatus });
          } catch (innerError: any) {
            console.warn('API /admin/campanhas/:id/avaliar status falhou:', innerError);
            throw innerError;
          }
        } else {
          throw error;
        }
      }

      // Se ainda falhar, tentar atualizar no Supabase como último recurso (apenas para sincronização local)
      try {
        const { error } = await supabase
          .from('campanhas')
          .update({ estado: newStatus })
          .eq('id', id);
        if (error) {
          console.warn('Supabase update campanha falhou:', error);
        }
      } catch (supError) {
        console.warn('Erro ao atualizar no Supabase:', supError);
      }

      setCampanhas(prev => prev.map(c => c.id === id ? { ...c, estado: newStatus } : c));
    } catch (err: any) {
      console.error('Erro ao atualizar campanha:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      alert(`Erro ao atualizar estado da campanha: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: "todas", label: "Todas" },
    { key: "ativa", label: "Ativas" },
    { key: "suspensa", label: "Suspensas" },
    { key: "concluida", label: "Concluídas" },
    { key: "falhada", label: "Falhadas" },
  ];

  const filteredCampaigns = campanhas.filter(c => {
    const matchTab = activeTab === "todas" || (c.estado || "").toLowerCase() === activeTab;
    const matchSearch = 
      (c.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.id || "").toString().includes(searchTerm);
    return matchTab && matchSearch;
  });

  // Métricas dinâmicas do banco
  const totalArrecadado = campanhas.reduce((acc, c) => acc + (Number(c.valor_arrecadado) || 0), 0);
  const ativas = campanhas.filter(c => c.estado === 'ativa').length;
  const suspensas = campanhas.filter(c => c.estado === 'suspensa').length;
  const concluidas = campanhas.filter(c => c.estado === 'concluida').length;
  const falhadas = campanhas.filter(c => c.estado === 'falhada').length;

  const gerarCsvCampanhas = () => {
    const headers = [
      "ID",
      "Título",
      "Categoria",
      "Estado",
      "Valor Meta",
      "Valor Arrecadado",
      "Progresso (%)",
      "Data Criação"
    ];

    const csvData = filteredCampaigns.map(c => [
      c.id,
      c.titulo || "",
      c.categoria || "Social",
      c.estado || "pendente",
      Number(c.valor_meta || 0),
      Number(c.valor_arrecadado || 0),
      Math.round(((c.valor_arrecadado || 0) / (c.valor_meta || 1)) * 100),
      c.data_criacao ? new Date(c.data_criacao).toLocaleDateString('pt-BR') : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `campanhas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColor = (estado: string) => {
    if (estado === 'ativa') return 'bg-vax-success-light text-vax-success-DEFAULT';
    if (estado === 'pendente' || estado === 'em_aprovacao') return 'bg-amber-100 text-amber-700';
    if (estado === 'suspensa') return 'bg-vax-error-light text-vax-error-DEFAULT';
    if (estado === 'concluida') return 'bg-slate-100 text-slate-500';
    return 'bg-vax-input text-slate-500';
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vax-border pb-6">
        <div>
          <Badge className="bg-vax-error-light text-vax-error-DEFAULT border-none text-[9px] font-black px-3 py-1.5 uppercase tracking-widest mb-3 flex items-center gap-2 w-fit">
            <ShieldAlert className="w-3 h-3" /> Moderação de Conteúdo
          </Badge>
          <h1 className="text-3xl font-bold text-vax-primary tracking-tighter">Gestão de Campanhas</h1>
          <p className="text-slate-500 text-sm mt-1">Aprovar, suspender e auditar todas as iniciativas da plataforma.</p>
        </div>
        <Button onClick={gerarCsvCampanhas} variant="outline" className="border-vax-border bg-white h-10 text-xs font-bold uppercase tracking-widest" leftIcon={<Download className="w-4 h-4" />}>
          Exportar CSV
        </Button>
      </header>

      {/* Métricas reais do banco */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Campanhas Ativas" value={ativas.toString()} icon={<CheckCircle2 className="w-5 h-5 text-vax-success-DEFAULT" />} />
        <MetricCard label="Campanhas Suspensas" value={suspensas.toString()} icon={<Clock className="w-5 h-5 text-amber-500" />} warning={suspensas > 0} />
        <MetricCard label="Campanhas Falhadas" value={falhadas.toString()} icon={<XCircle className="w-5 h-5 text-vax-error-DEFAULT" />} warning={falhadas > 0} />
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex bg-vax-input/60 p-1 rounded-xl border border-vax-border overflow-x-auto gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-vax-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-vax-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-vax-border rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-vax-primary transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Tabela de campanhas */}
      <Card className="overflow-hidden border-vax-border shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-vax-input/40 border-b border-vax-border">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campanha</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Progresso</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vax-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-vax-primary mx-auto" />
                    <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">A consultar base de dados...</p>
                  </td>
                </tr>
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((c) => {
                  const pct = Math.min(((c.valor_arrecadado || 0) / (c.valor_meta || 1)) * 100, 100);
                  const isLoading = actionLoading === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-vax-input flex items-center justify-center font-bold text-vax-primary text-sm shrink-0 group-hover:scale-105 transition-transform overflow-hidden border border-vax-border">
                            {c.imagem_url ? <img src={c.imagem_url} alt="" className="w-full h-full object-cover" /> : c.titulo?.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-vax-primary text-sm">{c.titulo}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.categoria || 'Social'} • {c.id?.substring(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell min-w-[160px]">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                          <span>{Math.round(pct)}%</span>
                          <span>{Number(c.valor_meta || 0).toLocaleString()} KZ</span>
                        </div>
                        <div className="w-full h-1.5 bg-vax-input rounded-full overflow-hidden">
                          <div className="h-full bg-vax-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{Number(c.valor_arrecadado || 0).toLocaleString()} KZ arrecadados</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${statusColor(c.estado)}`}>
                          {c.estado || 'pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Ver campanha */}
                          <button
                            onClick={() => navigate(`/campanhas/${c.id}`)}
                            className="p-2 bg-vax-input border border-vax-border rounded-lg text-slate-400 hover:text-vax-primary hover:bg-white transition-all"
                            title="Ver campanha"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Aprovar (pendente → ativa) */}
                          {(c.estado === 'pendente' || c.estado === 'em_aprovacao') && (
                            <button
                              onClick={() => updateCampaignStatus(c.id, 'ativa')}
                              disabled={isLoading}
                              className="p-2 bg-vax-success-light border border-vax-success-DEFAULT/20 rounded-lg text-vax-success-DEFAULT hover:bg-vax-success-DEFAULT hover:text-white transition-all disabled:opacity-50"
                              title="Aprovar campanha"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Suspender (ativa → suspensa) */}
                          {c.estado === 'ativa' && (
                            <button
                              onClick={() => updateCampaignStatus(c.id, 'suspensa')}
                              disabled={isLoading}
                              className="p-2 bg-vax-error-light border border-vax-error-DEFAULT/20 rounded-lg text-vax-error-DEFAULT hover:bg-vax-error-DEFAULT hover:text-white transition-all disabled:opacity-50"
                              title="Suspender campanha"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Reativar (suspensa → ativa) */}
                          {c.estado === 'suspensa' && (
                            <button
                              onClick={() => updateCampaignStatus(c.id, 'ativa')}
                              disabled={isLoading}
                              className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-600 hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                              title="Reativar campanha"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Banir permanentemente (apenas de suspensa ou ativa) */}
                          {(c.estado === 'suspensa' || c.estado === 'ativa' || c.estado === 'pendente') && (
                            <button
                              onClick={() => {
                                if (confirm('CONFIRMAR: Esta ação é permanente. A campanha será marcada como FALHADA e removida.')) {
                                  updateCampaignStatus(c.id, 'falhada');
                                }
                              }}
                              disabled={isLoading}
                              className="p-2 bg-red-100 border border-red-300 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                              title="Banir permanentemente"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Globe className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">Nenhuma campanha encontrada</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-vax-input/20 border-t border-vax-border flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredCampaigns.length} campanha(s) · dados em tempo real
          </span>
          <button onClick={fetchCampaigns} className="text-[10px] font-black text-vax-primary uppercase tracking-widest hover:underline">
            ↻ Atualizar
          </button>
        </div>
      </Card>

      <Card className="p-5 bg-vax-primary/5 border-dashed border-2 border-vax-primary/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-vax-primary" />
          <div>
            <h4 className="font-bold text-vax-primary text-sm">Moderação Auditada</h4>
            <p className="text-xs text-slate-500">Todas as ações são registadas no log de conformidade fiscal.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const MetricCard = ({ label, value, icon, warning }: any) => (
  <Card className={`p-5 bg-white border-vax-border/50 ${warning ? 'border-l-4 border-l-amber-400' : ''}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${warning ? 'bg-amber-50' : 'bg-vax-input'}`}>{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <h3 className="text-2xl font-bold text-vax-primary tracking-tighter tabular-nums">{value}</h3>
  </Card>
);
