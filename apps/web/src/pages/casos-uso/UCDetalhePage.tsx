import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, FlaskConical, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { z } from 'zod';
import { PrioridadeCasoTeste } from '@stuv/shared';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { casosUsoApi, CasoUso } from '../../lib/api/casos-uso';
import { casosTesteApi, CasoTeste, CreateCasoTesteData } from '../../lib/api/casos-teste';

// ─── Priority display helpers ─────────────────────────────────────────────────

const PRIORIDADE_CONFIG: Record<PrioridadeCasoTeste, { label: string; className: string; dot: string }> = {
  ALTA:  { label: 'Alta',  className: 'bg-red-50 text-red-700 border border-red-200',     dot: 'bg-red-500' },
  MEDIA: { label: 'Média', className: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-400' },
  BAIXA: { label: 'Baixa', className: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500' },
};

function PrioridadeBadge({ p }: { p: PrioridadeCasoTeste }) {
  const cfg = PRIORIDADE_CONFIG[p];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── CT form schema ───────────────────────────────────────────────────────────

const ctSchema = z.object({
  nome: z.string().min(3, 'Nome é obrigatório (mín. 3 caracteres).'),
  preCondicoes: z.string().optional(),
  passos: z.string().min(5, 'Descreva os passos (mín. 5 caracteres).'),
  resultadoEsperado: z.string().min(3, 'Resultado esperado é obrigatório.'),
  prioridade: z.nativeEnum(PrioridadeCasoTeste),
});

type CTForm = z.infer<typeof ctSchema>;

// ─── CT Dialog ───────────────────────────────────────────────────────────────

function CTDialog({
  ucId,
  editing,
  open,
  onClose,
}: {
  ucId: string;
  editing: CasoTeste | null;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CTForm>({
    resolver: zodResolver(ctSchema),
    defaultValues: editing
      ? {
          nome: editing.nome,
          preCondicoes: editing.preCondicoes ?? '',
          passos: editing.passos,
          resultadoEsperado: editing.resultadoEsperado,
          prioridade: editing.prioridade,
        }
      : { nome: '', preCondicoes: '', passos: '', resultadoEsperado: '', prioridade: PrioridadeCasoTeste.MEDIA },
  });

  const mutation = useMutation({
    mutationFn: (data: CTForm) => {
      const payload: CreateCasoTesteData = {
        nome: data.nome,
        preCondicoes: data.preCondicoes || undefined,
        passos: data.passos,
        resultadoEsperado: data.resultadoEsperado,
        prioridade: data.prioridade,
      };
      return editing
        ? casosTesteApi.update(editing.id, payload)
        : casosTesteApi.create(ucId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['casos-teste', ucId] });
      reset();
      onClose();
    },
  });

  const prioridade = watch('prioridade');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Caso de Teste' : 'Novo Caso de Teste'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="ct-nome">Nome *</Label>
            <Input id="ct-nome" {...register('nome')} placeholder="Ex: CT01 — Login com credenciais válidas" />
            {errors.nome && <p className="text-xs text-red-600">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="ct-pre">Pré-condições</Label>
            <Textarea id="ct-pre" rows={2} {...register('preCondicoes')} placeholder="Usuário cadastrado, sistema disponível..." />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ct-passos">Passos *</Label>
            <Textarea
              id="ct-passos"
              rows={5}
              {...register('passos')}
              placeholder="1. Acessar /login&#10;2. Preencher e-mail e senha&#10;3. Clicar em Entrar"
              className="font-mono text-sm"
            />
            {errors.passos && <p className="text-xs text-red-600">{errors.passos.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="ct-resultado">Resultado Esperado *</Label>
            <Textarea id="ct-resultado" rows={3} {...register('resultadoEsperado')} placeholder="Sistema exibe dashboard do usuário..." />
            {errors.resultadoEsperado && <p className="text-xs text-red-600">{errors.resultadoEsperado.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Prioridade</Label>
            <Select value={prioridade} onValueChange={(v) => setValue('prioridade', v as PrioridadeCasoTeste)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORIDADE_CONFIG).map(([k, cfg]) => (
                  <SelectItem key={k} value={k}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">Erro ao salvar caso de teste.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── UC Detalhe Page ──────────────────────────────────────────────────────────

export function UCDetalhePage() {
  const { planoId = '', ucId = '' } = useParams<{ planoId: string; ucId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CasoTeste | null>(null);

  const { data: ucs = [] } = useQuery<CasoUso[]>({
    queryKey: ['casos-uso', planoId],
    queryFn: () => casosUsoApi.listByPlano(planoId),
    enabled: !!planoId,
  });
  const uc = ucs.find((u) => u.id === ucId);

  const { data: cts = [], isLoading } = useQuery<CasoTeste[]>({
    queryKey: ['casos-teste', ucId],
    queryFn: () => casosTesteApi.listByUc(ucId),
    enabled: !!ucId,
  });

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (ct: CasoTeste) => { setEditing(ct); setDialogOpen(true); };

  const priorityCounts = {
    ALTA: cts.filter((c) => c.prioridade === 'ALTA').length,
    MEDIA: cts.filter((c) => c.prioridade === 'MEDIA').length,
    BAIXA: cts.filter((c) => c.prioridade === 'BAIXA').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/planos" className="hover:text-primary">Planos de Teste</Link>
        <span>/</span>
        <Link to={`/planos/${planoId}`} className="hover:text-primary flex items-center gap-1">
          <ArrowLeft size={12} />
          Casos de Uso
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{uc?.nome ?? 'Caso de Uso'}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">{uc?.nome ?? '—'}</h1>
          {uc?.atores && (
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-medium text-slate-600">Atores:</span> {uc.atores}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/planos/${planoId}/casos-uso/${ucId}/editar`}>
              <Edit size={14} className="mr-1.5" />
              Editar UC
            </Link>
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} className="mr-1.5" />
            Novo CT
          </Button>
        </div>
      </div>

      {/* UC info */}
      {(uc?.descricao || uc?.fluxoPrincipal) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {uc.descricao && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Descrição</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{uc.descricao}</p>
            </div>
          )}
          {uc.fluxoPrincipal && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Fluxo Principal</p>
              <p className="text-sm text-slate-700 font-mono whitespace-pre-wrap line-clamp-6">{uc.fluxoPrincipal}</p>
            </div>
          )}
        </div>
      )}

      {/* CT Stats */}
      <div className="flex gap-3">
        {([['ALTA', 'text-red-700 bg-red-50 border-red-200'], ['MEDIA', 'text-amber-700 bg-amber-50 border-amber-200'], ['BAIXA', 'text-green-700 bg-green-50 border-green-200']] as const).map(([p, cls]) => (
          <div key={p} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${cls}`}>
            <span className="text-lg font-bold font-display">{priorityCounts[p as PrioridadeCasoTeste]}</span>
            <span className="text-xs">{PRIORIDADE_CONFIG[p as PrioridadeCasoTeste].label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <FlaskConical size={14} />
          <span className="font-bold font-display">{cts.length}</span>
          <span className="text-xs">Total</span>
        </div>
      </div>

      {/* CT table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-700">Casos de Teste</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            Carregando...
          </div>
        ) : cts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FlaskConical size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum caso de teste cadastrado.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
              Criar primeiro caso de teste
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left font-medium text-slate-500">Nome</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Prioridade</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Resultado Esperado</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Execuções</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cts.map((ct) => (
                <tr key={ct.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      to={`/planos/${planoId}/casos-uso/${ucId}/casos-teste/${ct.id}`}
                      className="font-medium text-slate-800 hover:text-primary transition-colors"
                    >
                      {ct.nome}
                    </Link>
                    {ct.preCondicoes && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        Pré: {ct.preCondicoes}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <PrioridadeBadge p={ct.prioridade} />
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs">
                    <p className="line-clamp-2 text-xs">{ct.resultadoEsperado}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {ct._count?.execucoes ?? 0}
                  </td>
                  <td className="px-5 py-3">
                    <Button variant="outline" size="sm" onClick={() => openEdit(ct)}>
                      <Edit size={12} className="mr-1" />
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CTDialog ucId={ucId} editing={editing} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
