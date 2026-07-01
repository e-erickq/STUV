import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EstadoDefeito, GravidadeDefeito, StatusPlano } from '@stuv/shared';
import { useAuth } from '../contexts/AuthContext';
import { planosApi } from '../lib/api/planos';
import { relatoriosApi, RelatorioData } from '../lib/api/relatorios';
import { defeitosApi, Defeito } from '../lib/api/defeitos';

// ─── Cores do DESIGN.md ──────────────────────────────────────────────────────

const RESULTADO_COLOR: Record<string, string> = {
  PASSOU: '#15803D',
  FALHOU: '#B91C1C',
  BLOQUEADO: '#C2410C',
  PULADO: '#475569',
  EM_EXECUCAO: '#1D4ED8',
  NAO_EXECUTADO: '#94A3B8',
};

const RESULTADO_CLS: Record<string, string> = {
  PASSOU: 'bg-green-50 text-green-700',
  FALHOU: 'bg-red-50 text-red-700',
  BLOQUEADO: 'bg-orange-50 text-orange-700',
  PULADO: 'bg-slate-100 text-slate-600',
  EM_EXECUCAO: 'bg-blue-50 text-blue-700',
  NAO_EXECUTADO: 'bg-slate-50 text-slate-400',
};

const GRAVIDADE_CFG: Partial<Record<GravidadeDefeito, { label: string; cls: string }>> = {
  CRITICA: { label: 'Crítica', cls: 'bg-red-100 text-red-900 border-red-300' },
  ALTA: { label: 'Alta', cls: 'bg-red-50 text-red-700 border-red-200' },
};

// ─── Componentes locais ───────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <span className="text-slate-300">{icon}</span>
      </div>
      <p className={`mt-2 text-3xl font-bold font-display ${accent ?? 'text-slate-800'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth();

  const { data: relatorio } = useQuery<RelatorioData>({
    queryKey: ['relatorios', { periodo: '30d' }],
    queryFn: () => relatoriosApi.get({ periodo: '30d' }),
  });

  const { data: planos = [] } = useQuery({
    queryKey: ['planos'],
    queryFn: () => planosApi.list(),
  });

  const { data: defeitos = [] } = useQuery<Defeito[]>({
    queryKey: ['defeitos'],
    queryFn: () => defeitosApi.list(),
  });

  const planosAtivos = planos.filter(
    (p) => p.status === StatusPlano.ATIVO || p.status === StatusPlano.EM_EXECUCAO,
  ).length;

  const hoje = new Date().toDateString();
  const execucoesHoje = (relatorio?.execucoes ?? []).filter(
    (e) => new Date(e.dataExecucao).toDateString() === hoje,
  ).length;

  const recentesTop5 = [...(relatorio?.execucoes ?? [])]
    .sort((a, b) => new Date(b.dataExecucao).getTime() - new Date(a.dataExecucao).getTime())
    .slice(0, 5);

  const defeitosCriticos = defeitos
    .filter(
      (d) =>
        (d.gravidade === GravidadeDefeito.CRITICA || d.gravidade === GravidadeDefeito.ALTA) &&
        (d.estado === EstadoDefeito.ABERTO || d.estado === EstadoDefeito.EM_ANALISE),
    )
    .slice(0, 5);

  const execPorResultado = relatorio?.execucoesPorResultado ?? [];
  const resumo = relatorio?.resumo;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Bem-vindo, <span className="font-medium text-slate-700">{user?.nome}</span> · últimos 30 dias
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Planos Ativos"
          value={planosAtivos}
          sub={`${planos.length} plano${planos.length !== 1 ? 's' : ''} total`}
          icon={<LayoutDashboard size={16} />}
        />
        <SummaryCard
          label="Execuções Hoje"
          value={execucoesHoje}
          sub={`${resumo?.totalExecucoes ?? 0} nos últimos 30 dias`}
          icon={<Activity size={16} />}
        />
        <SummaryCard
          label="Defeitos Abertos"
          value={resumo?.defeitosAbertos ?? 0}
          sub="aguardando resolução"
          accent={(resumo?.defeitosAbertos ?? 0) > 0 ? 'text-red-700' : 'text-green-700'}
          icon={<AlertTriangle size={16} />}
        />
        <SummaryCard
          label="Pass Rate"
          value={`${resumo?.passRate ?? 0}%`}
          sub="execuções aprovadas"
          accent={
            (resumo?.passRate ?? 0) >= 70
              ? 'text-green-700'
              : (resumo?.passRate ?? 0) >= 40
                ? 'text-amber-700'
                : 'text-red-700'
          }
          icon={<CheckCircle2 size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de barras */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Execuções por Resultado — últimos 30 dias
          </h2>
          {execPorResultado.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">Sem execuções no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
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

        {/* Defeitos críticos/altos abertos */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Defeitos Críticos / Altos</h2>
            <Link to="/defeitos" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {defeitosCriticos.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">
              Nenhum defeito crítico ou alto aberto.
            </p>
          ) : (
            <ul className="space-y-2">
              {defeitosCriticos.map((d) => {
                const gcfg = GRAVIDADE_CFG[d.gravidade];
                return (
                  <li
                    key={d.id}
                    className="flex items-start gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50 transition-colors"
                  >
                    {gcfg && (
                      <span
                        className={`mt-0.5 inline-flex shrink-0 rounded-full border px-1.5 py-0.5 text-xs font-medium ${gcfg.cls}`}
                      >
                        {gcfg.label}
                      </span>
                    )}
                    <span className="truncate text-sm text-slate-700">{d.titulo}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Execuções recentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Execuções Recentes</h2>
          <Link to="/execucoes" className="text-xs text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Caso de Teste</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Resultado</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Executor</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentesTop5.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-slate-400 text-sm">
                    Nenhuma execução nos últimos 30 dias.
                  </td>
                </tr>
              ) : (
                recentesTop5.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 text-slate-700 font-medium text-xs max-w-[180px] truncate">
                      {e.casoTeste.nome}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${RESULTADO_CLS[e.resultado] ?? 'bg-slate-100 text-slate-500'}`}
                      >
                        {e.resultadoLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                      {e.executor.nome}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
