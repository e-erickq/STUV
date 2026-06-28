import { PerfilUsuario } from '@stuv/shared';
import {
  BarChart2,
  Bug,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Play,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: PerfilUsuario[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard size={18} /> },
  { label: 'Planos de Teste', to: '/planos', icon: <ClipboardList size={18} /> },
  { label: 'Casos de Uso', to: '/casos-uso', icon: <FileText size={18} /> },
  { label: 'Execuções', to: '/execucoes', icon: <Play size={18} /> },
  { label: 'Defeitos', to: '/defeitos', icon: <Bug size={18} /> },
  { label: 'Relatórios', to: '/relatorios', icon: <BarChart2 size={18} /> },
  {
    label: 'Usuários',
    to: '/usuarios',
    icon: <Users size={18} />,
    roles: [PerfilUsuario.ADMINISTRADOR, PerfilUsuario.GERENTE],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.perfil)),
  );

  return (
    <aside className="flex h-screen w-60 flex-col bg-[#0F172A]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-white">
          S✓
        </div>
        <span className="font-display text-base font-bold text-white tracking-tight">STUV</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
