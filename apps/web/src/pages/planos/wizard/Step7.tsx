import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { ConflitosRow, MembroEquipe, RelatorioRow, WizardFormData } from './types';

interface Props {
  form: WizardFormData;
  setForm: (u: (p: WizardFormData) => WizardFormData) => void;
  errors: Record<string, string>;
}

export function Step7({ form, setForm, errors }: Props) {
  const set = (field: keyof WizardFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  // Equipe
  const addMembro = () =>
    setForm((p) => ({ ...p, equipe: [...p.equipe, { nome: '', papel: '', responsabilidades: '' }] }));
  const removeMembro = (i: number) => setForm((p) => ({ ...p, equipe: p.equipe.filter((_, idx) => idx !== i) }));
  const updateMembro = (i: number, f: keyof MembroEquipe, v: string) =>
    setForm((p) => ({ ...p, equipe: p.equipe.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)) }));

  // Conflitos
  const addConflito = () =>
    setForm((p) => ({ ...p, conflitos: [...p.conflitos, { periodo: '', descricao: '', impacto: '' }] }));
  const removeConflito = (i: number) =>
    setForm((p) => ({ ...p, conflitos: p.conflitos.filter((_, idx) => idx !== i) }));
  const updateConflito = (i: number, f: keyof ConflitosRow, v: string) =>
    setForm((p) => ({ ...p, conflitos: p.conflitos.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)) }));

  // Relatórios
  const addRelatorio = () =>
    setForm((p) => ({ ...p, relatorios: [...p.relatorios, { tipo: '', frequencia: '', destinatario: '' }] }));
  const removeRelatorio = (i: number) =>
    setForm((p) => ({ ...p, relatorios: p.relatorios.filter((_, idx) => idx !== i) }));
  const updateRelatorio = (i: number, f: keyof RelatorioRow, v: string) =>
    setForm((p) => ({ ...p, relatorios: p.relatorios.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)) }));

  return (
    <div className="space-y-8">
      {/* Equipe */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Equipe de Teste</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMembro}>+ Adicionar</Button>
        </div>
        {form.equipe.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Nome', 'Papel', 'Responsabilidades', ''].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.equipe.map((row, i) => (
                  <tr key={i} className="border-t">
                    {(['nome', 'papel', 'responsabilidades'] as const).map((f) => (
                      <td key={f} className="px-2 py-1">
                        <Input value={row[f]} onChange={(e) => updateMembro(i, f, e.target.value)} className="h-8 text-sm" />
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeMembro(i)} className="h-8 w-8 p-0 text-red-500">×</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conflitos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Conflitos de Agenda</Label>
          <Button type="button" variant="outline" size="sm" onClick={addConflito}>+ Adicionar</Button>
        </div>
        {form.conflitos.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Período', 'Descrição', 'Impacto', ''].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.conflitos.map((row, i) => (
                  <tr key={i} className="border-t">
                    {(['periodo', 'descricao', 'impacto'] as const).map((f) => (
                      <td key={f} className="px-2 py-1">
                        <Input value={row[f]} onChange={(e) => updateConflito(i, f, e.target.value)} className="h-8 text-sm" />
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeConflito(i)} className="h-8 w-8 p-0 text-red-500">×</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Relatórios */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Relatórios</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRelatorio}>+ Adicionar</Button>
        </div>
        {form.relatorios.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Tipo', 'Frequência', 'Destinatário', ''].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.relatorios.map((row, i) => (
                  <tr key={i} className="border-t">
                    {(['tipo', 'frequencia', 'destinatario'] as const).map((f) => (
                      <td key={f} className="px-2 py-1">
                        <Input value={row[f]} onChange={(e) => updateRelatorio(i, f, e.target.value)} className="h-8 text-sm" />
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRelatorio(i)} className="h-8 w-8 p-0 text-red-500">×</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Texto livre */}
      <div className="space-y-1">
        <Label htmlFor="componentesIntegracao">Componentes de Integração *</Label>
        <Textarea
          id="componentesIntegracao"
          rows={3}
          value={form.componentesIntegracao}
          onChange={set('componentesIntegracao')}
          placeholder="Descreva os componentes a serem integrados nos testes..."
        />
        {errors.componentesIntegracao && <p className="text-xs text-red-600">{errors.componentesIntegracao}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="reunioes">Reuniões *</Label>
        <Textarea
          id="reunioes"
          rows={3}
          value={form.reunioes}
          onChange={set('reunioes')}
          placeholder="Descreva as reuniões previstas durante o projeto de testes..."
        />
        {errors.reunioes && <p className="text-xs text-red-600">{errors.reunioes}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="criteriosSuspensao">Critérios de Suspensão</Label>
        <Textarea
          id="criteriosSuspensao"
          rows={3}
          value={form.criteriosSuspensao}
          onChange={set('criteriosSuspensao')}
          placeholder="Liste os critérios que levariam à suspensão dos testes..."
        />
      </div>
    </div>
  );
}
