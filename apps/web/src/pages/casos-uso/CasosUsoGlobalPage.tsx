import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText } from 'lucide-react';
import { StatusPlano } from '@stuv/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { casosUsoApi, CasoUso } from '../../lib/api/casos-uso';
import { planosApi, PlanoTeste } from '../../lib/api/planos';

const STATUS_CLS: Record<StatusPlano, string> = {
  RASCUNHO: 'bg-slate-100 text-slate-600',
  ATIVO: 'bg-green-50 text-green-700',
  EM_EXECUCAO: 'bg-blue-50 text-blue-700',
  CONCLUIDO: 'bg-indigo-50 text-indigo-700',
};

const STATUS_LABEL: Record<StatusPlano, string> = {
  RASCUNHO: 'Rascunho',
  ATIVO: 'Ativo',
  EM_EXECUCAO: 'Em Execução',
  CONCLUIDO: 'Concluído',
};

interface UCComPlano extends CasoUso {
  plano: PlanoTeste;
}

export function CasosUsoGlobalPage() {
  const [planoFiltro, setPlanoFiltro] = useState('');

  const { data: planos = [] } = useQuery<PlanoTeste[]>({
    queryKey: ['planos'],
    queryFn: () => planosApi.list(),
  });

  const { data: todosUCs = [], isLoading } = useQuery<UCComPlano[]>({
    queryKey: ['todos-casos-uso', planos.map((p) => p.id).join(',')],
    enabled: planos.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        planos.map(async (plano) => {
          const ucs = await casosUsoApi.listByPlano(plano.id);
          return ucs.map((uc) => ({ ...uc, plano }));
        }),
      );
      return results.flat();
    },
  });

  const filtrados = planoFiltro
    ? todosUCs.filter((uc) => uc.planoId === planoFiltro)
    : todosUCs;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Casos de Uso</h1>
        {!isLoading && (
          <p className="text-sm text-slate-500 mt-0.5">
            {filtrados.length} caso{filtrados.length !== 1 ? 's' : ''} de uso
          </p>
        )}
      </div>

      {/* Filtro por plano */}
      <div className="flex flex-wrap gap-3">
        <Select value={planoFiltro} onValueChange={setPlanoFiltro}>
          <SelectTrigger className="w-60 bg-white">
            <SelectValue placeholder="Todos os planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os planos</SelectItem>
            {planos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {planoFiltro && (
          <button
            onClick={() => setPlanoFiltro('')}
            className="px-3 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando casos de uso...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FileText size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Nenhum caso de uso encontrado.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Caso de Uso
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Plano
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">
                  CTs
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((uc) => (
                <tr key={uc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 text-sm">{uc.nome}</p>
                    {uc.descricao && (
                      <p className="text-xs text-slate-400 truncate max-w-[280px] mt-0.5">
                        {uc.descricao}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/planos/${uc.planoId}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {uc.plano.nome}
                    </Link>
                    <span
                      className={`ml-2 inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${STATUS_CLS[uc.plano.status]}`}
                    >
                      {STATUS_LABEL[uc.plano.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-slate-100 text-slate-600 text-xs font-bold px-1.5">
                      {uc._count?.casosTeste ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/planos/${uc.planoId}/casos-uso/${uc.id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver detalhes
                      <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
