import { useState, useEffect } from "react";
import { 
  Users, Search, Download, Shield, UserX, ShieldCheck,
  Fingerprint, Loader2, AlertTriangle, CheckCircle,
  Building2
} from "lucide-react";
import { supabase } from "../services/supabase";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

export const AdminUserManagementPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
  
      const { data, error } = await supabase
        .from("usuarios")
        .select(`
          *,
          dados_bancarios!dados_bancarios_usuario_id_fkey (
            banco,
            iban,
            nome_titular
          )
        `)
        .order("data_criacao", { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [authLoading, isAdmin]);

  if (authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-vax-bg">
      <Loader2 className="w-10 h-10 text-vax-primary animate-spin" />
      <span className="text-[10px] font-black text-vax-primary uppercase tracking-widest animate-pulse">Sincronizando...</span>
    </div>
  );

  const filteredUsers = usuarios.filter((u) =>
    (u.nome_completo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.nif || "").includes(searchTerm)
  );

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ativo: !currentStatus } : u)));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vax-border pb-6">
        <div>
          <Badge className="bg-vax-primary text-white border-none px-4 py-1.5 font-black tracking-widest text-[9px] uppercase mb-3 flex items-center gap-2 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" /> Painel de Auditoria
          </Badge>
          <h1 className="text-4xl font-bold text-vax-primary tracking-tighter leading-none">Gestão de Utilizadores</h1>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por Nome ou NIF..."
            className="w-full bg-white border-2 border-vax-border rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-vax-primary transition-all font-bold shadow-sm"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-vax-border shadow-xl rounded-[32px] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-vax-input/30 border-b border-vax-border">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilizador</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dados Bancários (AO)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vax-border">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-vax-primary" /></td></tr>
              ) : filteredUsers.map((u) => {
                const isLoading = actionLoading === u.id;
                const conta = Array.isArray(u.dados_bancarios) ? u.dados_bancarios[0] : u.dados_bancarios;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-vax-input flex items-center justify-center font-black text-vax-primary border-2 border-white shadow-md uppercase">
                          {u.nome_completo?.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-vax-primary text-base tracking-tight">{u.nome_completo}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Fingerprint className="w-3 h-3" /> {u.nif || 'NIF Pendente'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Badge className={`px-4 py-1.5 rounded-full border-none text-[9px] font-black uppercase tracking-widest ${u.ativo ? 'bg-vax-success-light text-vax-success-DEFAULT' : 'bg-vax-error-light text-vax-error-DEFAULT'}`}>
                        {u.ativo ? 'Ativo' : 'Suspenso'}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      {conta?.iban ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-vax-primary flex items-center gap-1.5 uppercase">
                            <Building2 className="w-3.5 h-3.5 opacity-50" /> {conta.banco}
                          </span>
                          <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded w-fit tracking-tighter">
                            {conta.iban}
                          </span>
                          <span className="text-[9px] text-slate-300 font-bold uppercase truncate max-w-[150px]">
                            Titular: {conta.nome_titular}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">Sem IBAN Registado</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button
                        onClick={() => toggleUserStatus(u.id, u.ativo)}
                        disabled={isLoading}
                        className={`h-10 px-6 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${u.ativo ? 'bg-vax-error-DEFAULT' : 'bg-vax-success-DEFAULT'} text-white shadow-sm`}
                        leftIcon={isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : u.ativo ? <UserX className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      >
                        {u.ativo ? 'Suspender' : 'Validar'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};