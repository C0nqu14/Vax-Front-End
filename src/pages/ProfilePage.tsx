import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, HelpCircle, ChevronRight, Bell, CreditCard, LogOut, Loader2, X, Check, Mail, Lock, Key, Settings } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const ProfilePage = () => {
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem("vax_user") || "{}"));
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [editForm, setEditForm] = useState({ nome_completo: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ atual: "", nova: "", confirmar: "" });
  
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/usuario/perfil");
        setUser(response.data);
        setEditForm({ nome_completo: response.data.nome_completo, email: response.data.email });
        localStorage.setItem("vax_user", JSON.stringify(response.data));
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vax_token");
    localStorage.removeItem("vax_user");
    navigate("/login");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await api.put("/usuario/perfil", editForm);
      const updatedUser = { ...user, ...editForm };
      setUser(updatedUser);
      localStorage.setItem("vax_user", JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (err) {
      alert("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.nova !== passwordForm.confirmar) {
      alert("As senhas não coincidem!");
      return;
    }
    setUpdateLoading(true);
    try {
      // Endpoint presumido conforme as especificações de segurança
      await api.put("/usuario/senha", { 
        senha_atual: passwordForm.atual,
        nova_senha: passwordForm.nova 
      });
      alert("Senha alterada com sucesso!");
      setIsChangingPassword(false);
      setPasswordForm({ atual: "", nova: "", confirmar: "" });
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao alterar senha.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-vax-primary animate-spin" />
      <p className="text-sm font-bold text-vax-primary animate-pulse uppercase tracking-[0.2em]">Autenticando...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header>
        <Badge variant="info" className="mb-4 bg-vax-primary text-white border-none py-1.5 px-4 font-bold tracking-widest text-[10px]">VERIFICADO AGT</Badge>
        <h1 className="text-4xl font-bold text-vax-primary tracking-tight">Privacidade & Configurações</h1>
        <p className="text-slate-500 font-medium text-lg mt-1">Gerencie sua identidade digital e segurança na rede Vax.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Profile Overview Card */}
         <Card className="p-10 flex flex-col items-center text-center h-fit lg:sticky lg:top-24 border-vax-border/50">
            <div className="relative group mb-8">
               <Avatar 
                 name={user.nome_completo} 
                 src={user.avatar_url} 
                 size="xl" 
                 className="shadow-2xl ring-4 ring-white" 
               />
               <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-vax-border text-vax-primary hover:bg-vax-primary hover:text-white transition-all transform hover:scale-110 active:scale-95"
               >
                  <User className="w-4 h-4" />
               </button>
            </div>
            
            <h2 className="text-2xl font-bold text-vax-primary mb-1 tracking-tight">{user.nome_completo || "Usuário Vax"}</h2>
            <div className="flex items-center gap-2 mb-8">
               <Badge variant="neutral" className="uppercase tracking-[0.15em] text-[8px] font-bold bg-vax-input text-slate-500 border-none px-3">
                  {(user.tipo || user.role) === 'admin' ? 'Administrador do Sistema' : 'Mobilizador Social'}
               </Badge>
            </div>

            <div className="w-full space-y-3">
               <Button onClick={() => setIsEditing(true)} className="w-full py-4 text-sm font-bold shadow-md shadow-vax-primary/10">Editar Perfil</Button>
               <Button 
                variant="ghost" 
                className="w-full text-vax-error-DEFAULT hover:bg-vax-error-light/50 font-bold" 
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
               >
                 Encerrar Sessão
               </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-vax-border w-full text-left space-y-4">
               <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>NIF / BI</span>
                  <span className="text-vax-primary">{user.nif || "Não informado"}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Membro desde</span>
                  <span className="text-vax-primary">{new Date(user.data_criacao).getFullYear()}</span>
               </div>
            </div>
         </Card>

         {/* Settings Sections */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-vax-primary px-2 mb-2 flex items-center gap-2">
               <Settings className="w-5 h-5 opacity-50" /> Preferências de Segurança
            </h3>
            <div className="grid gap-4">
               <SettingsItem 
                 icon={<User className="w-5 h-5 text-blue-500" />} 
                 title="Dados Pessoais" 
                 description={user.email || "Configure seu contato de recuperação"} 
                 onClick={() => setIsEditing(true)}
               />
               <SettingsItem 
                 icon={<Lock className="w-5 h-5 text-amber-500" />} 
                 title="Segurança da Conta" 
                 description="Alterar senha e chaves de acesso" 
                 onClick={() => setIsChangingPassword(true)}
               />
               <SettingsItem 
                 icon={<CreditCard className="w-5 h-5 text-emerald-500" />} 
                 title="Dados Bancários" 
                 description="Gerencie IBAN para recebimentos de causas" 
                 onClick={() => navigate("/banco")}
               />
               <SettingsItem 
                 icon={<Bell className="w-5 h-5 text-indigo-500" />} 
                 title="Notificações" 
                 description="Alertas de apoios e novidades na rede" 
               />
            </div>

            <Card className="p-8 bg-vax-primary/[0.02] border-dashed border-2 mt-8 flex flex-col md:flex-row items-center gap-6">
               <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shrink-0 shadow-lg border border-vax-border">
                  <Shield className="w-8 h-8 text-vax-primary" />
               </div>
               <div>
                  <h4 className="font-bold text-vax-primary text-base">Programa de Proteção Vax</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                     Seus dados estão protegidos em conformidade com as normas da AGT. Toda transação é monitorada para garantir que o seu impacto chegue onde deve.
                  </p>
               </div>
            </Card>
         </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 10 }}
               className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-vax-border"
             >
                <div className="p-8 border-b border-vax-border flex justify-between items-center bg-slate-50/50">
                   <div>
                      <h3 className="text-2xl font-bold text-vax-primary tracking-tight">Dados Pessoais</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mantenha seus contatos atualizados</p>
                   </div>
                   <button onClick={() => setIsEditing(false)} className="p-3 hover:bg-white rounded-full transition-all text-slate-400"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleUpdate} className="p-8 space-y-6">
                   <Input 
                     label="Nome Completo (Identidade)"
                     value={editForm.nome_completo}
                     onChange={(e) => setEditForm({...editForm, nome_completo: e.target.value})}
                     required
                     leftIcon={<User className="w-4 h-4" />}
                   />
                   <Input 
                     label="E-mail de Notificação"
                     type="email"
                     value={editForm.email}
                     onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                     required
                     leftIcon={<Mail className="w-4 h-4" />}
                   />
                   
                   <div className="flex gap-4 pt-6">
                      <Button type="button" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button type="submit" className="flex-[2] py-4 shadow-lg shadow-vax-primary/10" isLoading={updateLoading} leftIcon={<Check className="w-4 h-4" />}>
                         Confirmar Alterações
                      </Button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}

        {/* Change Password Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-vax-border"
             >
                <div className="p-8 border-b border-vax-border flex justify-between items-center bg-vax-error-light/10">
                   <div>
                      <h3 className="text-2xl font-bold text-vax-primary tracking-tight">Alterar Senha</h3>
                      <p className="text-[10px] font-bold text-vax-error-DEFAULT uppercase tracking-widest mt-1">Utilize uma combinação forte</p>
                   </div>
                   <button onClick={() => setIsChangingPassword(false)} className="p-3 hover:bg-white rounded-full transition-all text-slate-400"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleChangePassword} className="p-8 space-y-5">
                   <Input 
                     label="Senha Atual"
                     type="password"
                     value={passwordForm.atual}
                     onChange={(e) => setPasswordForm({...passwordForm, atual: e.target.value})}
                     required
                     leftIcon={<Key className="w-4 h-4" />}
                   />
                   <div className="h-px bg-vax-border my-2" />
                   <Input 
                     label="Nova Senha"
                     type="password"
                     value={passwordForm.nova}
                     onChange={(e) => setPasswordForm({...passwordForm, nova: e.target.value})}
                     required
                     leftIcon={<Lock className="w-4 h-4" />}
                   />
                   <Input 
                     label="Confirmar Nova Senha"
                     type="password"
                     value={passwordForm.confirmar}
                     onChange={(e) => setPasswordForm({...passwordForm, confirmar: e.target.value})}
                     required
                     leftIcon={<Shield className="w-4 h-4" />}
                   />
                   
                   <div className="flex gap-4 pt-6">
                      <Button type="button" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setIsChangingPassword(false)}>Voltar</Button>
                      <Button type="submit" className="flex-[2] py-4 bg-vax-primary text-white" isLoading={updateLoading}>
                         Atualizar Senha
                      </Button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsItem = ({ icon, title, description, onClick }: any) => (
  <motion.div 
    whileHover={{ x: 4, backgroundColor: "rgba(var(--vax-primary-rgb), 0.02)" }}
    onClick={onClick}
    className="bg-white p-7 rounded-[32px] border border-vax-border shadow-vax flex items-center justify-between cursor-pointer group hover:border-vax-primary transition-all duration-300"
  >
     <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-vax-input rounded-[22px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">{icon}</div>
        <div>
           <p className="font-bold text-vax-primary text-base mb-0.5 tracking-tight">{title}</p>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{description}</p>
        </div>
     </div>
     <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-vax-primary transition-all transform group-hover:translate-x-1" />
  </motion.div>
);


