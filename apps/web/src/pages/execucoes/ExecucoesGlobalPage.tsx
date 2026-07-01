import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { ResultadoExecucao } from '@stuv/shared';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { planosApi, PlanoTeste } from '../../lib/api/planos';
import { relatoriosApi, RelatorioData, ExecucaoRelatorio } from '../../lib/api/relatorios';

const RESULTADO_CLS: Record<string, string> = {
  PASSOU: 'bg-green-50 text-green-700',
  FALHOU: 'bg-red-50 text-red-700',
  BLOQUEADO: 'bg-orange-50 text-orange-700',
  PULADO: 'bg-slate-100 text-slate-600',
  EM_EXECUCAO: 'bg-blue-50 text-blue-700',
  NAO_EXECUTADO: 'bg-slate-50 text-slate-400',
};

const STATUS_OPTS = [
  { value: '', label: 'Todos os resultados' },
  { value: ResultadoExecucao.PASSOU, label: 'Passou' },
  { value: ResultadoExecucao.FALHOU, label: 'Falhou' },
  { value: ResultadoExecucao.BLOQUEADO, label: 'Bloqueado' },
  { value: ResultadoExecucao.PULADO, label: 'Pulado' },
  { value: ResultadoExecucao.EM_EXECUCAO, label: 'Em Execução' },
  { value: ResultadoExecucao.NAO_EXECUTADO, label: 'Não Executado' },
];

export function ExecucoesGlobalPage() {
  const [resultado, setResultado] = useState('');
  const [executorId, setExecutorId] = useState('');
  const [planoId, setPlanoId] = useState('');

  const { data: relatorio, isLoading } = useQuery<RelatorioData>({
    queryKey: ['relatorios', {}],
    queryFn: () => relatoriosApi.get({}),
  });

  const { data: planos = [] } = useQuery<PlanoTeste[]>({
    queryKey: ['planos'],
    queryFn: () => planosApi.list(),
  });

  const execucoes: ExecucaoRelatorio[] = relatorio?.execucoes ?? [];

  // Deriva executores únicos das próprias execuções (sem chamar /usuarios)
  const executores = Array.from(
    new Map(execucoes.map((e) => [e.executor.id, e.executor])).values(),
  ).sort((a, b) => a.nome.localeCompare(b.nome));

  const filtradas = execucoes.filter((e) => {
    if (resultado && e.resultado !== resultado) return false;
    if (executorId && e.executor.id !== executorId) return false;
    if (planoId && e.casoTeste.casoUso.plano.id !== planoId) return false;
    return true;
  });

  const temFiltro = resultado || executorId || planoId;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Execuções</h1>
        {!isLoading && (
          <p className="text-sm text-slate-500 mt-0.5">
            {filtradas.length} execuç{filtradas.length !== 1 ? 'ões' : 'ão'}
            {temFiltro ? ' (filtrado)' : ' no total'}
          </p>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={resultado} onValueChange={setResultado}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Todos os resultados" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={executorId} onValueChange={setExecutorId}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="Todos os executores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os executores</SelectItem>
            {executores.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={planoId} onValueChange={setPlanoId}>
          <SelectTrigger className="w-52 bg-white">
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

        {temFiltro && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResultado('');
              setExecutorId('');
              setPlanoId('');
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando execuções...
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Activity size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Nenhuma execução encontrada.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Caso de Teste
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Caso de Uso
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Plano
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Executor
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Resultado
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 max-w-[180px] truncate">
                    <Link
                      to={`/planos/${e.casoTeste.casoUso.plano.id}/casos-uso/${e.casoTeste.casoUso.id}/casos-teste/${e.casoTeste.id}`}
                      className="font-medium text-slate-800 hover:text-primary text-xs transition-colors"
                    >
                      {e.casoTeste.nome}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[120px] truncate">
                    {e.casoTeste.casoUso.nome}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[120px] truncate">
                    {e.casoTeste.casoUso.plano.nome}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                    {e.executor.nome}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RESULTADO_CLS[e.resultado] ?? 'bg-slate-100 text-slate-500'}`}
                    >
                      {e.resultadoLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(e.dataExecucao).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
