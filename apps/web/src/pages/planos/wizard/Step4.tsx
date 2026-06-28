import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { WizardFormData } from './types';

interface Props {
  form: WizardFormData;
  setForm: (u: (p: WizardFormData) => WizardFormData) => void;
  errors: Record<string, string>;
}

export function Step4({ form, setForm, errors }: Props) {
  const set = (field: keyof WizardFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="restricoes">Restrições *</Label>
        <Textarea
          id="restricoes"
          rows={5}
          value={form.restricoes}
          onChange={set('restricoes')}
          placeholder="Liste as restrições que impactam os testes (prazo, recursos, acesso, etc.)..."
        />
        {errors.restricoes && <p className="text-xs text-red-600">{errors.restricoes}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="premissas">Premissas *</Label>
        <Textarea
          id="premissas"
          rows={5}
          value={form.premissas}
          onChange={set('premissas')}
          placeholder="Liste as premissas assumidas para a execução dos testes..."
        />
        {errors.premissas && <p className="text-xs text-red-600">{errors.premissas}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="dependencias">Dependências</Label>
        <Textarea
          id="dependencias"
          rows={4}
          value={form.dependencias}
          onChange={set('dependencias')}
          placeholder="Descreva as dependências externas (outros sistemas, equipes, ambientes)..."
        />
      </div>
    </div>
  );
}
