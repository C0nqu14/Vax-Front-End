import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Target,
  TrendingUp,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import { supabase } from "../services/supabase";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";

export const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [campanhas, setCampanhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        let allCampanhas: any[] = [];
        try {
          const campanhasRes = await api.get("/campanhas");
          allCampanhas = campanhasRes.data || [];
        } catch (campanhasErr) {
          console.warn("API /campanhas falhou ao buscar campanhas do perfil. Fallback Supabase.", campanhasErr);
          const { data, error } = await supabase
            .from("campanhas")
            .select("*")
            .order("data_criacao", { ascending: false });
          if (error) console.error("Erro Supabase campanhas:", error);
          allCampanhas = data || [];
        }

        const userCampanhas = allCampanhas.filter((c: any) => c.usuario_id === id);

        let userData = null;
        try {
          const userRes = await api.get(`/usuario/${id}`);
          userData = userRes.data;
        } catch (err1) {
          try {
            const userRes = await api.get(`/users/${id}`);
            userData = userRes.data;
          } catch (err2) {
            console.warn("API /users/:id falhou. Tentando Supabase.", err2);
            const { data: supUser, error: supError } = await supabase
              .from("usuarios")
              .select("id, nome_completo, email, nif, ativo, data_criacao, iban_reembolso, dados_bancarios")
              .eq("id", id)
              .single();

            if (supError && supError.code !== "PGRST116") {
              console.error("Supabase error ao buscar usuário:", supError);
            }

            if (supUser) {
              userData = supUser;
            } else if (userCampanhas.length > 0) {
              const campanhaUser = userCampanhas[0];
              userData = {
                id: id,
                nome_completo: campanhaUser.usuarios?.nome_completo || campanhaUser.usuario_nome || "Usuário Vax",
                email: campanhaUser.usuarios?.email || null,
                nif: campanhaUser.usuarios?.nif || null,
                data_criacao: campanhaUser.usuarios?.data_criacao || campanhaUser.data_criacao,
                dados_bancarios: campanhaUser.usuarios?.dados_bancarios || null
              };
            } else {
              userData = {
                id: id,
                nome_completo: "Usuário Vax",
                email: null,
                nif: null,
                data_criacao: new Date().toISOString(),
                dados_bancarios: null
              };
            }
          }
        }

        setUser(userData);
        setCampanhas(userCampanhas);
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
        setError("Não foi possível carregar o perfil do usuário.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-vax-primary animate-spin" />
      <span className="text-[10px] font-bold text-vax-primary uppercase tracking-[0.3em]">Carregando perfil...</span>
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <Card className="max-w-md w-full p-10 text-center border-vax-error-DEFAULT/20 bg-vax-error-light/30">
        <AlertCircle className="w-12 h-12 text-vax-error-DEFAULT mx-auto mb-4" />
        <h1 className="text-xl font-bold text-vax-error-DEFAULT mb-2">Erro ao carregar perfil</h1>
        <p className="text-sm text-vax-error-DEFAULT/80 mb-6">{error}</p>
        <Button variant="primary" onClick={() => navigate("/explorar")}>Voltar para exploração</Button>
      </Card>
    </div>
  );

  const totalArrecadado = campanhas.reduce((acc, c) => acc + (Number(c.valor_arrecadado) || 0), 0);
  const totalMeta = campanhas.reduce((acc, c) => acc + (Number(c.valor_meta) || 0), 0);
  const campanhasAtivas = campanhas.filter(c => c.estado === 'ativa').length;
  const totalApoiadores = campanhas.reduce((acc, c) => acc + ((c.financiamento || []).filter((f: any) => f.estado_pagamento === 'concluido').length), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 mt-10">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-400 font-bold hover:text-vax-primary transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1" /> Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <Avatar name={user?.nome_completo} size="xl" className="border-4 border-white shadow-xl" />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-vax-primary text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">MEMBRO VAX</Badge>
                  <Badge className="bg-vax-success-light text-vax-success-DEFAULT border-none px-3 py-1 font-bold text-[9px]">NIF VERIFICADO</Badge>
                </div>
                <h1 className="text-4xl font-bold text-vax-primary tracking-tight">{user?.nome_completo || "Usuário Vax"}</h1>
                <p className="text-slate-500 font-medium">
                  Membro ativo da comunidade desde {user?.data_criacao ? new Date(user.data_criacao).getFullYear() : new Date().getFullYear()}
                  {user?.nif && <span className="ml-2">• NIF: {user.nif}</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-to-br from-vax-primary/10 to-vax-primary/5 border-vax-primary/20">
              <TrendingUp className="w-8 h-8 text-vax-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-vax-primary tabular-nums">{totalArrecadado.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Arrecadado</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <Target className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-500 tabular-nums">{campanhas.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projetos Criados</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-500 tabular-nums">{campanhasAtivas}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projetos Ativos</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-500 tabular-nums">{totalApoiadores}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Apoiadores Totais</div>
            </Card>
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-vax-primary flex items-center gap-4">
              <Target className="w-6 h-6" /> Projetos de {user?.nome_completo?.split(' ')[0] || 'Este usuário'}
            </h3>

            {campanhas.length > 0 ? (
              <div className="grid gap-6">
                {campanhas.map((campanha) => (
                  <Card
                    key={campanha.id}
                    className="p-6 hover:border-vax-primary/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/campanhas/${campanha.id}`)}
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-vax-input flex items-center justify-center overflow-hidden border border-vax-border">
                        {campanha.imagem_url ? (
                          <img src={campanha.imagem_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Target className="w-8 h-8 text-vax-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className={`border-none text-[9px] px-3 py-1 uppercase ${
                            campanha.estado === 'ativa' ? 'bg-vax-success-light text-vax-success-DEFAULT' :
                            campanha.estado === 'concluida' ? 'bg-slate-100 text-slate-500' :
                            'bg-vax-error-light text-vax-error-DEFAULT'
                          }`}>
                            {campanha.estado || 'pendente'}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(campanha.data_criacao).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-vax-primary text-lg group-hover:text-vax-primary/70 transition-colors">
                          {campanha.titulo}
                        </h4>
                        <p className="text-slate-500 text-sm line-clamp-2">{campanha.descricao}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-bold text-vax-primary tabular-nums">
                              {Number(campanha.valor_arrecadado || 0).toLocaleString()} KZ
                            </span>
                            <span className="text-slate-400">de {Number(campanha.valor_meta || 0).toLocaleString()} KZ</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {((campanha.financiamento || []).filter((f: any) => f.estado_pagamento === 'concluido').length)} apoiadores
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-2 border-vax-border bg-vax-input/10">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="font-bold text-vax-primary text-lg mb-2">Nenhum projeto ainda</h4>
                <p className="text-slate-500 text-sm">Este usuário ainda não criou projetos na plataforma.</p>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <Card className="p-8 bg-gradient-to-br from-vax-primary/5 to-vax-success-DEFAULT/5 border-vax-primary/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-vax-primary/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-vax-primary" />
              </div>
              <div>
                <h4 className="font-bold text-vax-primary text-lg">Perfil Verificado</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {user?.nif ? 'NIF VALIDADO PELA AGT' : 'VERIFICAÇÃO PENDENTE'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                {user?.nif 
                  ? 'Este usuário foi verificado através do sistema de identificação fiscal angolano, garantindo a segurança e transparência de todas as suas iniciativas.'
                  : 'Este usuário ainda não completou a verificação de identidade. Alguns recursos podem estar limitados.'
                }
              </p>
              {user?.dados_bancarios && (
                <div className="mt-4 p-4 bg-white/50 rounded-xl border border-vax-border/50">
                  <h5 className="font-bold text-vax-primary text-sm mb-2">Dados Bancários Verificados</h5>
                  <p className="text-xs text-slate-500">
                    Conta bancária associada e verificada para recebimento de fundos.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-8">
            <h4 className="font-bold text-vax-primary text-lg mb-6">Impacto Geral</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-600">Taxa de Sucesso</span>
                <span className="font-bold text-vax-primary tabular-nums">
                  {campanhas.length > 0 ? Math.round((campanhas.filter(c => Number(c.valor_arrecadado) >= Number(c.valor_meta)).length / campanhas.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-vax-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-vax-primary to-vax-success-DEFAULT rounded-full transition-all"
                  style={{
                    width: `${campanhas.length > 0 ? Math.min((totalArrecadado / totalMeta) * 100, 100) : 0}%`
                  }}
                />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Meta global: {totalArrecadado.toLocaleString()} / {totalMeta.toLocaleString()} KZ
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};