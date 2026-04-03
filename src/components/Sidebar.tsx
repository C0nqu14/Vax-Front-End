import { 
  LayoutDashboard, 
  Wallet, 
  Briefcase, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  User,
  X,
  Shield,
  ShieldAlert,
  Globe,
  PlusCircle,
  History
} from "lucide-react";
import logo from "../../assets/vax-logo.png";
import { Link, useLocation } from "react-router-dom";
import { Avatar } from "./ui/Avatar";
import { useAuth } from "../contexts/AuthContext";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active?: boolean;
}

const NavItem = ({ icon: Icon, label, to, active }: NavItemProps) => (
  <Link to={to} className="block group px-3 mb-1">
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${active 
        ? "bg-vax-primary text-white shadow-lg shadow-vax-primary/20" 
        : "text-slate-500 hover:bg-vax-input hover:text-vax-primary"
      }
    `}>
      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400 group-hover:text-vax-primary transition-colors"}`} />
      <span className="font-semibold text-sm">{label}</span>
    </div>
  </Link>
);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[59] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-[280px] bg-white border-r border-vax-border flex flex-col 
        transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        <div className="p-6 pb-4 flex items-center justify-center relative border-b border-vax-border">
          <Link to="/dashboard" className="flex items-center">
            <img src={logo} alt="Vax Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden absolute right-4 p-2 rounded-lg bg-vax-input text-vax-primary hover:bg-vax-border transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="p-3 bg-vax-input/60 rounded-2xl border border-vax-border">
            <div className="flex items-center gap-3">
              <Avatar 
                name={user?.nome_completo} 
                src={user?.avatar_url} 
                size="sm" 
                className="shadow-sm border-2 border-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-vax-primary truncate leading-tight">{user?.nome_completo || "Utilizador Vax"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-vax-error-DEFAULT' : 'bg-vax-success-DEFAULT'} animate-pulse`} />
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {isAdmin ? "Administrador" : "Utilizador"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 overflow-y-auto pb-4" onClick={onClose}>
          <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Geral</div>
          
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={location.pathname === "/dashboard"} />
          <NavItem icon={Wallet} label="Explorar Causas" to="/explorar" active={location.pathname === "/explorar"} />
          <NavItem icon={History} label="Histórico" to="/historico" active={location.pathname === "/historico"} />

          {!isAdmin && (
            <>
              <div className="px-4 py-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Meus Impactos</div>
              <NavItem icon={Briefcase} label="Minhas Iniciativas" to="/meus-projetos" active={location.pathname === "/meus-projetos"} />
              <NavItem icon={PlusCircle} label="Lançar Ideia" to="/campanhas/nova" active={location.pathname === "/campanhas/nova"} />
            </>
          )}

          {isAdmin && (
            <div className="mx-2 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
              <div className="px-3 py-2 text-[10px] font-black text-vax-error-DEFAULT uppercase tracking-[0.2em] flex items-center gap-2">
                <Shield className="w-3 h-3" /> Gestão Técnica
              </div>
              <NavItem icon={ShieldAlert} label="Relatórios" to="/admin/relatorios" active={location.pathname === "/admin/relatorios"} />
              <NavItem icon={Users} label="Utilizadores" to="/admin/usuarios" active={location.pathname === "/admin/usuarios"} />
              <NavItem icon={Globe} label="Campanhas" to="/admin/campanhas" active={location.pathname === "/admin/campanhas"} />
              <NavItem icon={BarChart3} label="Financeiro" to="/admin/doacoes" active={location.pathname === "/admin/doacoes"} />
            </div>
          )}

          <div className="px-4 py-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Conta</div>
          <NavItem icon={User} label="Meu Perfil" to="/perfil" active={location.pathname === "/perfil"} />
        </nav>

        <div className="p-4 border-t border-vax-border">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-slate-400 hover:text-vax-error-DEFAULT hover:bg-vax-error-light/50 rounded-xl transition-all duration-200 font-semibold text-sm group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
