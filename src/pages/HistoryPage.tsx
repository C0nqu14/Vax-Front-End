import { useEffect, useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download,
  Calendar,
  History as HistoryIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const HistoryPage = () => {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Tentamos buscar o histórico real. Se o endpoint não existir, mostramos vazio.
        const response = await api.get("/usuario/financiamentos");
        setTransacoes(response.data);
      } catch (err) {
        console.error("Erro ao carregar histórico");
        setTransacoes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = transacoes.filter(t => 
    t.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="info" className="mb-4 bg-vax-primary text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">Extrato de Atividades</Badge>
          <h1 className="text-4xl font-bold text-vax-primary tracking-tight font-display">Histórico & Impacto</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Transparência total em suas doações e movimentações.</p>
        </div>
        <Button variant="outline" className="bg-white border-none shadow-sm" leftIcon={<Download className="w-4 h-4" />}>
           Exportar PDF
        </Button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
         <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-vax-primary transition-colors" />
            <input 
              type="text"
              placeholder="Pesquisar por projeto ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-vax-border rounded-[20px] pl-11 pr-4 py-3.5 text-sm outline-none focus:border-vax-primary transition-all shadow-sm"
            />
         </div>
         <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white border-none shadow-sm rounded-full px-5" leftIcon={<Filter className="w-4 h-4" />}>Filtros</Button>
            <Button variant="outline" className="bg-white border-none shadow-sm rounded-full px-5" leftIcon={<Calendar className="w-4 h-4" />}>Período</Button>
         </div>
      </div>

      <Card className="overflow-hidden border-vax-border/50 shadow-vax">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-vax-input/40 border-b border-vax-border">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Movimentação</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalhes</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Valor</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vax-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-vax-primary animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-vax-primary uppercase tracking-widest animate-pulse">Sincronizando com o Back-end...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                           t.tipo === 'DOAÇÃO' ? 'bg-vax-success-light text-vax-success-DEFAULT' : 
                           t.tipo === 'SAQUE' ? 'bg-vax-error-light text-vax-error-DEFAULT' :
                           'bg-vax-input text-vax-primary'
                         }`}>
                           {t.tipo === 'DOAÇÃO' ? <ArrowDownRight className="w-5 h-5" /> : 
                            t.tipo === 'SAQUE' ? <ArrowUpRight className="w-5 h-5" /> :
                            <HistoryIcon className="w-5 h-5" />
                           }
                         </div>
                         <div>
                            <span className="block font-bold text-vax-primary text-sm tracking-tight">{t.tipo || 'DOAÇÃO'}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none shrink-0">Via Digital</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-vax-primary text-sm">{t.destino || t.campanha?.titulo || 'Projeto Social'}</td>
                    <td className={`px-8 py-6 font-bold text-base text-center tabular-nums ${
                      t.tipo === 'SAQUE' ? 'text-vax-error-DEFAULT' : 'text-vax-success-DEFAULT'
                    }`}>
                      {t.tipo === 'SAQUE' ? '-' : '+'}{Number(t.valor || 0).toLocaleString()} <span className="text-[10px] opacity-70">AKZ</span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {new Date(t.data || t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Badge 
                         variant={t.status === 'Sucesso' || t.status === 'completed' ? 'success' : 'warning'} 
                         className="uppercase tracking-[0.1em] text-[9px] px-3 font-bold"
                       >
                         {t.status === 'completed' ? 'Sucesso' : t.status || 'Pendente'}
                       </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="w-16 h-16 bg-vax-input/50 rounded-full flex items-center justify-center mx-auto mb-6">
                       <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-xl font-bold text-vax-primary">Nenhuma atividade registrada</h4>
                    <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">Você ainda não realizou doações ou saques na plataforma.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-4">
           <span>Mostrando {filtered.length} transações</span>
        </div>
      )}
    </div>
  );
};

