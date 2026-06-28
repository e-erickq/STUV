import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { UCFormData } from './types';

interface Props {
  form: UCFormData;
  setForm: (u: (p: UCFormData) => UCFormData) => void;
  errors: Record<string, string>;
}

export function UCStep1({ form, setForm, errors }: Props) {
  const setField = (field: keyof UCFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="uc-nome">Nome do Caso de Uso *</Label>
        <Input
          id="uc-nome"
          value={form.nome}
          onChange={setField('nome')}
          placeholder="Ex: UC01 — Login de Usuário"
        />
        {errors.nome && <p className="text-xs text-red-600">{errors.nome}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="uc-descricao">Descrição</Label>
        <Textarea
          id="uc-descricao"
          rows={3}
          value={form.descricao}
          onChange={setField('descricao')}
          placeholder="Objetivo geral deste caso de uso..."
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="uc-atores">Atores</Label>
        <Input
          id="uc-atores"
          value={form.atores}
          onChange={setField('atores')}
          placeholder="Ex: Usuário cadastrado, Sistema de autenticação"
        />
        <p className="text-xs text-slate-400">Separe múltiplos atores por vírgula.</p>
      </div>
    </div>
  );
}
