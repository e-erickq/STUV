import { CheckCircle2, ChevronLeft, ChevronRight, Home, Loader2, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { casosUsoApi } from '../../lib/api/casos-uso';
import { UCStep1 } from './wizard/UCStep1';
import { UCStep2 } from './wizard/UCStep2';
import { UCStep3 } from './wizard/UCStep3';
import { UC_DEFAULT, UC_STEPS, UCFormData, ucStepSchemas } from './wizard/types';

const SESSION_KEY = (planoId: string, ucId: string | undefined) =>
  `stuv:uc-wizard:${planoId}:${ucId ?? 'new'}`;

const STEP_COMPONENTS = [UCStep1, UCStep2, UCStep3];

export function UCWizardPage() {
  const { planoId = '', ucId } = useParams<{ planoId: string; ucId?: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<UCFormData>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY(planoId, ucId));
    return saved ? { ...UC_DEFAULT, ...JSON.parse(saved) } : UC_DEFAULT;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [ucIdState, setUcIdState] = useState<string | undefined>(ucId);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Load existing UC data for edit mode
  useEffect(() => {
    if (!ucId) return;
    casosUsoApi
      .listByPlano(planoId)
      .then((ucs) => {
        const uc = ucs.find((u) => u.id === ucId);
        if (!uc) return;
        setForm((prev) => {
          const saved = sessionStorage.getItem(SESSION_KEY(planoId, ucId));
          const persisted: Partial<UCFormData> = saved ? JSON.parse(saved) : {};
          return {
            ...prev,
            ...persisted,
            nome: persisted.nome || uc.nome,
            descricao: persisted.descricao || (uc.descricao ?? ''),
            atores: persisted.atores || (uc.atores ?? ''),
            fluxoPrincipal: persisted.fluxoPrincipal || uc.fluxoPrincipal,
            fluxosAlternativos: persisted.fluxosAlternativos || (uc.fluxosAlternativos ?? ''),
          };
        });
      })
      .catch(() => null);
  }, [ucId, planoId]);

  // Sync to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY(planoId, ucIdState), JSON.stringify(form));
  }, [form, planoId, ucIdState]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = useCallback((): boolean => {
    const schema = ucStepSchemas[currentStep];
    if (!schema) return true;
    const result = schema.safeParse(form);
    if (result.success) { setErrors({}); return true; }
    const errs: Record<string, string> = {};
    result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
    setErrors(errs);
    return false;
  }, [currentStep, form]);

  const handleNext = () => {
    if (!validate()) return;
    setCurrentStep((s) => Math.min(s + 1, 3));
    setErrors({});
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    setErrors({});
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const payload = {
        nome: form.nome || 'Caso de uso sem título',
        descricao: form.descricao || undefined,
        atores: form.atores || undefined,
        fluxoPrincipal: form.fluxoPrincipal || undefined,
        fluxosAlternativos: form.fluxosAlternativos || undefined,
      };
      if (!ucIdState) {
        const created = await casosUsoApi.create(planoId, payload);
        setUcIdState(created.id);
        const data = sessionStorage.getItem(SESSION_KEY(planoId, undefined));
        if (data) {
          sessionStorage.setItem(SESSION_KEY(planoId, created.id), data);
          sessionStorage.removeItem(SESSION_KEY(planoId, undefined));
        }
        navigate(`/planos/${planoId}/casos-uso/${created.id}/editar`, { replace: true });
        showToast('Rascunho salvo!');
      } else {
        await casosUsoApi.update(ucIdState, payload);
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
    if (!ucIdState) { showToast('Salve o rascunho antes de concluir.', 'error'); return; }
    setIsSaving(true);
    try {
      await casosUsoApi.update(ucIdState, {
        nome: form.nome,
        descricao: form.descricao || undefined,
        atores: form.atores || undefined,
        fluxoPrincipal: form.fluxoPrincipal,
        fluxosAlternativos: form.fluxosAlternativos || undefined,
      });
      sessionStorage.removeItem(SESSION_KEY(planoId, ucIdState));
      navigate(`/planos/${planoId}`);
    } catch {
      showToast('Erro ao concluir caso de uso.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const StepContent = STEP_COMPONENTS[currentStep - 1];
  const isLastStep = currentStep === 3;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold font-display">S✓</span>
          <div>
            <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Caso de Uso</p>
            <h1 className="text-base font-semibold leading-tight">
              {UC_STEPS[currentStep - 1].title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-indigo-200" aria-label={`Passo ${currentStep} de 3`}>
            Passo {currentStep} de 3
          </span>
          <button
            onClick={() => navigate(`/planos/${planoId}`)}
            className="flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white transition-colors"
          >
            <Home size={16} />
            Voltar ao Plano
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900 flex flex-col py-6 shrink-0">
          <nav className="flex-1 space-y-1 px-3">
            {UC_STEPS.map((step) => {
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

          <div className="px-6 pt-4 pb-2">
            <div className="h-1.5 rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 text-center">
              {Math.round(((currentStep - 1) / 2) * 100)}% concluído
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 font-display">
                  {currentStep}. {UC_STEPS[currentStep - 1].title}
                </h2>
                <div className="mt-2 flex gap-1">
                  {UC_STEPS.map((s) => (
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

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white px-8 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSaving}>
                <ChevronLeft size={16} className="mr-1" />
                Recuar
              </Button>

              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Save size={16} className="mr-1" />}
                Salvar Rascunho
              </Button>

              {isLastStep ? (
                <Button type="button" onClick={handleFinish} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="mr-1 animate-spin" /> : null}
                  Concluir Caso de Uso
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

      {toast && (
        <div className={['fixed bottom-6 right-6 rounded-lg px-4 py-3 text-sm text-white shadow-lg', toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'].join(' ')}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
