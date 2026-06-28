import { StatusPlano } from '@stuv/shared';
import { CheckCircle2, ChevronLeft, ChevronRight, Home, Loader2, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { planosApi } from '../../lib/api/planos';
import { Step1 } from './wizard/Step1';
import { Step2 } from './wizard/Step2';
import { Step3 } from './wizard/Step3';
import { Step4 } from './wizard/Step4';
import { Step5 } from './wizard/Step5';
import { Step6 } from './wizard/Step6';
import { Step7 } from './wizard/Step7';
import { WIZARD_DEFAULT, WIZARD_STEPS, WizardFormData, stepSchemas } from './wizard/types';

const SESSION_KEY = (id: string | undefined) => `stuv:wizard:${id ?? 'new'}`;

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];

export function WizardPlano() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<WizardFormData>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY(id));
    return saved ? { ...WIZARD_DEFAULT, ...JSON.parse(saved) } : WIZARD_DEFAULT;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [planoId, setPlanoId] = useState<string | undefined>(id);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Populate from API when editing an existing plan
  useEffect(() => {
    if (!id) return;
    planosApi.get(id).then((p) => {
      setCurrentStep(p.etapaWizardAtual ?? 1);
      setForm((prev) => {
        const saved = sessionStorage.getItem(SESSION_KEY(id));
        const persisted: Partial<WizardFormData> = saved ? JSON.parse(saved) : {};
        // Spread persisted first, then override only if persisted field is empty
        return {
          ...prev,
          ...persisted,
          nomeProjeto: persisted.nomeProjeto || p.nome,
          finalidade: persisted.finalidade || (p.descricao ?? ''),
        };
      });
    });
  }, [id]);

  // Sync form to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY(planoId), JSON.stringify(form));
  }, [form, planoId]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = useCallback((): boolean => {
    const schema = stepSchemas[currentStep];
    if (!schema) return true;
    const result = schema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const errs: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path[0] as string;
      errs[key] = issue.message;
    });
    setErrors(errs);
    return false;
  }, [currentStep, form]);

  const handleNext = () => {
    if (!validate()) return;
    setCurrentStep((s) => Math.min(s + 1, 7));
    setErrors({});
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    setErrors({});
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (!planoId) {
        const created = await planosApi.create({
          nome: form.nomeProjeto || 'Rascunho sem título',
          descricao: form.finalidade || undefined,
          etapaWizardAtual: currentStep,
        });
        setPlanoId(created.id);
        // Move sessionStorage to new key
        const data = sessionStorage.getItem(SESSION_KEY(undefined));
        if (data) {
          sessionStorage.setItem(SESSION_KEY(created.id), data);
          sessionStorage.removeItem(SESSION_KEY(undefined));
        }
        navigate(`/planos/${created.id}/editar`, { replace: true });
        showToast('Rascunho salvo com sucesso!');
      } else {
        await planosApi.update(planoId, {
          nome: form.nomeProjeto || 'Rascunho sem título',
          descricao: form.finalidade || undefined,
          etapaWizardAtual: currentStep,
        });
        showToast('Rascunho atualizado!');
      }
    } catch {
      showToast('Erro ao salvar rascunho.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!validate()) return;
    if (!planoId) {
      showToast('Salve o rascunho antes de finalizar.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await planosApi.update(planoId, {
        nome: form.nomeProjeto,
        descricao: form.finalidade || undefined,
        status: StatusPlano.ATIVO,
        etapaWizardAtual: 7,
      });
      sessionStorage.removeItem(SESSION_KEY(planoId));
      navigate('/planos');
    } catch {
      showToast('Erro ao finalizar plano.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const StepContent = STEP_COMPONENTS[currentStep - 1];
  const isLastStep = currentStep === 7;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold font-display">S✓</span>
          <div>
            <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Confecção de Plano de Teste</p>
            <h1 className="text-base font-semibold leading-tight">
              {WIZARD_STEPS[currentStep - 1].title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-indigo-200" aria-label={`Passo ${currentStep} de 7`}>
            Passo {currentStep} de 7
          </span>
          <button
            onClick={() => navigate('/planos')}
            className="flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white transition-colors"
          >
            <Home size={16} />
            Página Inicial
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Step sidebar */}
        <aside className="w-64 bg-slate-900 flex flex-col py-6 shrink-0">
          <nav className="flex-1 space-y-1 px-3">
            {WIZARD_STEPS.map((step) => {
              const done = step.id < currentStep;
              const active = step.id === currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors',
                    active ? 'bg-primary text-white' : done ? 'text-slate-300 hover:bg-slate-800 cursor-pointer' : 'text-slate-500 cursor-not-allowed',
                  ].join(' ')}
                >
                  <span className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    active ? 'bg-white text-primary' : done ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400',
                  ].join(' ')}>
                    {done ? <CheckCircle2 size={14} /> : step.id}
                  </span>
                  <span className="leading-tight">{step.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Progress bar */}
          <div className="px-6 pt-4 pb-2">
            <div className="h-1.5 rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 text-center">
              {Math.round(((currentStep - 1) / 6) * 100)}% concluído
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 font-display">
                  {currentStep}. {WIZARD_STEPS[currentStep - 1].title}
                </h2>
                <div className="mt-2 flex gap-1">
                  {WIZARD_STEPS.map((s) => (
                    <div
                      key={s.id}
                      className={[
                        'h-1 flex-1 rounded-full',
                        s.id < currentStep ? 'bg-green-500' : s.id === currentStep ? 'bg-primary' : 'bg-slate-200',
                      ].join(' ')}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <StepContent form={form} setForm={setForm} errors={errors} />
              </div>
            </div>
          </div>

          {/* Footer navigation */}
          <footer className="border-t border-slate-200 bg-white px-8 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSaving}
              >
                <ChevronLeft size={16} className="mr-1" />
                Recuar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Save size={16} className="mr-1" />}
                Salvar Rascunho
              </Button>

              {isLastStep ? (
                <Button type="button" onClick={handleFinish} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="mr-1 animate-spin" /> : null}
                  Concluir Plano
                </Button>
              ) : (
                <Button type="button" onClick={handleNext} disabled={isSaving}>
                  Avançar
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              )}
            </div>
          </footer>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={[
            'fixed bottom-6 right-6 rounded-lg px-4 py-3 text-sm text-white shadow-lg',
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
          ].join(' ')}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
