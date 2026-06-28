import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { UCFormData } from './types';

interface Props {
  form: UCFormData;
  setForm: (u: (p: UCFormData) => UCFormData) => void;
  errors: Record<string, string>;
}

export function UCStep2({ form, setForm, errors }: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
        <strong>Dica:</strong> Descreva o fluxo passo a passo, numerando cada ação do ator e a resposta do sistema.
        <br />Ex: 1. Usuário informa e-mail e senha. 2. Sistema valida credenciais. 3. Sistema exibe tela principal.
      </div>

      <div className="space-y-1">
        <Label htmlFor="uc-fluxoPrincipal">Fluxo Principal *</Label>
        <Textarea
          id="uc-fluxoPrincipal"
          rows={12}
          value={form.fluxoPrincipal}
          onChange={(e) => setForm((p) => ({ ...p, fluxoPrincipal: e.target.value }))}
          placeholder="1. O ator inicia a ação...&#10;2. O sistema responde...&#10;3. ..."
          className="font-mono text-sm"
        />
        {errors.fluxoPrincipal && <p className="text-xs text-red-600">{errors.fluxoPrincipal}</p>}
        <p className="text-xs text-slate-400 text-right">{form.fluxoPrincipal.length} caracteres</p>
      </div>
    </div>
  );
}
