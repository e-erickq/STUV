import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { HistoricoRow, WizardFormData } from './types';

interface Props {
  form: WizardFormData;
  setForm: (u: (p: WizardFormData) => WizardFormData) => void;
  errors: Record<string, string>;
}

const emptyHistorico = (): HistoricoRow => ({ versao: '', data: '', autor: '', descricao: '' });

export function Step2({ form, setForm, errors }: Props) {
  const set = (field: keyof WizardFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const addRow = () => setForm((p) => ({ ...p, historico: [...p.historico, emptyHistorico()] }));
  const removeRow = (i: number) => setForm((p) => ({ ...p, historico: p.historico.filter((_, idx) => idx !== i) }));
  const updateRow = (i: number, field: keyof HistoricoRow, value: string) =>
    setForm((p) => ({
      ...p,
      historico: p.historico.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="finalidade">Finalidade *</Label>
        <Textarea
          id="finalidade"
          rows={4}
          value={form.finalidade}
          onChange={set('finalidade')}
          placeholder="Descreva a finalidade deste plano de testes..."
        />
        {errors.finalidade && <p className="text-xs text-red-600">{errors.finalidade}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="escopo">Escopo *</Label>
        <Textarea
          id="escopo"
          rows={4}
          value={form.escopo}
          onChange={set('escopo')}
          placeholder="Defina o escopo dos testes (o que será e o que não será testado)..."
        />
        {errors.escopo && <p className="text-xs text-red-600">{errors.escopo}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="objetivos">Objetivos *</Label>
        <Textarea
          id="objetivos"
          rows={4}
          value={form.objetivos}
          onChange={set('objetivos')}
          placeholder="Liste os objetivos dos testes..."
        />
        {errors.objetivos && <p className="text-xs text-red-600">{errors.objetivos}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="introducao">Introdução</Label>
        <Textarea
          id="introducao"
          rows={3}
          value={form.introducao}
          onChange={set('introducao')}
          placeholder="Texto de introdução do documento..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Histórico de Versões</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            + Adicionar
          </Button>
        </div>
        {form.historico.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Versão', 'Data', 'Autor', 'Descrição', ''].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.historico.map((row, i) => (
                  <tr key={i} className="border-t">
                    {(['versao', 'data', 'autor', 'descricao'] as const).map((f) => (
                      <td key={f} className="px-2 py-1">
                        <Input
                          value={row[f]}
                          onChange={(e) => updateRow(i, f, e.target.value)}
                          className="h-8 text-sm"
                          type={f === 'data' ? 'date' : 'text'}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(i)} className="h-8 w-8 p-0 text-red-500">
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
