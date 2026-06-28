import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MinusCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { EstadoDefeito, GravidadeDefeito, PerfilUsuario } from '@stuv/shared';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { Defeito, defeitosApi } from '../../lib/api/defeitos';

// ─── Configs de display ───────────────────────────────────────────────────────

const GRAVIDADE_CONFIG: Record<GravidadeDefeito, { label: string; cls: string; dot: string }> = {
  CRITICA: { label: 'Crítica', cls: 'bg-red-100 text-red-900 border-red-300', dot: 'bg-red-900' },
  ALTA:    { label: 'Alta',    cls: 'bg-red-50 text-red-700 border-red-200',  dot: 'bg-red-700' },
  MEDIA:   { label: 'Média',   cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-700' },
  BAIXA:   { label: 'Baixa',   cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-700' },
};

const ESTADO_CONFIG: Record<EstadoDefeito, { label: string; cls: string; Icon: React.ElementType }> = {
  ABERTO:      { label: 'Aberto',      cls: 'bg-red-50 text-red-700 border-red-200',         Icon: AlertCircle },
  EM_ANALISE:  { label: 'Em Análise',  cls: 'bg-amber-50 text-amber-700 border-amber-200',    Icon: Clock },
  EM_CORRECAO: { label: 'Em Correção', cls: 'bg-blue-50 text-blue-700 border-blue-200',       Icon: RotateCcw },
  RETESTADO:   { label: 'Retestado',   cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', Icon: CheckCircle2 },
  FECHADO:     { label: 'Fechado',     cls: 'bg-green-50 text-green-700 border-green-200',    Icon: CheckCircle2 },
  REJEITADO:   { label: 'Rejeitado',   cls: 'bg-slate-100 text-slate-500 border-slate-200',   Icon: XCircle },
};

// Máquina de estados (espelha o backend — só para UI)
const TRANSICOES: Partial<Record<EstadoDefeito, EstadoDefeito[]>> = {
  ABERTO:      [EstadoDefeito.EM_ANALISE],
  EM_ANALISE:  [EstadoDefeito.EM_CORRECAO, EstadoDefeito.REJEITADO],
  EM_CORRECAO: [EstadoDefeito.RETESTADO],
  RETESTADO:   [EstadoDefeito.FECHADO],
};

// Ordem visual do fluxo para representação da máquina
const FLUXO_ESTADOS: EstadoDefeito[] = [
  EstadoDefeito.ABERTO,
  EstadoDefeito.EM_ANALISE,
  EstadoDefeito.EM_CORRECAO,
  EstadoDefeito.RETESTADO,
  EstadoDefeito.FECHADO,
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function GravidadeBadge({ g }: { g: GravidadeDefeito }) {
  const cfg = GRAVIDADE_CONFIG[g];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function EstadoBadge({ e }: { e: EstadoDefeito }) {
  const cfg = ESTADO_CONFIG[e];
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/** Trilha visual da máquina de estados — destaca o estado atual e mostra o fluxo. */
function EstadoMaquina({ estado }: { estado: EstadoDefeito }) {
  const isTerminal = estado === EstadoDefeito.FECHADO || estado === EstadoDefeito.REJEITADO;
  const currentIdx = FLUXO_ESTADOS.indexOf(estado);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FLUXO_ESTADOS.map((e, i) => {
        const cfg = ESTADO_CONFIG[e];
        const { Icon } = cfg;
        const isCurrent = e === estado;
        const isPast = !isTerminal && i < currentIdx;
        const isFuture = i > currentIdx;

        return (
          <div key={e} className="flex items-center gap-1">
            <div
              className={`
                flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all
                ${isCurrent ? `${cfg.cls} font-semibold ring-2 ring-offset-1 ring-current/30` : ''}
                ${isPast ? 'border-green-200 bg-green-50 text-green-600 opacity-70' : ''}
                ${isFuture ? 'border-slate-200 bg-slate-50 text-slate-300' : ''}
              `}
            >
              {isPast ? (
                <CheckCircle2 size={10} className="text-green-500" />
              ) : (
                <Icon size={10} />
              )}
              <span className="hidden sm:inline">{cfg.label}</span>
            </div>
            {i < FLUXO_ESTADOS.length - 1 && (
              <ArrowRight size={10} className={`text-slate-300 ${isFuture ? 'opacity-30' : ''}`} />
            )}
          </div>
        );
      })}
      {estado === EstadoDefeito.REJEITADO && (
        <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${ESTADO_CONFIG.REJEITADO.cls} ring-2 ring-offset-1 ring-current/30`}>
          <XCircle size={10} />
          <span className="hidden sm:inline">Rejeitado</span>
        </div>
      )}
    </div>
  );
}

/** Botões de transição de estado — apenas mostra as saídas válidas. */
function TransicaoBotoes({ defeito, canTransition }: { defeito: Defeito; canTransition: boolean }) {
  const qc = useQueryClient();
  const proximos = TRANSICOES[defeito.estado] ?? [];

  const mutation = useMutation({
    mutationFn: (estado: EstadoDefeito) => defeitosApi.updateEstado(defeito.id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['defeitos'] });
    },
  });

  if (!canTransition || proximos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {proximos.map((e) => {
        const cfg = ESTADO_CONFIG[e];
        return (
          <button
            key={e}
            onClick={() => mutation.mutate(e)}
            disabled={mutation.isPending}
            className={`
              inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium
              transition-all hover:opacity-80 active:scale-95 disabled:opacity-50
              ${cfg.cls}
            `}
          >
            <ArrowRight size={10} />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Defeito card ─────────────────────────────────────────────────────────────

function DefeitoCard({ defeito, canTransition }: { defeito: Defeito; canTransition: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <GravidadeBadge g={defeito.gravidade} />
              <span className="text-xs text-slate-400">
                {new Date(defeito.criadoEm).toLocaleDateString('pt-BR')}
              </span>
              <span className="text-xs text-slate-400">por {defeito.autor.nome}</span>
            </div>
            <h3 className="font-semibold text-slate-800 text-sm leading-snug">{defeito.titulo}</h3>
          </div>
        </div>

        {/* Máquina de estados visual */}
        <div className="mt-3">
          <EstadoMaquina estado={defeito.estado} />
        </div>

        {/* Transições disponíveis */}
        <TransicaoBotoes defeito={defeito} canTransition={canTransition} />

        {/* Toggle detalhes */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expanded ? '▲ Ocultar detalhes' : '▼ Ver detalhes'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Descrição</p>
            <p className="text-sm text-slate-700">{defeito.descricao}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Passos para Reprodução</p>
            <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap bg-white rounded border border-slate-200 p-3 leading-relaxed">
              {defeito.passosReproducao}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

const GRAVIDADE_OPTS = [
  { value: '', label: 'Todas as gravidades' },
  { value: GravidadeDefeito.CRITICA, label: 'Crítica' },
  { value: GravidadeDefeito.ALTA,    label: 'Alta' },
  { value: GravidadeDefeito.MEDIA,   label: 'Média' },
  { value: GravidadeDefeito.BAIXA,   label: 'Baixa' },
];

const ESTADO_OPTS = [
  { value: '', label: 'Todos os estados' },
  { value: EstadoDefeito.ABERTO,      label: 'Aberto' },
  { value: EstadoDefeito.EM_ANALISE,  label: 'Em Análise' },
  { value: EstadoDefeito.EM_CORRECAO, label: 'Em Correção' },
  { value: EstadoDefeito.RETESTADO,   label: 'Retestado' },
  { value: EstadoDefeito.FECHADO,     label: 'Fechado' },
  { value: EstadoDefeito.REJEITADO,   label: 'Rejeitado' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DefeitosPage() {
  const { user } = useAuth();
  const [gravidade, setGravidade] = useState('');
  const [estado, setEstado] = useState('');

  const canTransition =
    user?.perfil === PerfilUsuario.ADMINISTRADOR ||
    user?.perfil === PerfilUsuario.GERENTE ||
    user?.perfil === PerfilUsuario.TESTADOR;

  const { data: defeitos = [], isLoading } = useQuery<Defeito[]>({
    queryKey: ['defeitos', gravidade, estado],
    queryFn: () =>
      defeitosApi.list({
        gravidade: (gravidade as GravidadeDefeito) || undefined,
        estado: (estado as EstadoDefeito) || undefined,
      }),
  });

  // Agrupa por estado para display organizado
  const grupos: Partial<Record<EstadoDefeito, Defeito[]>> = {};
  for (const d of defeitos) {
    if (!grupos[d.estado]) grupos[d.estado] = [];
    grupos[d.estado]!.push(d);
  }

  const ORDEM_GRUPOS: EstadoDefeito[] = [
    EstadoDefeito.ABERTO,
    EstadoDefeito.EM_ANALISE,
    EstadoDefeito.EM_CORRECAO,
    EstadoDefeito.RETESTADO,
    EstadoDefeito.FECHADO,
    EstadoDefeito.REJEITADO,
  ];

  const countAtivos = defeitos.filter(
    (d) => d.estado !== EstadoDefeito.FECHADO && d.estado !== EstadoDefeito.REJEITADO,
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Defeitos</h1>
          {defeitos.length > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">
              {countAtivos} ativo{countAtivos !== 1 ? 's' : ''} · {defeitos.length} total
            </p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={gravidade} onValueChange={setGravidade}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Gravidade" />
          </SelectTrigger>
          <SelectContent>
            {GRAVIDADE_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADO_OPTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(gravidade || estado) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setGravidade(''); setEstado(''); }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando defeitos...
        </div>
      ) : defeitos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <MinusCircle size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Nenhum defeito encontrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ORDEM_GRUPOS.map((e) => {
            const itens = grupos[e];
            if (!itens?.length) return null;
            return (
              <section key={e}>
                <div className="flex items-center gap-2 mb-3">
                  <EstadoBadge e={e} />
                  <span className="text-xs text-slate-400 font-medium">{itens.length}</span>
                </div>
                <div className="space-y-3">
                  {itens.map((d) => (
                    <DefeitoCard key={d.id} defeito={d} canTransition={canTransition} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
