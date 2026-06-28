import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { WizardPlano } from '../WizardPlano';
import { planosApi } from '../../../lib/api/planos';

vi.mock('../../../lib/api/planos', () => ({
  planosApi: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    list: vi.fn(),
  },
}));

const mockCreate = planosApi.create as ReturnType<typeof vi.fn>;
const mockUpdate = planosApi.update as ReturnType<typeof vi.fn>;
const mockGet = planosApi.get as ReturnType<typeof vi.fn>;

function renderWizard(path = '/planos/novo') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/planos/novo" element={<WizardPlano />} />
          <Route path="/planos/:id/editar" element={<WizardPlano />} />
          <Route path="/planos" element={<div>Lista de Planos</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const MOCK_PLANO = {
  id: 'plano-123',
  nome: 'Plano Teste',
  descricao: null as null,
  status: 'RASCUNHO' as const,
  etapaWizardAtual: 1,
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString(),
};

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  mockCreate.mockResolvedValue(MOCK_PLANO);
  mockUpdate.mockResolvedValue({ ...MOCK_PLANO, etapaWizardAtual: 2 });
  // Needed for when navigate() triggers the edit route after create
  mockGet.mockResolvedValue(MOCK_PLANO);
});

describe('WizardPlano — navegação', () => {
  it('começa na etapa 1', () => {
    renderWizard();
    expect(screen.getByText('Passo 1 de 7')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do Projeto *')).toBeInTheDocument();
  });

  it('avança para etapa 2 ao preencher os campos obrigatórios e clicar em Avançar', async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.type(screen.getByLabelText('Nome do Projeto *'), 'Sistema de Pagamentos');
    await user.type(screen.getByLabelText('Sigla *'), 'SP');
    await user.type(screen.getByLabelText('Data de Início *'), '2026-01-01');
    await user.type(screen.getByLabelText('Data de Término *'), '2026-06-30');

    await user.click(screen.getByRole('button', { name: /avançar/i }));

    await waitFor(() => {
      expect(screen.getByText('Passo 2 de 7')).toBeInTheDocument();
    });
  });

  it('não avança se campos obrigatórios da etapa 1 estiverem vazios', async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(screen.getByRole('button', { name: /avançar/i }));

    expect(screen.getByText('Passo 1 de 7')).toBeInTheDocument();
    expect(screen.getByText(/nome do projeto é obrigatório/i)).toBeInTheDocument();
  });

  it('retorna para etapa 1 ao clicar em Recuar sem perder os dados', async () => {
    const user = userEvent.setup();
    renderWizard();

    const nomeInput = screen.getByLabelText('Nome do Projeto *');
    await user.type(nomeInput, 'Meu Projeto');
    await user.type(screen.getByLabelText('Sigla *'), 'MP');
    await user.type(screen.getByLabelText('Data de Início *'), '2026-01-01');
    await user.type(screen.getByLabelText('Data de Término *'), '2026-06-30');

    await user.click(screen.getByRole('button', { name: /avançar/i }));
    await waitFor(() => expect(screen.getByText('Passo 2 de 7')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /recuar/i }));
    await waitFor(() => expect(screen.getByText('Passo 1 de 7')).toBeInTheDocument());

    expect(screen.getByLabelText('Nome do Projeto *')).toHaveValue('Meu Projeto');
  });
});

describe('WizardPlano — persistência de rascunho', () => {
  it('salva dados no sessionStorage ao preencher campos', async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.type(screen.getByLabelText('Nome do Projeto *'), 'Projeto Alpha');

    await waitFor(() => {
      const stored = sessionStorage.getItem('stuv:wizard:new');
      expect(stored).not.toBeNull();
      const data = JSON.parse(stored!);
      expect(data.nomeProjeto).toBe('Projeto Alpha');
    });
  });

  it('chama planosApi.create ao clicar em Salvar Rascunho (modo novo)', async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.type(screen.getByLabelText('Nome do Projeto *'), 'Projeto Beta');
    await user.click(screen.getByRole('button', { name: /salvar rascunho/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Projeto Beta' }),
      );
    });
  });

  it('chama planosApi.update ao salvar rascunho em modo edição', async () => {
    mockGet.mockResolvedValue({
      id: 'plano-abc',
      nome: 'Plano Existente',
      descricao: 'desc',
      status: 'RASCUNHO',
      etapaWizardAtual: 2,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });

    const user = userEvent.setup();
    renderWizard('/planos/plano-abc/editar');

    // Wait for the API .then() to resolve and set currentStep=2 in state
    await waitFor(() => {
      expect(screen.getByText('Passo 2 de 7')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /salvar rascunho/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('plano-abc', expect.objectContaining({ nome: 'Plano Existente' }));
    });
  });
});
