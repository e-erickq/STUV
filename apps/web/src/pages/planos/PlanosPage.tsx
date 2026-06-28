import { useQuery } from '@tanstack/react-query';
import { FileText, Layers, Plus, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { planosApi, PlanoTeste } from '../../lib/api/planos';
import { PerfilUsuario, StatusPlano } from '@stuv/shared';

const STATUS_LABEL: Record<StatusPlano, string> = {
  RASCUNHO: 'Rascunho',
  ATIVO: 'Ativo',
  EM_EXECUCAO: 'Em Execução',
  CONCLUIDO: 'Concluído',
};

const STATUS_CLASS: Record<StatusPlano, string> = {
  RASCUNHO: 'bg-slate-100 text-slate-600',
  ATIVO: 'bg-green-50 text-green-700 border-green-200',
  EM_EXECUCAO: 'bg-blue-50 text-blue-700 border-blue-200',
  CONCLUIDO: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`rounded-lg p-2.5 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function PlanosPage() {
  const { user } = useAuth();
  const canCreate = user?.perfil === PerfilUsuario.ADMINISTRADOR || user?.perfil === PerfilUsuario.GERENTE;

  const { data: planos = [], isLoading } = useQuery<PlanoTeste[]>({
    queryKey: ['planos'],
    queryFn: planosApi.list,
  });

  const stats = {
    total: planos.length,
    ativos: planos.filter((p) => p.status === 'ATIVO').length,
    emExecucao: planos.filter((p) => p.status === 'EM_EXECUCAO').length,
    rascunhos: planos.filter((p) => p.status === 'RASCUNHO').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Planos de Teste</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie os planos de teste do sistema</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/planos/novo">
              <Plus size={16} className="mr-1.5" />
              Novo Plano
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Layers} label="Total de Planos" value={stats.total} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={FileText} label="Ativos" value={stats.ativos} color="bg-green-50 text-green-600" />
        <StatCard icon={RotateCcw} label="Em Execução" value={stats.emExecucao} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FileText} label="Rascunhos" value={stats.rascunhos} color="bg-slate-100 text-slate-600" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-700">Todos os Planos</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <RotateCcw size={20} className="mr-2 animate-spin" />
            Carregando...
          </div>
        ) : planos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum plano cadastrado ainda.</p>
            {canCreate && (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/planos/novo">Criar primeiro plano</Link>
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left font-medium text-slate-500">Nome</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Casos de Uso</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Atualizado em</th>
                {canCreate && <th className="px-5 py-3 text-left font-medium text-slate-500">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {planos.map((plano) => (
                <tr key={plano.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <Link
                        to={`/planos/${plano.id}`}
                        className="font-medium text-slate-800 hover:text-primary transition-colors"
                      >
                        {plano.nome}
                      </Link>
                      {plano.descricao && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{plano.descricao}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[plano.status]}`}>
                      {STATUS_LABEL[plano.status]}
                      {plano.status === 'RASCUNHO' && (
                        <span className="ml-1.5 text-slate-400">— etapa {plano.etapaWizardAtual}/7</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {plano._count?.casosUso ?? 0}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(plano.atualizadoEm)}
                  </td>
                  {canCreate && (
                    <td className="px-5 py-3">
                      {plano.status === 'RASCUNHO' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/planos/${plano.id}/editar`}>Continuar</Link>
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
