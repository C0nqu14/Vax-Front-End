import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  TrendingUp, 
  CreditCard,
  History as HistoryIcon,
  CheckCircle2,
  Calendar,
  Filter,
  ShieldCheck,
  Loader2
} from "lucide-react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const AdminDonationsPage = () => {
  const [doacoes, setDoacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        // GET /admin/doacoes -> Sincronizado com a tabela financiamento SQL
        // Espera-se: id, valor, estado_pagamento, data_criacao, usuarios (nome), campanhas (titulo)
        const response = await api.get("/admin/doacoes");
        setDoacoes(response.data || []);
      } catch (err) {
        console.error("Erro ao carregar fluxo financeiro");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const totalVolume = (doacoes || []).reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const avgDonation = doacoes.length > 0 ? totalVolume / doacoes.length : 0;

  const filteredDoacoes = doacoes.filter(d => 
    (d.usuarios?.nome_completo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (d.campanhas?.titulo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (d.id_transacao || "").includes(searchTerm)
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24 mt-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-vax-border pb-10">
        <div className="space-y-4">
          <Badge className="bg-vax-success-light text-vax-success-DEFAULT border-none px-5 py-2 font-black tracking-widest text-[10px] uppercase shadow-sm">Fluxo de Auditoria Financeira</Badge>
          <h1 className="text-6xl font-bold text-vax-primary tracking-tighter leading-none">Movimentação Real</h1>
          <p className="text-slate-500 font-medium text-xl leading-relaxed max-w-xl">Monitoramento técnico de doações e conciliação bancária.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="bg-white border-vax-border shadow-xl h-14 px-8 rounded-full font-black text-xs uppercase tracking-widest" leftIcon={<Download className="w-5 h-5" />}>
              Exportar Livro Razão
           </Button>
        </div>
      </header>

      {/* Métricas Financeiras Dinâmicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <StatCard label="Volume Bruto Auditado" value={`${totalVolume.toLocaleString()} KZ`} icon={<TrendingUp className="w-6 h-6 text-vax-success-DEFAULT" />} />
         <StatCard label="Ticket Médio Mobilizado" value={`${Math.round(avgDonation).toLocaleString()} AKZ`} icon={<HistoryIcon className="w-6 h-6 text-vax-primary" />} />
         <StatCard label="Transações Confirmadas" value={doacoes.filter(d => d.estado_pagamento === 'concluido').length.toString()} icon={<CheckCircle2 className="w-6 h-6 text-vax-success-DEFAULT" />} />
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           <div className="flex-1 max-w-2xl relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-vax-primary transition-colors" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por Doador, Causa ou ID de Transação..."
                className="w-full bg-white border-2 border-vax-border rounded-full pl-16 pr-8 py-5 text-base outline-none focus:border-vax-primary transition-all shadow-xl font-bold placeholder:text-slate-300"
              />
           </div>
        </div>

        <Card className="overflow-hidden border-vax-border shadow-3xl rounded-[60px] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-vax-input/30 border-b border-vax-border">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Apoiador & Rastreio</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Causa de Destino</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Valor da Transação</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vax-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                       <Loader2 className="w-12 h-12 animate-spin text-vax-primary mx-auto" />
                       <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultando Fluxo Financeiro...</p>
                    </td>
                  </tr>
                ) : filteredDoacoes.length > 0 ? (
                  filteredDoacoes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-vax-input flex items-center justify-center font-black text-vax-primary border-2 border-white shadow-xl group-hover:scale-105 transition-transform shrink-0 uppercase">
                              {d.usuarios?.nome_completo?.charAt(0) || "D"}
                           </div>
                           <div>
                              <span className="block font-bold text-vax-primary text-lg tracking-tighter leading-none">{d.usuarios?.nome_completo || "Mobilizador Vax"}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                 ID: {d.id_transacao || d.id?.split('-')[0]}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <span className="text-sm font-bold text-slate-500 tracking-tight">{d.campanhas?.titulo || "Causa Social"}</span>
                      </td>
                      <td className="px-10 py-8 font-black text-vax-primary text-xl text-center tabular-nums leading-none">
                         {Number(d.valor).toLocaleString()} <span className="text-xs font-medium text-slate-300">AKZ</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <Badge 
                           className={`px-5 py-2 rounded-full border-none text-[9px] font-black uppercase tracking-widest shadow-sm ${
                             d.estado_pagamento === 'concluido' 
                               ? 'bg-vax-success-light text-vax-success-DEFAULT' 
                               : d.estado_pagamento === 'pendente'
                               ? 'bg-amber-100 text-amber-600'
                               : 'bg-vax-error-light text-vax-error-DEFAULT'
                           }`}
                         >
                           {d.estado_pagamento || "Pendente"}
                         </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                       <p className="text-lg font-black text-vax-primary opacity-60 uppercase tracking-widest">Sem movimentação financeira localizada</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-10 py-8 bg-vax-input/30 flex justify-between items-center border-t border-vax-border">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Sincronização em tempo real com PaysGator Gateway</span>
          </div>
        </Card>
      </div>

      <Card className="p-10 bg-vax-success-light/20 border-vax-success-DEFAULT/20 border-dashed border-4 rounded-[40px] flex flex-col md:flex-row items-center gap-8 group">
         <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-3xl border-2 border-vax-success-DEFAULT/10 group-hover:rotate-6 transition-transform">
            <ShieldCheck className="w-10 h-10 text-vax-success-DEFAULT" />
         </div>
         <div className="flex-1">
            <h4 className="font-bold text-vax-success-DEFAULT text-xl tracking-tight">Conciliação Automática Ativa</h4>
            <p className="text-lg text-vax-success-DEFAULT/70 font-medium leading-relaxed max-w-3xl">A integridade das doações é verificada a cada 10 minutos. Valores anômalos acima de 500.000 KZ são sinalizados para conformidade técnica imediata.</p>
         </div>
         <Button className="bg-vax-success-DEFAULT text-white px-10 h-16 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-vax-success-DEFAULT/20 shrink-0">
            Ver Logs de Auditoria
         </Button>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, icon }: any) => (
  <Card className="p-12 relative overflow-hidden group bg-white border-vax-border shadow-vax hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000 font-black">
       {icon}
    </div>
    <div className="flex flex-col gap-6">
      <div className="w-16 h-16 bg-vax-input rounded-[22px] flex items-center justify-center shadow-inner group-hover:bg-vax-primary group-hover:text-white transition-all duration-300">{icon}</div>
      <div>
         <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
         <h3 className="text-5xl font-bold text-vax-primary tracking-tighter tabular-nums leading-none">{value}</h3>
      </div>
    </div>
  </Card>
);
