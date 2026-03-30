import { Search, Bell, Plus, Menu, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-vax-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-vax-input text-vax-primary hover:bg-vax-border transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-md relative group hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-vax-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            className="w-full bg-vax-input border border-vax-border rounded-vax pl-10 pr-4 py-2 text-sm outline-none focus:border-vax-primary transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-4">
        {!user ? (
          <Button variant="primary" onClick={() => navigate('/login')}>Entrar</Button>
        ) : (
          <>
            {isAdmin && (
              <Badge className="bg-vax-error-light text-vax-error-DEFAULT border-none text-[9px] font-black px-3 py-1.5 hidden md:flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> ADMINISTRADOR
              </Badge>
            )}

            <button className="p-2 rounded-lg bg-vax-input border border-vax-border text-vax-primary hover:bg-vax-border transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-vax-error-DEFAULT rounded-full"></span>
            </button>

            <Link to="/perfil" className="p-1 rounded-lg bg-vax-input border border-vax-border flex items-center gap-2 hover:bg-vax-border transition-colors pr-3 group">
              <Avatar
                name={user?.nome_completo || user?.full_name}
                src={user?.avatar_url}
                size="sm"
                className="group-hover:ring-2 group-hover:ring-vax-primary"
              />
              <span className="text-xs font-bold text-vax-primary hidden lg:block">
                {user?.nome_completo?.split(' ')[0] || 'Conta'}
              </span>
            </Link>

            {!isAdmin && (
              <Button
                variant="primary"
                className="h-9 px-4 text-xs shadow-sm"
                onClick={() => navigate('/campanhas/nova')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                <span className="hidden sm:inline font-bold">Nova Causa</span>
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
