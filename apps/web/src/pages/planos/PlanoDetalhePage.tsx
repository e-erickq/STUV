import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Edit, FlaskConical, GitBranch, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { CasoUso, casosUsoApi } from '../../lib/api/casos-uso';
import { PlanoTeste, planosApi } from '../../lib/api/planos';

const STATUS_CLASS: Record<string, string> = {
  RASCUNHO: 'bg-slate-100 text-slate-600',
  ATIVO: 'bg-green-50 text-green-700 border-green-200',
  EM_EXECUCAO: 'bg-blue-50 text-blue-700 border-blue-200',
  CONCLUIDO: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const STATUS_LABEL: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ATIVO: 'Ativo',
  EM_EXECUCAO: 'Em Execução',
  CONCLUIDO: 'Concluído',
};

function UCRow({ uc, planoId }: { uc: CasoUso; planoId: string }) {
  const ctCount = uc._count?.casosTeste ?? 0;
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3">
        <Link
          to={`/planos/${planoId}/casos-uso/${uc.id}`}
          className="font-medium text-slate-800 text-sm hover:text-primary transition-colors"
        >
          {uc.nome}
        </Link>
        {uc.descricao && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{uc.descricao}</p>
        )}
      </td>
      <td className="px-5 py-3 text-sm text-slate-500">
        {uc.atores || <span className="text-slate-300">—</span>}
      </td>
      <td className="px-5 py-3">
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <FlaskConical size={12} />
          {ctCount} CT{ctCount !== 1 ? 's' : ''}
        </span>
      </td>
      <td className="px-5 py-3">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/planos/${planoId}/casos-uso/${uc.id}/editar`}>
            <Edit size={12} className="mr-1" />
            Editar
          </Link>
        </Button>
      </td>
    </tr>
  );
}

export function PlanoDetalhePage() {
  const { id = '' } = useParams<{ id: string }>();

  const { data: plano, isLoading: loadingPlano } = useQuery<PlanoTeste>({
    queryKey: ['plano', id],
    queryFn: () => planosApi.get(id),
    enabled: !!id,
  });

  const { data: ucs = [], isLoading: loadingUcs } = useQuery<CasoUso[]>({
    queryKey: ['casos-uso', id],
    queryFn: () => casosUsoApi.listByPlano(id),
    enabled: !!id,
  });

  if (loadingPlano) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary border-t-transparent mr-2" />
        Carregando...
      </div>
    );
  }

  if (!plano) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Plano não encontrado.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/planos">← Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/planos" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft size={14} />
          Planos de Teste
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{plano.nome}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-slate-800">{plano.nome}</h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[plano.status]}`}>
              {STATUS_LABEL[plano.status]}
            </span>
          </div>
          {plano.descricao && (
            <p className="text-sm text-slate-500 mt-1 max-w-xl">{plano.descricao}</p>
          )}
        </div>

        {plano.status === 'RASCUNHO' && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/planos/${id}/editar`}>
              <Edit size={14} className="mr-1.5" />
              Editar Plano
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><GitBranch size={18} /></div>
          <div>
            <p className="text-xl font-bold font-display text-slate-800">{ucs.length}</p>
            <p className="text-xs text-slate-500">Casos de Uso</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600"><FlaskConical size={18} /></div>
          <div>
            <p className="text-xl font-bold font-display text-slate-800">
              {ucs.reduce((acc, u) => acc + (u._count?.casosTeste ?? 0), 0)}
            </p>
            <p className="text-xs text-slate-500">Casos de Teste</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600"><BookOpen size={18} /></div>
          <div>
            <p className="text-xl font-bold font-display text-slate-800">{plano.etapaWizardAtual}/7</p>
            <p className="text-xs text-slate-500">Etapa do Plano</p>
          </div>
        </div>
      </div>

      {/* UCs table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-700">Casos de Uso</h2>
          <Button size="sm" asChild>
            <Link to={`/planos/${id}/casos-uso/novo`}>
              <Plus size={14} className="mr-1.5" />
              Novo Caso de Uso
            </Link>
          </Button>
        </div>

        {loadingUcs ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            Carregando casos de uso...
          </div>
        ) : ucs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <GitBranch size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum caso de uso cadastrado neste plano.</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to={`/planos/${id}/casos-uso/novo`}>Criar primeiro caso de uso</Link>
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left font-medium text-slate-500">Nome</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Atores</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Testes</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ucs.map((uc) => <UCRow key={uc.id} uc={uc} planoId={id} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
