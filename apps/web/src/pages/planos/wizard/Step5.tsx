import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { TipoTesteRow, WizardFormData } from './types';

interface Props {
  form: WizardFormData;
  setForm: (u: (p: WizardFormData) => WizardFormData) => void;
  errors: Record<string, string>;
}

const emptyTipo = (): TipoTesteRow => ({ tipo: '', objetivo: '', tecnica: '', ferramentas: '', criterios: '' });

const TIPO_COLS: { field: keyof TipoTesteRow; label: string }[] = [
  { field: 'tipo', label: 'Tipo' },
  { field: 'objetivo', label: 'Objetivo' },
  { field: 'tecnica', label: 'Técnica' },
  { field: 'ferramentas', label: 'Ferramentas' },
  { field: 'criterios', label: 'Critérios' },
];

export function Step5({ form, setForm, errors }: Props) {
  const set = (field: keyof WizardFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const addTipo = () => setForm((p) => ({ ...p, tiposTeste: [...p.tiposTeste, emptyTipo()] }));
  const removeTipo = (i: number) =>
    setForm((p) => ({ ...p, tiposTeste: p.tiposTeste.filter((_, idx) => idx !== i) }));
  const updateTipo = (i: number, field: keyof TipoTesteRow, value: string) =>
    setForm((p) => ({
      ...p,
      tiposTeste: p.tiposTeste.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    }));

  const addTag = (field: 'artefatosEntrada' | 'artefatosSaida', val: string) => {
    if (!val.trim()) return;
    setForm((p) => ({ ...p, [field]: [...p[field], val.trim()] }));
  };
  const removeTag = (field: 'artefatosEntrada' | 'artefatosSaida', i: number) =>
    setForm((p) => ({ ...p, [field]: (p[field] as string[]).filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="abordagemGeral">Abordagem Geral *</Label>
        <Textarea
          id="abordagemGeral"
          rows={5}
          value={form.abordagemGeral}
          onChange={set('abordagemGeral')}
          placeholder="Descreva a abordagem geral adotada para os testes..."
        />
        {errors.abordagemGeral && <p className="text-xs text-red-600">{errors.abordagemGeral}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Tipos de Teste</Label>
          <Button type="button" variant="outline" size="sm" onClick={addTipo}>
            + Adicionar
          </Button>
        </div>
        {form.tiposTeste.length > 0 && (
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50">
                <tr>
                  {TIPO_COLS.map((c) => (
                    <th key={c.field} className="px-3 py-2 text-left font-medium text-slate-600">{c.label}</th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {form.tiposTeste.map((row, i) => (
                  <tr key={i} className="border-t">
                    {TIPO_COLS.map((c) => (
                      <td key={c.field} className="px-2 py-1">
                        <Input
                          value={row[c.field]}
                          onChange={(e) => updateTipo(i, c.field, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTipo(i)} className="h-8 w-8 p-0 text-red-500">×</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(['artefatosEntrada', 'artefatosSaida'] as const).map((field) => (
        <div key={field} className="space-y-2">
          <Label>{field === 'artefatosEntrada' ? 'Artefatos de Entrada' : 'Artefatos de Saída'}</Label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite e pressione Enter"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(field, (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(form[field] as string[]).map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                {tag}
                <button type="button" onClick={() => removeTag(field, i)} className="hover:text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
