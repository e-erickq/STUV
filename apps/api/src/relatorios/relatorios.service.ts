import { Injectable } from '@nestjs/common';
import { ResultadoExecucao } from '@stuv/shared';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../prisma/prisma.service';
import { PeriodoRelatorio, QueryRelatorioDto } from './dto/query-relatorio.dto';

// Período em dias para cada enum value
const PERIODO_DIAS: Record<PeriodoRelatorio, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  '365d': 365,
};

// Rótulos PT-BR para ResultadoExecucao
const RESULTADO_LABEL: Record<string, string> = {
  PASSOU: 'Passou',
  FALHOU: 'Falhou',
  BLOQUEADO: 'Bloqueado',
  PULADO: 'Pulado',
  EM_EXECUCAO: 'Em Execução',
  NAO_EXECUTADO: 'Não Executado',
};

const GRAVIDADE_LABEL: Record<string, string> = {
  CRITICA: 'Crítica',
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
};

const ESTADO_DEFEITO_LABEL: Record<string, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em Análise',
  EM_CORRECAO: 'Em Correção',
  RETESTADO: 'Retestado',
  FECHADO: 'Fechado',
  REJEITADO: 'Rejeitado',
};

function buildDateFilter(periodo?: PeriodoRelatorio): Date | undefined {
  if (!periodo) return undefined;
  const dias = PERIODO_DIAS[periodo];
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  return desde;
}

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async getDados(query: QueryRelatorioDto) {
    const desde = buildDateFilter(query.periodo);

    const where = {
      ...(query.executorId ? { executorId: query.executorId } : {}),
      ...(query.status ? { resultado: query.status as any } : {}),
      ...(desde ? { dataExecucao: { gte: desde } } : {}),
      casoTeste: {
        ...(query.planoId
          ? { casoUso: { planoId: query.planoId } }
          : {}),
      },
    };

    const execucoes = await this.prisma.execucao.findMany({
      where,
      select: {
        id: true,
        resultado: true,
        motivo: true,
        dataExecucao: true,
        executor: { select: { id: true, nome: true, perfil: true } },
        casoTeste: {
          select: {
            id: true,
            nome: true,
            casoUso: {
              select: {
                id: true,
                nome: true,
                plano: { select: { id: true, nome: true } },
              },
            },
          },
        },
        _count: { select: { defeitos: true } },
      },
      orderBy: { dataExecucao: 'desc' },
    });

    // Conta execuções por resultado
    const porResultado: Record<string, number> = {};
    for (const e of execucoes) {
      porResultado[e.resultado] = (porResultado[e.resultado] ?? 0) + 1;
    }

    const total = execucoes.length;
    const passaram = porResultado[ResultadoExecucao.PASSOU] ?? 0;
    const passRate = total > 0 ? Math.round((passaram / total) * 100) : 0;

    // Defeitos — filtro por plano/período de execução associada
    const defeitosWhere = {
      execucao: {
        ...(desde ? { dataExecucao: { gte: desde } } : {}),
        casoTeste: query.planoId
          ? { casoUso: { planoId: query.planoId } }
          : {},
      },
    };

    const defeitos = await this.prisma.defeito.findMany({
      where: defeitosWhere,
      select: {
        id: true,
        gravidade: true,
        estado: true,
        titulo: true,
        criadoEm: true,
        autor: { select: { nome: true } },
      },
    });

    const porGravidade: Record<string, number> = {};
    const porEstado: Record<string, number> = {};
    for (const d of defeitos) {
      porGravidade[d.gravidade] = (porGravidade[d.gravidade] ?? 0) + 1;
      porEstado[d.estado] = (porEstado[d.estado] ?? 0) + 1;
    }

    const defeitosAbertos =
      (porEstado['ABERTO'] ?? 0) +
      (porEstado['EM_ANALISE'] ?? 0) +
      (porEstado['EM_CORRECAO'] ?? 0) +
      (porEstado['RETESTADO'] ?? 0);

    return {
      geradoEm: new Date().toISOString(),
      filtros: {
        planoId: query.planoId ?? null,
        periodo: query.periodo ?? null,
        executorId: query.executorId ?? null,
        status: query.status ?? null,
      },
      resumo: {
        totalExecucoes: total,
        passRate,
        defeitosAbertos,
        totalDefeitos: defeitos.length,
      },
      execucoesPorResultado: Object.entries(porResultado).map(([resultado, count]) => ({
        resultado,
        label: RESULTADO_LABEL[resultado] ?? resultado,
        count,
      })),
      defeitosPorGravidade: Object.entries(porGravidade).map(([gravidade, count]) => ({
        gravidade,
        label: GRAVIDADE_LABEL[gravidade] ?? gravidade,
        count,
      })),
      defeitosPorEstado: Object.entries(porEstado).map(([estado, count]) => ({
        estado,
        label: ESTADO_DEFEITO_LABEL[estado] ?? estado,
        count,
      })),
      execucoes: execucoes.map((e) => ({
        id: e.id,
        resultado: e.resultado,
        resultadoLabel: RESULTADO_LABEL[e.resultado] ?? e.resultado,
        motivo: e.motivo,
        dataExecucao: e.dataExecucao,
        executor: e.executor,
        casoTeste: {
          id: e.casoTeste.id,
          nome: e.casoTeste.nome,
          casoUso: {
            id: e.casoTeste.casoUso.id,
            nome: e.casoTeste.casoUso.nome,
            plano: e.casoTeste.casoUso.plano,
          },
        },
        defeitosCount: e._count.defeitos,
      })),
    };
  }

  async gerarCsv(query: QueryRelatorioDto): Promise<Buffer> {
    const dados = await this.getDados(query);

    const linhas = dados.execucoes.map((e) => ({
      Plano: e.casoTeste.casoUso.plano.nome,
      'Caso de Uso': e.casoTeste.casoUso.nome,
      'Caso de Teste': e.casoTeste.nome,
      Executor: e.executor.nome,
      Resultado: e.resultadoLabel,
      'Data/Hora': new Date(e.dataExecucao).toLocaleString('pt-BR'),
      Motivo: e.motivo ?? '',
      Defeitos: e.defeitosCount,
    }));

    const csv = stringify(linhas, { header: true, delimiter: ';' });
    return Buffer.from(csv, 'utf-8');
  }

  async gerarPdf(query: QueryRelatorioDto): Promise<Uint8Array> {
    const dados = await this.getDados(query);
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const W = 595; // A4 width pts
    const H = 842; // A4 height pts
    const margin = 50;
    const lineH = 16;

    let page = doc.addPage([W, H]);
    let y = H - margin;

    const draw = (text: string, x: number, size: number, bold = false, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x, y, size, font: bold ? fontBold : font, color });
      y -= lineH;
    };

    const newSection = (title: string) => {
      y -= 8;
      if (y < 120) {
        page = doc.addPage([W, H]);
        y = H - margin;
      }
      page.drawRectangle({ x: margin, y: y - 4, width: W - margin * 2, height: lineH + 4, color: rgb(0.93, 0.95, 0.98) });
      page.drawText(title, { x: margin + 4, y, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.5) });
      y -= lineH + 4;
    };

    const checkPage = () => {
      if (y < 80) {
        page = doc.addPage([W, H]);
        y = H - margin;
      }
    };

    // ─── Cabeçalho ───────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: rgb(0.1, 0.2, 0.5) });
    page.drawText('STUV — Relatório de Execuções', { x: margin, y: H - 35, size: 16, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(`Gerado em: ${new Date(dados.geradoEm).toLocaleString('pt-BR')}`, { x: margin, y: H - 55, size: 9, font, color: rgb(0.8, 0.85, 1) });
    y = H - 90;

    // ─── Resumo ───────────────────────────────────────────────────────────────
    newSection('RESUMO');
    const r = dados.resumo;
    draw(`Total de execuções: ${r.totalExecucoes}`, margin + 8, 9);
    draw(`Pass Rate: ${r.passRate}%`, margin + 8, 9);
    draw(`Defeitos abertos: ${r.defeitosAbertos}`, margin + 8, 9);
    draw(`Total de defeitos: ${r.totalDefeitos}`, margin + 8, 9);

    // ─── Execuções por resultado ───────────────────────────────────────────
    newSection('EXECUÇÕES POR RESULTADO');
    for (const item of dados.execucoesPorResultado) {
      checkPage();
      draw(`${item.label}: ${item.count}`, margin + 8, 9);
    }

    // ─── Defeitos por gravidade ────────────────────────────────────────────
    newSection('DEFEITOS POR GRAVIDADE');
    for (const item of dados.defeitosPorGravidade) {
      checkPage();
      draw(`${item.label}: ${item.count}`, margin + 8, 9);
    }

    // ─── Tabela de execuções ─────────────────────────────────────────────
    newSection('EXECUÇÕES DETALHADAS');

    const cols = [margin, margin + 100, margin + 200, margin + 300, margin + 395, margin + 460];
    const headers = ['Plano / UC', 'Caso de Teste', 'Executor', 'Resultado', 'Data', 'Defeitos'];

    // Cabeçalho da tabela
    page.drawRectangle({ x: margin, y: y - 4, width: W - margin * 2, height: lineH + 2, color: rgb(0.85, 0.89, 0.95) });
    headers.forEach((h, i) => {
      page.drawText(h, { x: cols[i], y, size: 8, font: fontBold, color: rgb(0.1, 0.2, 0.5) });
    });
    y -= lineH + 4;

    for (const e of dados.execucoes) {
      checkPage();
      const planoUc = `${e.casoTeste.casoUso.plano.nome} / ${e.casoTeste.casoUso.nome}`.slice(0, 22);
      const ct = e.casoTeste.nome.slice(0, 22);
      const exec = e.executor.nome.slice(0, 16);
      const res = e.resultadoLabel.slice(0, 14);
      const data = new Date(e.dataExecucao).toLocaleDateString('pt-BR');

      const rowData = [planoUc, ct, exec, res, data, String(e.defeitosCount)];
      rowData.forEach((v, i) => {
        page.drawText(v, { x: cols[i], y, size: 7.5, font, color: rgb(0.2, 0.2, 0.2) });
      });
      y -= lineH - 2;
    }

    // Rodapé
    const pages = doc.getPages();
    pages.forEach((p, i) => {
      p.drawText(`Página ${i + 1} de ${pages.length}`, {
        x: W / 2 - 30, y: 25, size: 8, font, color: rgb(0.5, 0.5, 0.5),
      });
    });

    return doc.save();
  }
}
