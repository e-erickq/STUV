import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { WizardFormData } from './types';

interface Props {
  form: WizardFormData;
  setForm: (u: (p: WizardFormData) => WizardFormData) => void;
  errors: Record<string, string>;
}

export function Step1({ form, setForm, errors }: Props) {
  const set = (field: keyof WizardFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="nomeProjeto">Nome do Projeto *</Label>
          <Input
            id="nomeProjeto"
            value={form.nomeProjeto}
            onChange={set('nomeProjeto')}
            placeholder="Ex: Sistema de Gestão de Pedidos"
          />
          {errors.nomeProjeto && <p className="text-xs text-red-600">{errors.nomeProjeto}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="siglaProjeto">Sigla *</Label>
          <Input
            id="siglaProjeto"
            value={form.siglaProjeto}
            onChange={set('siglaProjeto')}
            placeholder="Ex: SGP"
          />
          {errors.siglaProjeto && <p className="text-xs text-red-600">{errors.siglaProjeto}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="elaboradoPor">Elaborado por</Label>
          <Input
            id="elaboradoPor"
            value={form.elaboradoPor}
            onChange={set('elaboradoPor')}
            placeholder="Nome do responsável"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="nomeRequisitante">Requisitante</Label>
          <Input
            id="nomeRequisitante"
            value={form.nomeRequisitante}
            onChange={set('nomeRequisitante')}
            placeholder="Nome do requisitante"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="gerenteProjeto">Gerente do Projeto</Label>
          <Input
            id="gerenteProjeto"
            value={form.gerenteProjeto}
            onChange={set('gerenteProjeto')}
            placeholder="Nome do gerente"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dataInicio">Data de Início *</Label>
          <Input
            id="dataInicio"
            type="date"
            value={form.dataInicio}
            onChange={set('dataInicio')}
          />
          {errors.dataInicio && <p className="text-xs text-red-600">{errors.dataInicio}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="dataTermino">Data de Término *</Label>
          <Input
            id="dataTermino"
            type="date"
            value={form.dataTermino}
            onChange={set('dataTermino')}
          />
          {errors.dataTermino && <p className="text-xs text-red-600">{errors.dataTermino}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="versaoDocumento">Versão do Documento</Label>
          <Input
            id="versaoDocumento"
            value={form.versaoDocumento}
            onChange={set('versaoDocumento')}
            placeholder="1.0"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dataDocumento">Data do Documento</Label>
          <Input
            id="dataDocumento"
            type="date"
            value={form.dataDocumento}
            onChange={set('dataDocumento')}
          />
        </div>

        <div className="col-span-2 space-y-1">
          <Label htmlFor="cenarioOperacional">Cenário Operacional</Label>
          <Textarea
            id="cenarioOperacional"
            rows={4}
            value={form.cenarioOperacional}
            onChange={set('cenarioOperacional')}
            placeholder="Descreva o cenário operacional do projeto..."
          />
        </div>
      </div>
    </div>
  );
}
