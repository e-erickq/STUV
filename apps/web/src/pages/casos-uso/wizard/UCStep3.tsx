import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { UCFormData } from './types';

interface Props {
  form: UCFormData;
  setForm: (u: (p: UCFormData) => UCFormData) => void;
  errors: Record<string, string>;
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap min-h-[36px]">
        {value || <span className="text-slate-300 italic">Não preenchido</span>}
      </p>
    </div>
  );
}

export function UCStep3({ form, setForm }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="uc-alt">Fluxos Alternativos / Exceções</Label>
        <Textarea
          id="uc-alt"
          rows={8}
          value={form.fluxosAlternativos}
          onChange={(e) => setForm((p) => ({ ...p, fluxosAlternativos: e.target.value }))}
          placeholder="FA1 — Credenciais inválidas:&#10;1. Sistema exibe mensagem de erro.&#10;&#10;FA2 — Usuário sem conta:&#10;1. Sistema redireciona para cadastro."
          className="font-mono text-sm"
        />
        <p className="text-xs text-slate-400">Campo opcional. Descreva desvios do fluxo principal.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Revisão</h3>
        <ReviewField label="Nome" value={form.nome} />
        <ReviewField label="Atores" value={form.atores} />
        <ReviewField label="Descrição" value={form.descricao} />
        <ReviewField label="Fluxo Principal" value={form.fluxoPrincipal} />
        <ReviewField label="Fluxos Alternativos" value={form.fluxosAlternativos} />
      </div>
    </div>
  );
}
