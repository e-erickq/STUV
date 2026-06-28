import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { EstadoDefeito, GravidadeDefeito } from '@stuv/shared';
import { TRANSICOES_VALIDAS, transicaoValida } from './defeitos.service';

// ─── Máquina de estados — testes da função pura ─────────────────────────────

describe('transicaoValida', () => {
  describe('transições VÁLIDAS', () => {
    it('ABERTO → EM_ANALISE', () => {
      expect(transicaoValida(EstadoDefeito.ABERTO, EstadoDefeito.EM_ANALISE)).toBe(true);
    });

    it('EM_ANALISE → EM_CORRECAO', () => {
      expect(transicaoValida(EstadoDefeito.EM_ANALISE, EstadoDefeito.EM_CORRECAO)).toBe(true);
    });

    it('EM_ANALISE → REJEITADO', () => {
      expect(transicaoValida(EstadoDefeito.EM_ANALISE, EstadoDefeito.REJEITADO)).toBe(true);
    });

    it('EM_CORRECAO → RETESTADO', () => {
      expect(transicaoValida(EstadoDefeito.EM_CORRECAO, EstadoDefeito.RETESTADO)).toBe(true);
    });

    it('RETESTADO → FECHADO', () => {
      expect(transicaoValida(EstadoDefeito.RETESTADO, EstadoDefeito.FECHADO)).toBe(true);
    });
  });

  describe('transições INVÁLIDAS — pular etapas', () => {
    it('ABERTO → EM_CORRECAO (pula EM_ANALISE)', () => {
      expect(transicaoValida(EstadoDefeito.ABERTO, EstadoDefeito.EM_CORRECAO)).toBe(false);
    });

    it('ABERTO → FECHADO (pula tudo)', () => {
      expect(transicaoValida(EstadoDefeito.ABERTO, EstadoDefeito.FECHADO)).toBe(false);
    });

    it('ABERTO → RETESTADO', () => {
      expect(transicaoValida(EstadoDefeito.ABERTO, EstadoDefeito.RETESTADO)).toBe(false);
    });

    it('EM_ANALISE → FECHADO (pula EM_CORRECAO e RETESTADO)', () => {
      expect(transicaoValida(EstadoDefeito.EM_ANALISE, EstadoDefeito.FECHADO)).toBe(false);
    });

    it('EM_CORRECAO → FECHADO (pula RETESTADO)', () => {
      expect(transicaoValida(EstadoDefeito.EM_CORRECAO, EstadoDefeito.FECHADO)).toBe(false);
    });

    it('EM_CORRECAO → ABERTO (retrocesso)', () => {
      expect(transicaoValida(EstadoDefeito.EM_CORRECAO, EstadoDefeito.ABERTO)).toBe(false);
    });

    it('RETESTADO → EM_ANALISE (retrocesso)', () => {
      expect(transicaoValida(EstadoDefeito.RETESTADO, EstadoDefeito.EM_ANALISE)).toBe(false);
    });
  });

  describe('transições INVÁLIDAS — estados terminais', () => {
    it('FECHADO → qualquer estado', () => {
      for (const estado of Object.values(EstadoDefeito)) {
        expect(transicaoValida(EstadoDefeito.FECHADO, estado)).toBe(false);
      }
    });

    it('REJEITADO → qualquer estado', () => {
      for (const estado of Object.values(EstadoDefeito)) {
        expect(transicaoValida(EstadoDefeito.REJEITADO, estado)).toBe(false);
      }
    });
  });

  describe('TRANSICOES_VALIDAS — estrutura da máquina', () => {
    it('todos os estados têm entrada no mapa', () => {
      for (const estado of Object.values(EstadoDefeito)) {
        expect(Object.keys(TRANSICOES_VALIDAS)).toContain(estado);
      }
    });

    it('FECHADO e REJEITADO não têm saídas', () => {
      expect(TRANSICOES_VALIDAS[EstadoDefeito.FECHADO]).toHaveLength(0);
      expect(TRANSICOES_VALIDAS[EstadoDefeito.REJEITADO]).toHaveLength(0);
    });
  });
});

// ─── DefeitosService — testes com prisma mockado ────────────────────────────

jest.mock('../prisma/prisma.service');

import { DefeitosService } from './defeitos.service';
import { PrismaService } from '../prisma/prisma.service';

const makePrisma = () =>
  ({
    defeito: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    execucao: {
      findUnique: jest.fn(),
    },
  }) as unknown as PrismaService;

describe('DefeitosService', () => {
  let service: DefeitosService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new DefeitosService(prisma as any);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      titulo: 'Bug crítico no login',
      descricao: 'Descrição do bug com mais de dez chars',
      gravidade: GravidadeDefeito.ALTA,
      passosReproducao: '1. Acessar /login\n2. Clicar entrar',
    };

    it('cria defeito em estado ABERTO quando execução existe', async () => {
      (prisma.execucao.findUnique as jest.Mock).mockResolvedValue({ id: 'exec-1', resultado: 'FALHOU' });
      (prisma.defeito.create as jest.Mock).mockResolvedValue({ id: 'def-1', estado: 'ABERTO', ...dto });

      const result = await service.create('exec-1', dto, 'user-1');
      expect(prisma.defeito.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estado: EstadoDefeito.ABERTO }),
        }),
      );
      expect(result.estado).toBe('ABERTO');
    });

    it('lança NotFoundException quando execução não existe', async () => {
      (prisma.execucao.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.create('inexistente', dto, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateEstado ─────────────────────────────────────────────────────────

  describe('updateEstado', () => {
    it('executa transição válida ABERTO → EM_ANALISE', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.ABERTO });
      (prisma.defeito.update as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.EM_ANALISE });

      const result = await service.updateEstado('def-1', { estado: EstadoDefeito.EM_ANALISE });
      expect(prisma.defeito.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { estado: EstadoDefeito.EM_ANALISE } }),
      );
      expect(result.estado).toBe(EstadoDefeito.EM_ANALISE);
    });

    it('executa transição válida EM_CORRECAO → RETESTADO', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.EM_CORRECAO });
      (prisma.defeito.update as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.RETESTADO });
      const result = await service.updateEstado('def-1', { estado: EstadoDefeito.RETESTADO });
      expect(result.estado).toBe(EstadoDefeito.RETESTADO);
    });

    it('rejeita transição inválida ABERTO → FECHADO com 422', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.ABERTO });
      await expect(
        service.updateEstado('def-1', { estado: EstadoDefeito.FECHADO }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('rejeita fechar sem passar por RETESTADO (EM_CORRECAO → FECHADO)', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.EM_CORRECAO });
      await expect(
        service.updateEstado('def-1', { estado: EstadoDefeito.FECHADO }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('rejeita transição em estado terminal FECHADO → qualquer', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.FECHADO });
      await expect(
        service.updateEstado('def-1', { estado: EstadoDefeito.ABERTO }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('rejeita transição em estado terminal REJEITADO → qualquer', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.REJEITADO });
      await expect(
        service.updateEstado('def-1', { estado: EstadoDefeito.EM_ANALISE }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('lança NotFoundException quando defeito não existe', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateEstado('inexistente', { estado: EstadoDefeito.EM_ANALISE }),
      ).rejects.toThrow(NotFoundException);
    });

    it('mensagem de erro inclui a transição rejeitada', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1', estado: EstadoDefeito.ABERTO });
      const error = await service.updateEstado('def-1', { estado: EstadoDefeito.FECHADO }).catch((e) => e);
      expect(error.message).toContain('ABERTO');
      expect(error.message).toContain('FECHADO');
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('remove defeito existente', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue({ id: 'def-1' });
      (prisma.defeito.delete as jest.Mock).mockResolvedValue(undefined);
      await expect(service.delete('def-1')).resolves.not.toThrow();
    });

    it('lança NotFoundException quando defeito não existe', async () => {
      (prisma.defeito.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.delete('inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});
