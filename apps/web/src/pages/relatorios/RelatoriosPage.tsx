import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ResultadoExecucao } from '@stuv/shared';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PlanoTeste, planosApi } from '../../lib/api/planos';
import { RelatorioFiltros, RelatorioData, relatoriosApi } from '../../lib/api/relatorios';
import { Usuario, fetchUsuarios } from '../../lib/api/usuarios';

// ─── Cores do DESIGN.md (hex para Recharts) ──────────────────────────────────

const RESULTADO_COLOR: Record<string, string> = {
  PASSOU: '#15803D',
  FALHOU: '#B91C1C',
  BLOQUEADO: '#C2410C',
  PULADO: '#475569',
  EM_EXECUCAO: '#1D4ED8',
  NAO_EXECUTADO: '#94A3B8',
};

const GRAVIDADE_COLOR: Record<string, string> = {
  CRITICA: '#7F1D1D',
  ALTA: '#B91C1C',
  MEDIA: '#B45309',
  BAIXA: '#15803D',
};

// Tailwind classes para resultado badge (reutilizadas na tabela)
const RESULTADO_CLS: Record<string, string> = {
  PASSOU: 'bg-green-50 text-green-700',
  FALHOU: 'bg-red-50 text-red-700',
  BLOQUEADO: 'bg-orange-50 text-orange-700',
  PULADO: 'bg-slate-100 text-slate-600',
  EM_EXECUCAO: 'bg-blue-50 text-blue-700',
  NAO_EXECUTADO: 'bg-slate-50 text-slate-400',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortResultados(items: RelatorioData['execucoesPorResultado']) {
  const ORDER = ['PASSOU', 'FALHOU', 'BLOQUEADO', 'EM_EXECUCAO', 'PULADO', 'NAO_EXECUTADO'];
  return [...items].sort((a, b) => ORDER.indexOf(a.resultado) - ORDER.indexOf(b.resultado));
}

function sortGravidades(items: RelatorioData['defeitosPorGravidade']) {
  const ORDER = ['CRITICA', 'ALTA', 'MEDIA', 'BAIXA'];
  return [...items].sort((a, b) => ORDER.indexOf(a.gravidade) - ORDER.indexOf(b.gravidade));
}

// ─── Cards de resumo ─────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-3xl font-bold font-display ${accent ?? 'text-slate-800'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Tabela ordenável ─────────────────────────────────────────────────────────

type SortKey = 'plano' | 'uc' | 'ct' | 'executor' | 'resultado' | 'data' | 'defeitos';

function TabelaExecucoes({ execucoes }: { execucoes: RelatorioData['execucoes'] }) {
  const [sortKey, setSortKey] = useState<SortKey>('data');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...execucoes].sort((a, b) => {
    let av: string | number = '';
    let bv: string | number = '';
    switch (sortKey) {
      case 'plano': av = a.casoTeste.casoUso.plano.nome; bv = b.casoTeste.casoUso.plano.nome; break;
      case 'uc': av = a.casoTeste.casoUso.nome; bv = b.casoTeste.casoUso.nome; break;
      case 'ct': av = a.casoTeste.nome; bv = b.casoTeste.nome; break;
      case 'executor': av = a.executor.nome; bv = b.executor.nome; break;
      case 'resultado': av = a.resultado; bv = b.resultado; break;
      case 'data': av = a.dataExecucao; bv = b.dataExecucao; break;
      case 'defeitos': av = a.defeitosCount; bv = b.defeitosCount; break;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const Th = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      onClick={() => toggleSort(k)}
    >
      {children}
      {sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <Th k="plano">Plano</Th>
            <Th k="uc">Caso de Uso</Th>
            <Th k="ct">Caso de Teste</Th>
            <Th k="executor">Executor</Th>
            <Th k="resultado">Resultado</Th>
            <Th k="data">Data</Th>
            <Th k="defeitos">Defeitos</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[120px] truncate">
                {e.casoTeste.casoUso.plano.nome}
              </td>
              <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[120px] truncate">
                {e.casoTeste.casoUso.nome}
              </td>
              <td className="px-3 py-2.5 text-slate-700 font-medium text-xs max-w-[140px] truncate">
                {e.casoTeste.nome}
              </td>
              <td className="px-3 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                {e.executor.nome}
              </td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RESULTADO_CLS[e.resultado] ?? 'bg-slate-100 text-slate-500'}`}>
                  {e.resultadoLabel}
                </span>
              </td>
              <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                {new Date(e.dataExecucao).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                })}
              </td>
              <td className="px-3 py-2.5 text-center">
                {e.defeitosCount > 0 ? (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-red-100 text-red-700 text-xs font-bold px-1.5">
                    {e.defeitosCount}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-slate-400 text-sm">
                Nenhuma execução encontrada para os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Filtros ─────────────────────────────────────────────────────────────────

const PERIODO_OPTS = [
  { value: '', label: 'Todo o período' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '180d', label: 'Últimos 6 meses' },
  { value: '365d', label: 'Último ano' },
];

const STATUS_OPTS = [
  { value: '', label: 'Todos os resultados' },
  { value: ResultadoExecucao.PASSOU, label: 'Passou' },
  { value: ResultadoExecucao.FALHOU, label: 'Falhou' },
  { value: ResultadoExecucao.BLOQUEADO, label: 'Bloqueado' },
  { value: ResultadoExecucao.PULADO, label: 'Pulado' },
  { value: ResultadoExecucao.EM_EXECUCAO, label: 'Em Execução' },
  { value: ResultadoExecucao.NAO_EXECUTADO, label: 'Não Executado' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RelatoriosPage() {
  const [filtros, setFiltros] = useState<RelatorioFiltros>({});

  const setFiltro = <K extends keyof RelatorioFiltros>(key: K, val: RelatorioFiltros[K]) =>
    setFiltros((prev) => ({ ...prev, [key]: val || undefined }));

  const { data, isLoading, isFetching, dataUpdatedAt } = useQuery<RelatorioData>({
    queryKey: ['relatorios', filtros],
    queryFn: () => relatoriosApi.get(filtros),
  });

  const { data: planos = [] } = useQuery<PlanoTeste[]>({
    queryKey: ['planos'],
    queryFn: () => planosApi.list(),
  });

  const { data: usuarios = [] } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: fetchUsuarios,
  });

  const downloadCom = (formato: 'pdf' | 'csv') => {
    const token = localStorage.getItem('stuv:token') ?? '';
    const url = relatoriosApi.downloadUrl(filtros, formato);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `relatorio-stuv.${formato}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      });
  };

  const resumo = data?.resumo;
  const execPorResultado = data ? sortResultados(data.execucoesPorResultado) : [];
  const defPorGravidade = data ? sortGravidades(data.defeitosPorGravidade) : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Relatórios</h1>
          {dataUpdatedAt > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              Atualizado às {new Date(dataUpdatedAt).toLocaleTimeString('pt-BR')}
              {isFetching && <RefreshCw size={10} className="inline ml-1 animate-spin" />}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCom('csv')} className="gap-1.5">
            <FileSpreadsheet size={14} />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadCom('pdf')} className="gap-1.5">
            <FileText size={14} />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Select
          value={filtros.planoId ?? ''}
          onValueChange={(v) => setFiltro('planoId', v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos os planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os planos</SelectItem>
            {planos.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.periodo ?? ''}
          onValueChange={(v) => setFiltro('periodo', v as RelatorioFiltros['periodo'])}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todo o período" />
          </SelectTrigger>
          <SelectContent>
            {PERIODO_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.executorId ?? ''}
          onValueChange={(v) => setFiltro('executorId', v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos os executores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os executores</SelectItem>
            {usuarios.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.status ?? ''}
          onValueChange={(v) => setFiltro('status', v as RelatorioFiltros['status'])}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos os resultados" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filtros.planoId || filtros.periodo || filtros.executorId || filtros.status) && (
          <Button variant="ghost" size="sm" onClick={() => setFiltros({})}>
            Limpar filtros
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-slate-400 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando dados...
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Total de Execuções"
              value={resumo?.totalExecucoes ?? 0}
            />
            <SummaryCard
              label="Pass Rate"
              value={`${resumo?.passRate ?? 0}%`}
              sub="execuções que passaram"
              accent={
                (resumo?.passRate ?? 0) >= 70
                  ? 'text-green-700'
                  : (resumo?.passRate ?? 0) >= 40
                  ? 'text-amber-700'
                  : 'text-red-700'
              }
            />
            <SummaryCard
              label="Defeitos Abertos"
              value={resumo?.defeitosAbertos ?? 0}
              sub="aguardando resolução"
              accent={(resumo?.defeitosAbertos ?? 0) > 0 ? 'text-red-700' : 'text-green-700'}
            />
            <SummaryCard
              label="Total de Defeitos"
              value={resumo?.totalDefeitos ?? 0}
              sub="incluindo fechados"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Execuções por resultado — BarChart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Execuções por Resultado</h2>
              {execPorResultado.length === 0 ? (
                <p className="text-slate-400 text-sm py-8 text-center">Sem dados para os filtros selecionados.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={execPorResultado} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                      formatter={(v: number) => [v, 'Execuções']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {execPorResultado.map((entry) => (
                        <Cell key={entry.resultado} fill={RESULTADO_COLOR[entry.resultado] ?? '#94A3B8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pass Rate — PieChart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Distribuição de Resultados</h2>
              {execPorResultado.length === 0 ? (
                <p className="text-slate-400 text-sm py-8 text-center">Sem dados para os filtros selecionados.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={execPorResultado}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {execPorResultado.map((entry) => (
                        <Cell key={entry.resultado} fill={RESULTADO_COLOR[entry.resultado] ?? '#94A3B8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                      formatter={(v: number, name: string) => [v, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Defeitos por Gravidade — BarChart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Defeitos por Gravidade</h2>
              {defPorGravidade.length === 0 ? (
                <p className="text-slate-400 text-sm py-8 text-center">Nenhum defeito registrado no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={defPorGravidade}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 60, bottom: 0 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={55} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                      formatter={(v: number) => [v, 'Defeitos']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {defPorGravidade.map((entry) => (
                        <Cell key={entry.gravidade} fill={GRAVIDADE_COLOR[entry.gravidade] ?? '#94A3B8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tabela */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">
                Execuções Detalhadas
                {data && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({data.execucoes.length} registros)
                  </span>
                )}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => downloadCom('csv')} className="gap-1.5 text-xs">
                <Download size={12} />
                Exportar CSV
              </Button>
            </div>
            <TabelaExecucoes execucoes={data?.execucoes ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
