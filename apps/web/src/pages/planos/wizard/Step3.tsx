import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { WizardFormData } from './types';

interface Props {
  form: WizardFormData;
  setForm: (u: (p: WizardFormData) => WizardFormData) => void;
  errors: Record<string, string>;
}

export function Step3({ form, setForm, errors }: Props) {
  const set = (field: keyof WizardFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const addMotivador = () => setForm((p) => ({ ...p, motivadores: [...p.motivadores, ''] }));
  const removeMotivador = (i: number) =>
    setForm((p) => ({ ...p, motivadores: p.motivadores.filter((_, idx) => idx !== i) }));
  const updateMotivador = (i: number, val: string) =>
    setForm((p) => ({ ...p, motivadores: p.motivadores.map((m, idx) => (idx === i ? val : m)) }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="missaoAvaliacao">Missão de Avaliação *</Label>
        <Textarea
          id="missaoAvaliacao"
          rows={6}
          value={form.missaoAvaliacao}
          onChange={set('missaoAvaliacao')}
          placeholder="Descreva a missão de avaliação deste plano de testes..."
        />
        {errors.missaoAvaliacao && <p className="text-xs text-red-600">{errors.missaoAvaliacao}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Motivadores</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMotivador}>
            + Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {form.motivadores.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={m}
                onChange={(e) => updateMotivador(i, e.target.value)}
                placeholder={`Motivador ${i + 1}`}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMotivador(i)}
                className="text-red-500 h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          ))}
          {form.motivadores.length === 0 && (
            <p className="text-sm text-slate-400">Nenhum motivador adicionado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
