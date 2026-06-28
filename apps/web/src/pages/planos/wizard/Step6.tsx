import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { InfraRow, WizardFormData } from './types';

interface Props {
  form: WizardFormData;
  setForm: (u: (p: WizardFormData) => WizardFormData) => void;
  errors: Record<string, string>;
}

const emptyRow = (): InfraRow => ({ item: '', descricao: '' });

type InfraField = 'infraHardware' | 'infraSoftware';

function InfraTable({
  label,
  rows,
  onAdd,
  onRemove,
  onUpdate,
}: {
  label: string;
  rows: InfraRow[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, f: keyof InfraRow, v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          + Adicionar
        </Button>
      </div>
      {rows.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Item</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Descrição</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">
                    <Input value={row.item} onChange={(e) => onUpdate(i, 'item', e.target.value)} className="h-8 text-sm" />
                  </td>
                  <td className="px-2 py-1">
                    <Input value={row.descricao} onChange={(e) => onUpdate(i, 'descricao', e.target.value)} className="h-8 text-sm" />
                  </td>
                  <td className="px-2 py-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(i)} className="h-8 w-8 p-0 text-red-500">×</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Nenhum item adicionado.</p>
      )}
    </div>
  );
}

export function Step6({ form, setForm }: Props) {
  const makeHandlers = (field: InfraField) => ({
    onAdd: () => setForm((p) => ({ ...p, [field]: [...p[field], emptyRow()] })),
    onRemove: (i: number) => setForm((p) => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) })),
    onUpdate: (i: number, f: keyof InfraRow, v: string) =>
      setForm((p) => ({ ...p, [field]: p[field].map((r, idx) => (idx === i ? { ...r, [f]: v } : r)) })),
  });

  return (
    <div className="space-y-8">
      <InfraTable label="Infraestrutura de Hardware" rows={form.infraHardware} {...makeHandlers('infraHardware')} />
      <InfraTable label="Infraestrutura de Software" rows={form.infraSoftware} {...makeHandlers('infraSoftware')} />
    </div>
  );
}
