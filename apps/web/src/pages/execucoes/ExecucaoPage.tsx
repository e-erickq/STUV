import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileUp,
  MinusCircle,
  Paperclip,
  PlayCircle,
  SkipForward,
  XCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { z } from 'zod';
import { GravidadeDefeito, PerfilUsuario, ResultadoExecucao } from '@stuv/shared';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { CasoTeste, casosTesteApi } from '../../lib/api/casos-teste';
import { casosUsoApi, CasoUso } from '../../lib/api/casos-uso';
import { Defeito, defeitosApi } from '../../lib/api/defeitos';
import { Execucao, execucoesApi } from '../../lib/api/execucoes';

// ─── Status config ────────────────────────────────────────────────────────────

const RESULTADO_CONFIG: Record<
  ResultadoExecucao,
  { label: string; className: string; badgeCls: string; Icon: React.ElementType }
> = {
  NAO_EXECUTADO: {
    label: 'Não Executado',
    className: 'text-slate-400',
    badgeCls: 'bg-slate-50 text-slate-400 border-slate-200',
    Icon: MinusCircle,
  },
  EM_EXECUCAO: {
    label: 'Em Execução',
    className: 'text-blue-700',
    badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
    Icon: PlayCircle,
  },
  PASSOU: {
    label: 'Passou',
    className: 'text-green-700',
    badgeCls: 'bg-green-50 text-green-700 border-green-200',
    Icon: CheckCircle2,
  },
  FALHOU: {
    label: 'Falhou',
    className: 'text-red-700',
    badgeCls: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
  BLOQUEADO: {
    label: 'Bloqueado',
    className: 'text-orange-700',
    badgeCls: 'bg-orange-50 text-orange-700 border-orange-200',
    Icon: AlertCircle,
  },
  PULADO: {
    label: 'Pulado',
    className: 'text-slate-600',
    badgeCls: 'bg-slate-100 text-slate-600 border-slate-200',
    Icon: SkipForward,
  },
};

const RESULTADOS_COM_MOTIVO = new Set([ResultadoExecucao.FALHOU, ResultadoExecucao.BLOQUEADO]);

function ResultadoBadge({ r }: { r: ResultadoExecucao }) {
  const cfg = RESULTADO_CONFIG[r];
  const { Icon } = cfg;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badgeCls}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── Form schema ──────────────────────────────────────────────────────────────

const execSchema = z
  .object({
    resultado: z.nativeEnum(ResultadoExecucao),
    motivo: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (RESULTADOS_COM_MOTIVO.has(val.resultado) && !val.motivo?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Motivo é obrigatório quando resultado é Falhou ou Bloqueado.',
        path: ['motivo'],
      });
    }
  });

type ExecForm = z.infer<typeof execSchema>;

// ─── Gravidade config (apenas para o form de defeito) ────────────────────────

const GRAVIDADE_OPTS: { value: GravidadeDefeito; label: string }[] = [
  { value: GravidadeDefeito.CRITICA, label: 'Crítica' },
  { value: GravidadeDefeito.ALTA,    label: 'Alta' },
  { value: GravidadeDefeito.MEDIA,   label: 'Média' },
  { value: GravidadeDefeito.BAIXA,   label: 'Baixa' },
];

const defeitoSchema = z.object({
  titulo: z.string().min(5, 'Título muito curto (mín. 5 caracteres).'),
  descricao: z.string().min(10, 'Descrição muito curta (mín. 10 caracteres).'),
  gravidade: z.nativeEnum(GravidadeDefeito),
  passosReproducao: z.string().min(10, 'Descreva os passos (mín. 10 caracteres).'),
});
type DefeitoForm = z.infer<typeof defeitoSchema>;

function DefeitoDialog({
  execucaoId,
  open,
  onClose,
}: {
  execucaoId: string;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DefeitoForm>({
    resolver: zodResolver(defeitoSchema),
    defaultValues: { titulo: '', descricao: '', gravidade: GravidadeDefeito.ALTA, passosReproducao: '' },
  });
  const gravidade = watch('gravidade');

  const mutation = useMutation({
    mutationFn: (data: DefeitoForm) => defeitosApi.create(execucaoId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['execucoes-defeitos', execucaoId] });
      qc.invalidateQueries({ queryKey: ['defeitos'] });
      reset();
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Defeito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="def-titulo">Título *</Label>
            <Input id="def-titulo" {...register('titulo')} placeholder="Ex: Rate limit ausente no login" />
            {errors.titulo && <p className="text-xs text-red-600">{errors.titulo.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="def-desc">Descrição *</Label>
            <Textarea id="def-desc" rows={3} {...register('descricao')} placeholder="Descreva o defeito encontrado..." />
            {errors.descricao && <p className="text-xs text-red-600">{errors.descricao.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Gravidade *</Label>
            <Select value={gravidade} onValueChange={(v) => setValue('gravidade', v as GravidadeDefeito)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRAVIDADE_OPTS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="def-passos">Passos para Reprodução *</Label>
            <Textarea
              id="def-passos"
              rows={5}
              {...register('passosReproducao')}
              placeholder="1. Acessar /login&#10;2. Inserir credenciais&#10;3. Observar comportamento"
              className="font-mono text-sm"
            />
            {errors.passosReproducao && <p className="text-xs text-red-600">{errors.passosReproducao.message}</p>}
          </div>
          {mutation.isError && <p className="text-sm text-red-600">Erro ao registrar defeito.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Registrando...' : 'Registrar Defeito'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Execução row ─────────────────────────────────────────────────────────────

const RESULTADOS_COM_DEFEITO = new Set([ResultadoExecucao.FALHOU, ResultadoExecucao.BLOQUEADO]);

const GRAVIDADE_DOT: Record<string, string> = {
  CRITICA: 'bg-red-900',
  ALTA: 'bg-red-700',
  MEDIA: 'bg-amber-700',
  BAIXA: 'bg-green-700',
};

function ExecucaoRow({ exec, canCreateDefeito }: { exec: Execucao; canCreateDefeito: boolean }) {
  const cfg = RESULTADO_CONFIG[exec.resultado];
  const { Icon } = cfg;
  const [defeitoOpen, setDefeitoOpen] = useState(false);

  const { data: defeitos = [] } = useQuery<Defeito[]>({
    queryKey: ['execucoes-defeitos', exec.id],
    queryFn: () => defeitosApi.listByExecucao(exec.id),
    enabled: RESULTADOS_COM_DEFEITO.has(exec.resultado),
  });

  return (
    <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        <div className={`mt-0.5 ${cfg.className}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ResultadoBadge r={exec.resultado} />
            <span className="text-xs text-slate-400">
              {new Date(exec.dataExecucao).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-xs text-slate-500">por {exec.executor.nome}</span>
          </div>
          {exec.motivo && (
            <p className="mt-1.5 text-sm text-slate-600 bg-slate-50 rounded px-3 py-1.5 border-l-2 border-slate-300">
              {exec.motivo}
            </p>
          )}
          {exec.evidencias.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {exec.evidencias.map((ev) => (
                <a
                  key={ev.id}
                  href={`http://localhost:3000${ev.urlArquivo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Paperclip size={10} />
                  {ev.tipo}
                </a>
              ))}
            </div>
          )}
          {canCreateDefeito && RESULTADOS_COM_DEFEITO.has(exec.resultado) && (
            <button
              onClick={() => setDefeitoOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <AlertCircle size={12} />
              Registrar defeito
            </button>
          )}
        </div>
      </div>

      {/* Defeitos desta execução */}
      {defeitos.length > 0 && (
        <div className="border-t border-red-50 bg-red-50/40 px-4 py-3 space-y-2">
          <p className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
            <AlertCircle size={11} />
            Defeitos registrados ({defeitos.length})
          </p>
          {defeitos.map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-xs text-slate-600">
              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${GRAVIDADE_DOT[d.gravidade] ?? 'bg-slate-400'}`} />
              <span className="font-medium">{d.titulo}</span>
              <span className="text-slate-400">— {d.estado.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}

      {defeitoOpen && (
        <DefeitoDialog execucaoId={exec.id} open={defeitoOpen} onClose={() => setDefeitoOpen(false)} />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ExecucaoPage() {
  const { planoId = '', ucId = '', ctId = '' } = useParams<{
    planoId: string;
    ucId: string;
    ctId: string;
  }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [activeExecId, setActiveExecId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const canExecute = user?.perfil === PerfilUsuario.GERENTE || user?.perfil === PerfilUsuario.TESTADOR;

  // Load CT info
  const { data: ucs = [] } = useQuery<CasoUso[]>({
    queryKey: ['casos-uso', planoId],
    queryFn: () => casosUsoApi.listByPlano(planoId),
    enabled: !!planoId,
  });
  const uc = ucs.find((u) => u.id === ucId);

  const { data: cts = [] } = useQuery<CasoTeste[]>({
    queryKey: ['casos-teste', ucId],
    queryFn: () => casosTesteApi.listByUc(ucId),
    enabled: !!ucId,
  });
  const ct = cts.find((c) => c.id === ctId);

  const { data: execucoes = [], isLoading: loadingExecs } = useQuery<Execucao[]>({
    queryKey: ['execucoes', ctId],
    queryFn: () => execucoesApi.listByCt(ctId),
    enabled: !!ctId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExecForm>({
    resolver: zodResolver(execSchema),
    defaultValues: { resultado: ResultadoExecucao.PASSOU, motivo: '' },
  });

  const createMutation = useMutation({
    mutationFn: () => execucoesApi.create(ctId),
    onSuccess: (exec) => {
      qc.invalidateQueries({ queryKey: ['execucoes', ctId] });
      setActiveExecId(exec.id);
      reset({ resultado: ResultadoExecucao.PASSOU, motivo: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExecForm) =>
      execucoesApi.update(activeExecId!, {
        resultado: data.resultado,
        motivo: data.motivo || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['execucoes', ctId] });
      setActiveExecId(null);
      setUploadFile(null);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      execucoesApi.uploadEvidencia(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['execucoes', ctId] });
      setUploadFile(null);
      if (fileRef.current) fileRef.current.value = '';
    },
  });

  const resultado = watch('resultado');
  const exigeMotivo = RESULTADOS_COM_MOTIVO.has(resultado);

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <Link to="/planos" className="hover:text-slate-600 transition-colors">
          Planos
        </Link>
        <ChevronRight size={12} />
        <Link to={`/planos/${planoId}`} className="hover:text-slate-600 transition-colors">
          Casos de Uso
        </Link>
        <ChevronRight size={12} />
        <Link
          to={`/planos/${planoId}/casos-uso/${ucId}`}
          className="hover:text-slate-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={11} />
          {uc?.nome ?? 'UC'}
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium">{ct?.nome ?? 'Execução'}</span>
      </div>

      {/* CT Reference Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Caso de Teste
          </p>
          <h1 className="mt-0.5 text-lg font-bold font-display text-slate-800">
            {ct?.nome ?? '—'}
          </h1>
        </div>

        {ct && (
          <div className="grid gap-0 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-slate-400 mb-2">Passos</p>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">
                {ct.passos}
              </pre>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-medium text-slate-400 mb-2">Resultado Esperado</p>
              <p className="text-sm text-slate-700 leading-relaxed">{ct.resultadoEsperado}</p>
              {ct.preCondicoes && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-400 mb-1">Pré-condições</p>
                  <p className="text-sm text-slate-600">{ct.preCondicoes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Execution panel */}
      {canExecute && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <PlayCircle size={16} className="text-indigo-600" />
            Registrar Execução
          </h2>

          {!activeExecId ? (
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="w-full sm:w-auto"
            >
              <PlayCircle size={14} className="mr-2" />
              {createMutation.isPending ? 'Iniciando...' : 'Iniciar Execução'}
            </Button>
          ) : (
            <form
              onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label>Resultado *</Label>
                <Select
                  value={resultado}
                  onValueChange={(v) => setValue('resultado', v as ResultadoExecucao)}
                >
                  <SelectTrigger className="w-full sm:w-64 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESULTADO_CONFIG)
                      .filter(([k]) => k !== 'NAO_EXECUTADO')
                      .map(([k, cfg]) => {
                        const { Icon } = cfg;
                        return (
                          <SelectItem key={k} value={k}>
                            <span className="flex items-center gap-2">
                              <Icon size={13} className={cfg.className} />
                              {cfg.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {exigeMotivo && (
                <div className="space-y-1">
                  <Label>
                    Motivo *{' '}
                    <span className="font-normal text-slate-400 text-xs">
                      (obrigatório para Falhou/Bloqueado)
                    </span>
                  </Label>
                  <Textarea
                    rows={3}
                    {...register('motivo')}
                    placeholder="Descreva o que ocorreu durante a execução..."
                    className="bg-white"
                  />
                  {errors.motivo && (
                    <p className="text-xs text-red-600">{errors.motivo.message}</p>
                  )}
                </div>
              )}

              {/* File upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Paperclip size={12} />
                  Evidência (opcional)
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.log,.txt,.pdf,.zip,.csv"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <FileUp size={13} className="mr-1.5" />
                    Selecionar arquivo
                  </Button>
                  {uploadFile && (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {uploadFile.name}
                    </span>
                  )}
                </div>
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-red-600">Erro ao registrar resultado.</p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Salvando...' : 'Concluir Execução'}
                </Button>
                {uploadFile && activeExecId && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadMutation.isPending}
                    onClick={() => uploadMutation.mutate({ id: activeExecId, file: uploadFile })}
                  >
                    {uploadMutation.isPending ? 'Enviando...' : 'Enviar evidência'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveExecId(null);
                    setUploadFile(null);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-slate-400" />
          <h2 className="font-semibold text-slate-700">
            Histórico de Execuções{' '}
            {execucoes.length > 0 && (
              <span className="text-slate-400 font-normal text-sm">({execucoes.length})</span>
            )}
          </h2>
        </div>

        {loadingExecs ? (
          <div className="flex items-center gap-2 py-6 text-slate-400 text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Carregando histórico...
          </div>
        ) : execucoes.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">Nenhuma execução registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {execucoes.map((exec) => (
              <ExecucaoRow
                key={exec.id}
                exec={exec}
                canCreateDefeito={user?.perfil === PerfilUsuario.TESTADOR}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
