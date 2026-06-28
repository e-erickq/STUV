import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PerfilUsuario } from '@stuv/shared';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const UsuariosPage = lazy(() => import('./pages/usuarios/UsuariosPage'));
const PlanosPage = lazy(() => import('./pages/planos/PlanosPage').then((m) => ({ default: m.PlanosPage })));
const PlanoDetalhePage = lazy(() => import('./pages/planos/PlanoDetalhePage').then((m) => ({ default: m.PlanoDetalhePage })));
const WizardPlano = lazy(() => import('./pages/planos/WizardPlano').then((m) => ({ default: m.WizardPlano })));
const UCWizardPage = lazy(() => import('./pages/casos-uso/UCWizardPage').then((m) => ({ default: m.UCWizardPage })));
const UCDetalhePage = lazy(() => import('./pages/casos-uso/UCDetalhePage').then((m) => ({ default: m.UCDetalhePage })));
const ExecucaoPage = lazy(() => import('./pages/execucoes/ExecucaoPage').then((m) => ({ default: m.ExecucaoPage })));
const DefeitosPage = lazy(() => import('./pages/defeitos/DefeitosPage').then((m) => ({ default: m.DefeitosPage })));
const RelatoriosPage = lazy(() => import('./pages/relatorios/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage })));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Full-page wizards — sem AppLayout */}
          <Route
            path="/planos/novo"
            element={
              <ProtectedRoute allowedRoles={[PerfilUsuario.ADMINISTRADOR, PerfilUsuario.GERENTE]}>
                <WizardPlano />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planos/:id/editar"
            element={
              <ProtectedRoute allowedRoles={[PerfilUsuario.ADMINISTRADOR, PerfilUsuario.GERENTE]}>
                <WizardPlano />
              </ProtectedRoute>
            }
          />
          {/* UC Wizard — todos os perfis autenticados podem criar/editar UCs */}
          <Route
            path="/planos/:planoId/casos-uso/novo"
            element={
              <ProtectedRoute>
                <UCWizardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planos/:planoId/casos-uso/:ucId/editar"
            element={
              <ProtectedRoute>
                <UCWizardPage />
              </ProtectedRoute>
            }
          />

          {/* Rotas com AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/planos" element={<PlanosPage />} />
            <Route path="/planos/:id" element={<PlanoDetalhePage />} />
            <Route path="/planos/:planoId/casos-uso/:ucId" element={<UCDetalhePage />} />
            <Route
              path="/planos/:planoId/casos-uso/:ucId/casos-teste/:ctId"
              element={<ExecucaoPage />}
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={[PerfilUsuario.ADMINISTRADOR, PerfilUsuario.GERENTE]}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />

            <Route path="/casos-uso" element={<div className="p-8"><h1 className="font-display text-2xl font-bold">Casos de Uso</h1><p className="mt-2 text-muted-foreground">Em construção.</p></div>} />
            <Route path="/execucoes" element={<div className="p-8"><h1 className="font-display text-2xl font-bold">Execuções</h1><p className="mt-2 text-muted-foreground">Em construção.</p></div>} />
            <Route path="/defeitos" element={<DefeitosPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />

            <Route path="*" element={<div className="p-8 text-muted-foreground">404 — Página não encontrada.</div>} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
