import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, Heart, MapPin, Calendar, AlertCircle, 
  CheckCircle, Users, Info, ChevronRight, ShieldCheck, 
  Zap, Flag, X, Check, Loader2, Navigation 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "../services/supabase"; 
import api from "../services/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { normalizarCategoria } from "../constants";

export const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States originais mantidos
  const [campanha, setCampanha] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donateLoading, setDonateLoading] = useState(false);
  const [valorDoacao, setValorDoacao] = useState("1000");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sobre");
  const [user, setUser] = useState<any>(null);
  
  // Denúncia states mantidos
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("vax_user");
    if (userStr) setUser(JSON.parse(userStr));

    const fetchDetail = async () => {
      try {
        setLoading(true);
        
        // QUERY DIRETA: Substitui o api.get para resolver o bug de relacionamento
        // Usa as chaves estrangeiras exatas do teu SQL
        const { data, error: sbError } = await supabase
          .from('campanhas')
          .select(`
            *,
            usuarios!campanhas_usuario_id_fkey (
              id,
              nome_completo,
              nif,
              ativo
            ),
            financiamento (
              id,
              valor,
              estado_pagamento,
              data_criacao,
              usuarios!financiamento_usuario_id_fkey (
                nome_completo
              )
            )
          `)
          .eq('id', id)
          .single();

        if (sbError) throw sbError;
        setCampanha(data);

      } catch (err: any) {
        setError(err.message || "Falha ao carregar detalhes da campanha.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const handleDonation = async () => {
    if (!user || (user && !user.ativo)) {
      alert("Acesso restrito: Validação de NIF necessária.");
      return;
    }

    if (!valorDoacao || parseFloat(valorDoacao) <= 0) return;
    
    setDonateLoading(true);
    try {
      const response = await api.post("/financiamento", {
        campanha_id: id,
        valor: parseFloat(valorDoacao)
      });
      
      const checkoutUrl = response.data.checkoutUrl || response.data.payment_url || response.data.link;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert("Ponto de pagamento não retornado. Contacte o suporte.");
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao processar doação.");
    } finally {
      setDonateLoading(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Autenticação necessária.");
      return;
    }

    if (!reportReason.trim()) return;

    setReportLoading(true);
    try {
      await api.post("/denuncias", {
        denunciante_id: user.id,
        usuario_denunciado_id: campanha?.usuario_id,
        campanha_id: id,
        motivo: reportReason
      });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReporting(false);
        setReportSuccess(false);
        setReportReason("");
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || "Falha na auditoria ao enviar denúncia.");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-vax-primary animate-spin" />
      <span className="text-[10px] font-bold text-vax-primary uppercase tracking-[0.3em]">Conectando à Rede...</span>
    </div>
  );

  if (error || !campanha) return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <Card className="max-w-md w-full p-10 text-center border-vax-error-DEFAULT/20 bg-vax-error-light/30">
        <AlertCircle className="w-12 h-12 text-vax-error-DEFAULT mx-auto mb-4" />
        <h1 className="text-xl font-bold text-vax-error-DEFAULT mb-2">Erro de Integridade</h1>
        <p className="text-sm text-vax-error-DEFAULT/80 mb-6">{error}</p>
        <Button variant="primary" onClick={() => navigate("/explorar")}>Voltar para o explorador</Button>
      </Card>
    </div>
  );

  // Lógica de cálculos baseada no teu SQL
  const financiamentoConcluido = (campanha.financiamento || []).filter((f: any) => f.estado_pagamento === 'concluido');
  const realArrecadado = financiamentoConcluido.reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0);
  const percentage = Math.min((realArrecadado / (Number(campanha.valor_meta) || 1)) * 100, 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(campanha.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 mt-10">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-400 font-bold hover:text-vax-primary transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1" /> Explorar Causas
        </button>
        <div className="flex items-center gap-4">
           <Button variant="outline" className="bg-white border-vax-border shadow-sm text-xs rounded-full px-6" leftIcon={<Share2 className="w-4 h-4" />}>Partilhar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-10">
             <div className="aspect-video rounded-[60px] overflow-hidden border border-vax-border shadow-3xl relative group">
                <img 
                  src={campanha.imagem_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]"
                  alt={campanha.titulo}
                />
                <div className="absolute top-10 left-10 flex gap-4">
                   <Badge className="bg-white/95 backdrop-blur shadow-2xl border-none font-black uppercase tracking-[0.2em] px-6 py-3 text-[10px] rounded-full">
                     {normalizarCategoria(campanha.categoria)}
                   </Badge>
                   <Badge className="bg-vax-primary text-white border-none shadow-2xl flex items-center gap-3 font-black px-6 rounded-full text-[10px]">
                      <ShieldCheck className="w-4 h-4" /> VALIDADO NIF
                   </Badge>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest px-2">
                   <MapPin className="w-4 h-4 text-vax-primary" /> Luanda • {new Date(campanha.data_criacao).toLocaleDateString()}
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-vax-primary leading-[0.95] tracking-tighter">
                  {campanha.titulo}
                </h1>
             </div>
          </div>

          <div className="flex items-center border-b border-vax-border gap-12 font-black text-xs">
             {['sobre', 'apoiadores'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-6 uppercase tracking-[0.3em] transition-all relative ${
                    activeTab === tab ? "text-vax-primary" : "text-slate-300 hover:text-vax-primary"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 w-full h-1 bg-vax-primary rounded-full shadow-lg" />
                  )}
                </button>
             ))}
          </div>

          <div className="min-h-[400px]">
             <AnimatePresence mode="wait">
                {activeTab === 'sobre' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                  >
                     <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 text-2xl leading-relaxed whitespace-pre-wrap font-medium">
                          {campanha.descricao}
                        </p>
                     </div>

                     <Card className="p-10 bg-vax-primary/[0.03] border-dashed border-4 flex items-start gap-10 border-vax-primary/20 rounded-[40px]">
                        <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center shrink-0 shadow-2xl border border-vax-border">
                           <ShieldCheck className="w-8 h-8 text-vax-primary" />
                        </div>
                        <div className="space-y-2">
                           <h4 className="font-bold text-vax-primary text-xl tracking-tight">Segurança AF-NIF Operacional</h4>
                           <p className="text-lg text-slate-500 mt-1 leading-relaxed opacity-80">
                              Os fundos são protegidos pela rede. Apenas perfis validados pela AGT/SEPE podem participar no financiamento desta causa.
                           </p>
                        </div>
                     </Card>
                  </motion.div>
                )}

                {activeTab === 'apoiadores' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                     {financiamentoConcluido.length > 0 ? (
                       financiamentoConcluido.map((f: any, i: number) => {
                          const donorName = f.usuarios?.nome_completo || "Doador Anónimo";
                          return (
                            <Card key={i} className="flex items-center gap-6 p-6 border-2 border-vax-border rounded-[32px] bg-white transition-all hover:border-vax-success-DEFAULT/20 shadow-sm hover:shadow-lg">
                                <Avatar name={donorName} size="md" className="border-2 border-white shadow-md" />
                               <div className="flex-1 min-w-0">
                                  <span className="block text-base font-bold text-vax-primary truncate tracking-tight">{donorName}</span>
                                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(f.data_criacao).toLocaleDateString()}</span>
                               </div>
                               <div className="text-right">
                                  <span className="block text-xl font-bold text-vax-success-DEFAULT tabular-nums">+{Number(f.valor).toLocaleString()} KZ</span>
                               </div>
                            </Card>
                          );
                       })
                     ) : (
                       <div className="col-span-full text-center py-32 bg-vax-input/10 rounded-[60px] border-4 border-dashed border-vax-border flex flex-col items-center">
                          <Users className="w-16 h-16 text-slate-200 mb-6" />
                          <div className="space-y-2">
                             <p className="text-base font-black text-vax-primary opacity-70 uppercase tracking-[0.2em]">Seja o primeiro Financiador</p>
                             <p className="text-xs font-bold text-slate-400">Apenas doações confirmadas são listadas nesta rede.</p>
                          </div>
                       </div>
                     )}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        <div className="space-y-10">
           <Card className="p-10 shadow-3xl bg-white border-vax-border rounded-[60px] relative overflow-hidden flex flex-col gap-10">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-vax-primary to-vax-success-DEFAULT" />
              <div className="space-y-8">
                 <div className="space-y-2">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Angariados na Rede</span>
                    <span className="text-5xl font-bold text-vax-primary tracking-tighter tabular-nums leading-none">
                       {Number(realArrecadado).toLocaleString()} <span className="text-xl font-medium text-slate-300">KZ</span>
                    </span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-vax-primary">
                       <span>Meta: {Number(campanha.valor_meta).toLocaleString()} KZ</span>
                       <span className="tabular-nums">{Math.floor(percentage)}%</span>
                    </div>
                    <div className="w-full h-4 bg-vax-input rounded-full overflow-hidden shadow-inner p-1 border border-vax-border/50">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         transition={{ duration: 1.5, ease: "easeOut" }}
                         className={`h-full rounded-full shadow-lg ${percentage >= 100 ? 'bg-vax-success-DEFAULT' : 'bg-vax-primary'}`} 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-2 bg-slate-50 rounded-[32px] border-2 border-vax-border text-center shadow-sm">
                       <h5 className="text-3xl font-bold text-vax-primary tabular-nums tracking-tighter leading-none mb-1">{financiamentoConcluido.length}</h5>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Apoiadores</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-[32px] border-2 border-vax-border text-center shadow-sm">
                       <h5 className="text-3xl font-bold text-vax-primary tabular-nums tracking-tighter leading-none mb-1">{daysLeft}</h5>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dias Restantes</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Valor do Financiamento</label>
                    <div className="relative group">
                       <input 
                         type="number"
                         value={valorDoacao}
                         onChange={(e) => setValorDoacao(e.target.value)}
                         className="w-full bg-vax-input rounded-[30px] border-4 border-vax-border p-2 pr-16 font-black text-3xl text-vax-primary outline-none focus:border-vax-primary transition-all tabular-nums text-center shadow-inner group-hover:border-slate-300"
                       />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">KZ</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <Button 
                      onClick={handleDonation}
                      isLoading={donateLoading}
                      disabled={user && !user.ativo}
                      className={`w-full py-4 text-xl font-black shadow-2xl transition-all group relative overflow-hidden rounded-full ${
                        user && !user.ativo 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                          : 'bg-vax-primary shadow-vax-primary/40'
                      }`}
                    >
                       <span className="relative z-10 flex items-center justify-center gap-4">
                          {user && !user.ativo ? "NIF pendente AGT" : "Apoiar agora"} 
                       </span>
                    </Button>
                    <div className="flex items-center gap-4 p-5 bg-vax-input/40 rounded-[30px] border-2 border-vax-border/50">
                       <ShieldCheck className="w-7 h-7 text-vax-success-DEFAULT shrink-0" />
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                          {user && !user.ativo 
                            ? "A sua conta está suspensa para doações até à validação do NIF." 
                            : "Gateway de Pagamento PaysGator Verificado."}
                       </p>
                    </div>
                 </div>
              </div>
           </Card>

           <div className="flex flex-col gap-6 pt-4">
              <Card className="p-8 transition-all hover:bg-slate-50 cursor-pointer group rounded-[40px] border-vax-border shadow-vax" onClick={() => navigate(`/perfil/${campanha.usuario_id}`)}>
                 <div className="flex items-center gap-6">
                    <Avatar name={campanha.usuarios?.nome_completo} size="md" className="rounded-2xl shadow-xl" />
                    <div className="flex-1 min-w-0">
                       <h4 className="text-base font-bold text-vax-primary group-hover:underline truncate tracking-tight">Criado por</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-3">
                          <Info className="w-3 h-3" /> {campanha.usuarios?.nome_completo || "Utilizador Vax"}
                       </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-vax-primary transition-transform group-hover:translate-x-1" />
                 </div>
              </Card>

              <button 
                onClick={() => setIsReporting(true)}
                className="w-full flex items-center justify-center gap-4 p-6 rounded-[32px] bg-vax-error-light/10 text-vax-error-DEFAULT hover:bg-vax-error-light/30 transition-all group border-2 border-vax-error-DEFAULT/10"
              >
                <Flag className="w-5 h-5 group-hover:fill-vax-error-DEFAULT transition-all" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Denunciar Causa</span>
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[60px] shadow-3xl w-full max-w-2xl overflow-hidden border-4 border-vax-border"
              >
                 <div className="p-10 border-b-4 border-vax-error-DEFAULT/10 flex justify-between items-center bg-vax-error-light/5">
                    <div>
                       <h3 className="text-4xl font-bold text-vax-error-DEFAULT tracking-tighter">Reportar irregularidade</h3>
                       <p className="text-[10px] font-black text-vax-error-DEFAULT/60 uppercase tracking-[0.2em] mt-2">Equipa de Auditoria VAX analisará os factos</p>
                    </div>
                    <button onClick={() => setIsReporting(false)} className="p-4 hover:bg-white rounded-full transition-all text-slate-400 shadow-sm border border-vax-border"><X className="w-6 h-6" /></button>
                 </div>
                 
                 {reportSuccess ? (
                   <div className="p-20 text-center space-y-8">
                      <div className="w-24 h-24 bg-vax-success-light rounded-[32px] flex items-center justify-center mx-auto shadow-2xl rotate-12">
                         <Check className="w-12 h-12 text-vax-success-DEFAULT" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-3xl font-bold text-vax-primary tracking-tighter">Protocolo Registado</h4>
                         <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">A sua denúncia foi inserida na tabela de auditoria e será processada em 24h.</p>
                      </div>
                   </div>
                 ) : (
                   <form onSubmit={handleReport} className="p-10 space-y-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Deteção de Fraude / Motivo</label>
                         <textarea 
                           required
                           value={reportReason}
                           onChange={(e) => setReportReason(e.target.value)}
                           placeholder="Descreva detalhadamente a irregularidade detetada nesta causa..."
                           className="w-full bg-vax-input rounded-[32px] border-4 border-vax-border p-8 min-h-[220px] font-bold text-lg text-vax-primary outline-none focus:border-vax-error-DEFAULT transition-all shadow-inner placeholder:text-slate-300"
                         />
                      </div>
                      <div className="flex gap-6">
                         <Button type="button" variant="ghost" className="flex-1 font-black text-xs uppercase tracking-widest text-slate-400" onClick={() => setIsReporting(false)}>Cancelar</Button>
                         <Button type="submit" className="flex-[2] bg-vax-error-DEFAULT hover:bg-vax-error-DEFAULT/90 py-8 rounded-full shadow-2xl shadow-vax-error-DEFAULT/20 font-black text-xs uppercase tracking-widest" isLoading={reportLoading}>
                            Submeter Denúncia
                         </Button>
                      </div>
                   </form>
                 )}
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};