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
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { supabase } from "../services/supabase";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const HistoryPage = () => {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem("vax_user");
        const user = userStr ? JSON.parse(userStr) : null;
        
        if (!user?.id) {
          setTransacoes([]);
          setLoading(false);
          return;
        }

        // 1. Buscar Doações enviadas pelo usuário
        const { data: doacoes } = await supabase
          .from('financiamento')
          .select(`id, valor, estado_pagamento, data_criacao, campanhas(id, titulo)`)
          .eq('usuario_id', user.id)
          .order('data_criacao', { ascending: false });

        // 2. Buscar Recebimentos (financiamentos nas campanhas que o usuário criou)
        const { data: recebimentos } = await supabase
          .from('financiamento')
          .select(`id, valor, estado_pagamento, data_criacao, campanhas!inner(id, titulo, usuario_id)`)
          .eq('campanhas.usuario_id', user.id)
          .eq('estado_pagamento', 'concluido')
          .order('data_criacao', { ascending: false });

        // Formatação unificada
        const transacoesDoacoes = (doacoes || []).map((d: any) => ({
          id: `doacao-${d.id}`,
          tipo: 'DOAÇÃO',
          projeto: d.campanhas?.titulo || 'Projeto Social',
          valor: Number(d.valor),
          data: d.data_criacao,
          status: d.estado_pagamento || 'pendente'
        }));

        const transacoesRecebimentos = (recebimentos || []).map((r: any) => ({
          id: `recebido-${r.id}`,
          tipo: 'RECEBIMENTO',
          projeto: r.campanhas?.titulo || 'Campanha Própria',
          valor: Number(r.valor),
          data: r.data_criacao,
          status: r.estado_pagamento
        }));

        const todas = [...transacoesDoacoes, ...transacoesRecebimentos]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        setTransacoes(todas);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Lógica de Filtro
  const filtered = transacoes.filter(t => {
    const matchesSearch = !searchTerm || t.projeto?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filtroTipo === "todos" || t.tipo === filtroTipo;
    return matchesSearch && matchesFilter;
  });

  // Cálculos de Resumo
  const totalDoacoes = transacoes.filter(t => t.tipo === 'DOAÇÃO').reduce((sum, t) => sum + t.valor, 0);
  const totalRecebimentos = transacoes.filter(t => t.tipo === 'RECEBIMENTO').reduce((sum, t) => sum + t.valor, 0);

  // Função de Exportação CSV
  const exportToCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Tipo", "Projeto", "Valor (AKZ)", "Data", "Status"];
    const rows = filtered.map(t => [
      t.tipo,
      t.projeto,
      t.valor,
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.status === 'concluido' ? 'Confirmado' : 'Pendente'
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extrato_vax_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="info" className="mb-4 bg-vax-primary text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">Extrato de Atividades</Badge>
          <h1 className="text-4xl font-bold text-vax-primary tracking-tight font-display">Histórico & Impacto</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Transparência total em suas doações e movimentações.</p>
        </div>
        <Button 
          variant="outline" 
          className="bg-white border-none shadow-sm hover:bg-slate-50" 
          leftIcon={<Download className="w-4 h-4" />}
          onClick={exportToCSV}
          disabled={filtered.length === 0}
        >
           Exportar CSV
        </Button>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-vax-border/50 shadow-vax flex items-center justify-between bg-white">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Doado</p>
            <p className="text-2xl font-bold text-vax-primary">{totalDoacoes.toLocaleString()} <span className="text-xs opacity-60 font-medium">AKZ</span></p>
          </div>
          <div className="w-10 h-10 bg-vax-success-light text-vax-success-DEFAULT rounded-xl flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-6 border-vax-border/50 shadow-vax flex items-center justify-between bg-white">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Recebido</p>
            <p className="text-2xl font-bold text-vax-primary">{totalRecebimentos.toLocaleString()} <span className="text-xs opacity-60 font-medium">AKZ</span></p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-6 border-vax-border/50 shadow-vax flex items-center justify-between bg-white">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Movimentação Total</p>
            <p className="text-2xl font-bold text-vax-primary">{(totalDoacoes + totalRecebimentos).toLocaleString()} <span className="text-xs opacity-60 font-medium">AKZ</span></p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* FILTROS & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-4">
         <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-vax-primary transition-colors" />
            <input 
              type="text"
              placeholder="Pesquisar por projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-vax-border rounded-[20px] pl-11 pr-4 py-3.5 text-sm outline-none focus:border-vax-primary transition-all shadow-sm"
            />
         </div>
         <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="bg-white border border-vax-border rounded-full px-6 py-2.5 text-[10px] font-bold text-slate-500 outline-none focus:border-vax-primary shadow-sm appearance-none cursor-pointer uppercase tracking-widest"
              >
                <option value="todos">TODAS ATIVIDADES</option>
                <option value="DOAÇÃO">APENAS DOAÇÕES</option>
                <option value="RECEBIMENTO">APENAS RECEBIMENTOS</option>
              </select>
            </div>
            <Button variant="outline" className="bg-white border-none shadow-sm rounded-full px-5 text-[10px] font-bold uppercase tracking-widest" leftIcon={<Filter className="w-4 h-4" />}>
              Filtros
            </Button>
         </div>
      </div>

      {/* TABELA PRINCIPAL */}
      <Card className="overflow-hidden border-vax-border/50 shadow-vax bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-vax-input/40 border-b border-vax-border">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Movimentação</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto / Detalhes</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Valor</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Data</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vax-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-vax-primary animate-spin mx-auto mb-4" />
                    <p className="text-xs font-bold text-vax-primary uppercase tracking-widest animate-pulse">Sincronizando dados...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                           t.tipo === 'DOAÇÃO' ? 'bg-vax-success-light text-vax-success-DEFAULT' : 'bg-blue-50 text-blue-600'
                         }`}>
                           {t.tipo === 'DOAÇÃO' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                         </div>
                         <div>
                            <span className="block font-bold text-vax-primary text-sm tracking-tight">{t.tipo}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Transferência</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-vax-primary text-sm line-clamp-1">{t.projeto}</span>
                    </td>
                    <td className={`px-8 py-6 font-bold text-base text-center tabular-nums ${
                      t.tipo === 'DOAÇÃO' ? 'text-vax-error-DEFAULT' : 'text-vax-success-DEFAULT'
                    }`}>
                      {t.tipo === 'DOAÇÃO' ? '-' : '+'}{t.valor.toLocaleString()} <span className="text-[10px] opacity-70">AKZ</span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      {new Date(t.data).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Badge 
                         variant={t.status === 'concluido' ? 'success' : 'warning'} 
                         className="uppercase tracking-[0.1em] text-[9px] px-3 font-bold"
                       >
                         {t.status === 'concluido' ? 'Concluído' : 'Pendente'}
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
                    <h4 className="text-xl font-bold text-vax-primary">Nenhuma atividade encontrada</h4>
                    <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">Tente ajustar seus filtros ou termos de pesquisa.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RODAPÉ DA TABELA */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-4">
           <span>Mostrando {filtered.length} transações filtradas</span>
           <span>Vax Plataforma &copy; 2024</span>
        </div>
      )}
    </div>
  );
};