import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FormatoRelatorio, QueryRelatorioDto } from './dto/query-relatorio.dto';
import { RelatoriosService } from './relatorios.service';

@ApiTags('relatorios')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get()
  @ApiOperation({ summary: 'Gera relatório consolidado (json | pdf | csv)' })
  async getRelatorio(@Query() query: QueryRelatorioDto, @Res() res: Response) {
    const formato = query.formato ?? FormatoRelatorio.JSON;

    if (formato === FormatoRelatorio.PDF) {
      const pdf = await this.relatoriosService.gerarPdf(query);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-stuv.pdf"');
      res.end(Buffer.from(pdf));
      return;
    }

    if (formato === FormatoRelatorio.CSV) {
      const csv = await this.relatoriosService.gerarCsv(query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-stuv.csv"');
      res.end(csv);
      return;
    }

    const dados = await this.relatoriosService.getDados(query);
    res.json(dados);
  }
}
