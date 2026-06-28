import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="p-8 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Bem-vindo, <span className="font-medium text-foreground">{user?.nome}</span>.
      </p>
    </div>
  );
}
