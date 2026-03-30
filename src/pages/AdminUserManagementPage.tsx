import { useState, useEffect } from "react";
import { 
  Users, Search, Download, Shield, UserX, ShieldCheck,
  Lock, Mail, Fingerprint, Loader2, AlertTriangle, CheckCircle
} from "lucide-react";
import api from "../services/api";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const AdminUserManagementPage = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/usuarios");
      setUsuarios(response.data || []);
    } catch (err) {
      console.error("Erro ao carregar utilizadores do SQL");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(id);
      // PATCH é o método correto para atualização parcial de estado
      await api.patch(`/admin/usuarios/${id}`, { ativo: !currentStatus });
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !currentStatus } : u));
    } catch {
      try {
        // Fallback para POST se o back-end não suportar PATCH
        await api.post(`/admin/usuarios/${id}`, { ativo: !currentStatus });
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !currentStatus } : u));
      } catch {
        // Optimistic update mesmo com erro de rede
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !currentStatus } : u));
        alert("Ação aplicada localmente. Confirme se o endpoint /admin/usuarios/:id está ativo no back-end.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = usuarios.filter(u =>
    (u.nome_completo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.nif || "").includes(searchTerm)
  );

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.ativo).length,
    inativos: usuarios.filter(u => !u.ativo).length
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vax-border pb-6">
        <div>
          <Badge className="bg-vax-primary text-white border-none px-3 py-1.5 font-black tracking-widest text-[9px] uppercase mb-3 flex items-center gap-2 w-fit">
            <Shield className="w-3 h-3" /> Centro de Identidade
          </Badge>
          <h1 className="text-3xl font-bold text-vax-primary tracking-tighter">Gestão de Utilizadores</h1>
          <p className="text-slate-500 text-sm mt-1">Perfis e conformidade AF-NIF em tempo real da base de dados.</p>
        </div>
        <Button variant="outline" className="border-vax-border bg-white h-10 text-xs font-bold uppercase tracking-widest" leftIcon={<Download className="w-4 h-4" />}>
          Exportar
        </Button>
      </header>

      {/* Métricas reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border-vax-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-vax-input rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-vax-primary" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Registos</span>
          </div>
          <h3 className="text-3xl font-bold text-vax-primary tabular-nums">{stats.total}</h3>
        </Card>
        <Card className="p-5 bg-white border-vax-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-vax-success-light rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-vax-success-DEFAULT" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIF Verificado</span>
          </div>
          <h3 className="text-3xl font-bold text-vax-primary tabular-nums">{stats.ativos}</h3>
        </Card>
        <Card className="p-5 bg-white border-l-4 border-l-vax-error-DEFAULT border-vax-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-vax-error-light rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-vax-error-DEFAULT" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suspensos</span>
          </div>
          <h3 className="text-3xl font-bold text-vax-primary tabular-nums">{stats.inativos}</h3>
        </Card>
      </div>

      {/* Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por Nome, NIF ou Email..."
            className="w-full bg-white border border-vax-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-vax-primary transition-all placeholder:text-slate-400"
          />
        </div>
        <button onClick={fetchUsers} className="px-4 py-2.5 text-xs font-black text-vax-primary border border-vax-border rounded-xl bg-white hover:bg-vax-input transition-all uppercase tracking-widest">
          ↻ Atualizar
        </button>
      </div>

      {/* Tabela */}
      <Card className="overflow-hidden border-vax-border shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-vax-input/40 border-b border-vax-border">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilizador & NIF</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">E-mail</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Registo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vax-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-vax-primary mx-auto" />
                    <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">A consultar base SQL...</p>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isLoading = actionLoading === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-vax-input flex items-center justify-center font-bold text-vax-primary text-sm shrink-0 group-hover:scale-105 transition-transform border border-vax-border">
                            {u.nome_completo?.charAt(0) || '?'}
                          </div>
                          <div>
                            <span className="block font-bold text-vax-primary text-sm">{u.nome_completo}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                              <Fingerprint className="w-3 h-3" /> {u.nif || 'NIF não registado'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-slate-500">{u.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                            u.ativo
                              ? 'bg-vax-success-light text-vax-success-DEFAULT'
                              : 'bg-vax-error-light text-vax-error-DEFAULT'
                          }`}>
                            {u.ativo ? 'Verificado' : 'Suspenso'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-xs text-slate-400 font-medium tabular-nums">
                          {u.data_criacao ? new Date(u.data_criacao).toLocaleDateString('pt-BR') : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => toggleUserStatus(u.id, u.ativo)}
                          disabled={isLoading}
                          className={`h-9 px-4 rounded-full font-black text-[9px] uppercase tracking-widest transition-all disabled:opacity-50 ${
                            u.ativo
                              ? 'bg-vax-error-DEFAULT text-white hover:bg-vax-error-DEFAULT/90'
                              : 'bg-vax-success-DEFAULT text-white hover:bg-vax-success-DEFAULT/90'
                          }`}
                          leftIcon={isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : u.ativo ? <UserX className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        >
                          {u.ativo ? 'Suspender' : 'Validar'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-sm font-bold text-slate-400">Nenhum utilizador encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-vax-input/20 border-t border-vax-border flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredUsers.length} utilizador(es)
          </span>
        </div>
      </Card>

      {/* Painel de protocolos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-8 bg-slate-900 border-none text-white rounded-2xl">
          <h3 className="text-lg font-bold tracking-tight mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-vax-primary" /> Protocolos de Auditoria
          </h3>
          <p className="text-sm text-white/80 mb-6 leading-relaxed">
            As alterações de status são registadas com carimbo de tempo para conformidade fiscal e jurídica.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-slate-900 px-6 h-10 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/90">
              Histórico de Sessões
            </Button>
            <Button variant="ghost" className="text-white/80 border border-white/20 px-6 h-10 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10">
              Logs de Segurança
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-2 border-dashed border-vax-border bg-vax-input/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-vax-border">
            <Mail className="w-6 h-6 text-vax-primary opacity-70" />
          </div>
          <div>
            <h4 className="text-base font-bold text-vax-primary">Comunicação Direta</h4>
            <p className="text-slate-500 text-xs mt-1">Notificar utilizadores inativos.</p>
          </div>
          <Button className="w-full bg-vax-primary text-white font-black h-10 rounded-full text-xs uppercase tracking-widest">
            Enviar Alerta de NIF
          </Button>
        </Card>
      </div>
    </div>
  );
};
