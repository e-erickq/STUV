import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Usuários
  const [admin, gerente, testador] = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'admin@stuv.com' },
      update: {},
      create: {
        nome: 'Administrador STUV',
        email: 'admin@stuv.com',
        senhaHash: await bcrypt.hash('admin123', 10),
        perfil: 'ADMINISTRADOR',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'gerente@stuv.com' },
      update: {},
      create: {
        nome: 'Gerente de Projeto',
        email: 'gerente@stuv.com',
        senhaHash: await bcrypt.hash('gerente123', 10),
        perfil: 'GERENTE',
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'testador@stuv.com' },
      update: {},
      create: {
        nome: 'Ana Testadora',
        email: 'testador@stuv.com',
        senhaHash: await bcrypt.hash('testador123', 10),
        perfil: 'TESTADOR',
      },
    }),
  ]);

  console.log('Usuários criados:', admin.email, gerente.email, testador.email);

  // Plano RASCUNHO
  const planoRascunho = await prisma.planoTeste.upsert({
    where: { id: 'plano-rascunho-001' },
    update: {},
    create: {
      id: 'plano-rascunho-001',
      nome: 'Plano de Testes — Módulo de Pagamentos',
      descricao: 'Plano em elaboração para validar fluxos de pagamento via cartão e boleto.',
      status: 'RASCUNHO',
      etapaWizardAtual: 3,
    },
  });

  console.log('Plano rascunho criado:', planoRascunho.nome);

  // Plano ATIVO
  const planoAtivo = await prisma.planoTeste.upsert({
    where: { id: 'plano-ativo-001' },
    update: {},
    create: {
      id: 'plano-ativo-001',
      nome: 'Plano de Testes — Módulo de Autenticação',
      descricao:
        'Validação completa dos fluxos de autenticação: login, logout, recuperação de senha e controle de sessão.',
      status: 'ATIVO',
      etapaWizardAtual: 5,
    },
  });

  console.log('Plano ativo criado:', planoAtivo.nome);

  // Casos de Uso do plano ATIVO
  const uc1 = await prisma.casoUso.upsert({
    where: { id: 'uc-001' },
    update: {},
    create: {
      id: 'uc-001',
      planoId: planoAtivo.id,
      nome: 'UC01 — Login de Usuário',
      descricao: 'Permite que usuários cadastrados acessem o sistema com email e senha.',
      atores: 'Administrador, Gerente, Testador',
      fluxoPrincipal:
        '1. Usuário acessa a tela de login.\n2. Informa email e senha.\n3. Sistema valida as credenciais.\n4. Sistema redireciona para o dashboard.',
      fluxosAlternativos:
        'FA01: Credenciais inválidas — sistema exibe mensagem de erro.\nFA02: Usuário sem cadastro — sistema orienta a contatar o administrador.',
    },
  });

  const uc2 = await prisma.casoUso.upsert({
    where: { id: 'uc-002' },
    update: {},
    create: {
      id: 'uc-002',
      planoId: planoAtivo.id,
      nome: 'UC02 — Recuperação de Senha',
      descricao: 'Fluxo para que o usuário redefina sua senha via link enviado por email.',
      atores: 'Administrador, Gerente, Testador',
      fluxoPrincipal:
        '1. Usuário clica em "Esqueci minha senha".\n2. Informa o email cadastrado.\n3. Sistema envia link de redefinição.\n4. Usuário acessa o link e cadastra nova senha.',
      fluxosAlternativos:
        'FA01: Email não cadastrado — sistema não revela a informação por segurança.\nFA02: Link expirado — sistema solicita nova solicitação.',
    },
  });

  console.log('Casos de Uso criados:', uc1.nome, uc2.nome);

  // Casos de Teste
  const ct1 = await prisma.casoTeste.upsert({
    where: { id: 'ct-001' },
    update: {},
    create: {
      id: 'ct-001',
      ucId: uc1.id,
      nome: 'CT01 — Login com credenciais válidas',
      preCondicoes: 'Usuário cadastrado e ativo no sistema.',
      passos: '1. Acessar /login\n2. Preencher email: testador@stuv.com\n3. Preencher senha: testador123\n4. Clicar em "Entrar"',
      resultadoEsperado: 'Redirecionamento para /planos com mensagem de boas-vindas.',
      prioridade: 'ALTA',
    },
  });

  const ct2 = await prisma.casoTeste.upsert({
    where: { id: 'ct-002' },
    update: {},
    create: {
      id: 'ct-002',
      ucId: uc1.id,
      nome: 'CT02 — Login com senha incorreta',
      preCondicoes: 'Usuário cadastrado no sistema.',
      passos: '1. Acessar /login\n2. Preencher email válido\n3. Preencher senha errada\n4. Clicar em "Entrar"',
      resultadoEsperado: 'Mensagem de erro "Credenciais inválidas" sem revelar qual campo está incorreto.',
      prioridade: 'ALTA',
    },
  });

  const ct3 = await prisma.casoTeste.upsert({
    where: { id: 'ct-003' },
    update: {},
    create: {
      id: 'ct-003',
      ucId: uc1.id,
      nome: 'CT03 — Login com email não cadastrado',
      preCondicoes: 'Nenhum usuário cadastrado com o email utilizado.',
      passos: '1. Acessar /login\n2. Preencher email inexistente\n3. Preencher qualquer senha\n4. Clicar em "Entrar"',
      resultadoEsperado: 'Mensagem de erro genérica "Credenciais inválidas".',
      prioridade: 'MEDIA',
    },
  });

  const ct4 = await prisma.casoTeste.upsert({
    where: { id: 'ct-004' },
    update: {},
    create: {
      id: 'ct-004',
      ucId: uc2.id,
      nome: 'CT04 — Solicitar recuperação de senha com email válido',
      preCondicoes: 'Usuário cadastrado com email válido.',
      passos: '1. Acessar /esqueci-senha\n2. Preencher email cadastrado\n3. Clicar em "Enviar link"',
      resultadoEsperado: 'Mensagem de confirmação: "Se o email estiver cadastrado, você receberá um link."',
      prioridade: 'ALTA',
    },
  });

  const ct5 = await prisma.casoTeste.upsert({
    where: { id: 'ct-005' },
    update: {},
    create: {
      id: 'ct-005',
      ucId: uc2.id,
      nome: 'CT05 — Acessar link de recuperação expirado',
      preCondicoes: 'Link de recuperação gerado há mais de 24h.',
      passos: '1. Acessar URL do link expirado\n2. Tentar redefinir a senha',
      resultadoEsperado: 'Mensagem de erro "Link expirado" com opção de solicitar novo link.',
      prioridade: 'MEDIA',
    },
  });

  console.log('Casos de Teste criados: CT01 a CT05');

  // Execuções com resultados variados (pelo menos 1 de cada status)
  const execucoes = [
    // CT01 — PASSOU
    {
      id: 'exec-001',
      ctId: ct1.id,
      executorId: testador.id,
      resultado: 'PASSOU' as const,
      motivo: null,
      dataExecucao: new Date('2026-06-20T09:00:00Z'),
    },
    // CT01 — segunda execução PASSOU
    {
      id: 'exec-002',
      ctId: ct1.id,
      executorId: gerente.id,
      resultado: 'PASSOU' as const,
      motivo: null,
      dataExecucao: new Date('2026-06-21T10:00:00Z'),
    },
    // CT02 — FALHOU
    {
      id: 'exec-003',
      ctId: ct2.id,
      executorId: testador.id,
      resultado: 'FALHOU' as const,
      motivo: 'Mensagem de erro revela qual campo está incorreto, expondo comportamento inseguro.',
      dataExecucao: new Date('2026-06-20T09:30:00Z'),
    },
    // CT02 — BLOQUEADO
    {
      id: 'exec-004',
      ctId: ct2.id,
      executorId: testador.id,
      resultado: 'BLOQUEADO' as const,
      motivo: 'Ambiente de testes fora do ar — não foi possível acessar a tela de login.',
      dataExecucao: new Date('2026-06-22T14:00:00Z'),
    },
    // CT03 — PASSOU
    {
      id: 'exec-005',
      ctId: ct3.id,
      executorId: testador.id,
      resultado: 'PASSOU' as const,
      motivo: null,
      dataExecucao: new Date('2026-06-20T10:00:00Z'),
    },
    // CT03 — EM_EXECUCAO
    {
      id: 'exec-006',
      ctId: ct3.id,
      executorId: gerente.id,
      resultado: 'EM_EXECUCAO' as const,
      motivo: null,
      dataExecucao: new Date('2026-06-27T08:00:00Z'),
    },
    // CT04 — PASSOU
    {
      id: 'exec-007',
      ctId: ct4.id,
      executorId: testador.id,
      resultado: 'PASSOU' as const,
      motivo: null,
      dataExecucao: new Date('2026-06-21T11:00:00Z'),
    },
    // CT05 — NAO_EXECUTADO
    {
      id: 'exec-008',
      ctId: ct5.id,
      executorId: testador.id,
      resultado: 'NAO_EXECUTADO' as const,
      motivo: null,
      dataExecucao: new Date('2026-06-27T08:00:00Z'),
    },
    // CT05 — PULADO
    {
      id: 'exec-009',
      ctId: ct5.id,
      executorId: gerente.id,
      resultado: 'PULADO' as const,
      motivo: null,
      dataExecucao: new Date('2026-06-25T15:00:00Z'),
    },
  ];

  for (const exec of execucoes) {
    await prisma.execucao.upsert({
      where: { id: exec.id },
      update: {},
      create: exec,
    });
  }

  console.log('9 execuções criadas com todos os status representados');

  // Defeitos: 3 em estados diferentes
  const defeito1 = await prisma.defeito.upsert({
    where: { id: 'def-001' },
    update: {},
    create: {
      id: 'def-001',
      execucaoId: 'exec-003',
      autorId: testador.id,
      titulo: 'Mensagem de erro revela campo incorreto no login',
      descricao:
        'Ao inserir senha incorreta, o sistema exibe "Senha incorreta" em vez de mensagem genérica, permitindo enumeração de usuários.',
      gravidade: 'ALTA',
      estado: 'ABERTO',
      passosReproducao:
        '1. Acessar /login\n2. Inserir email válido\n3. Inserir senha errada\n4. Observar mensagem de erro exibida',
    },
  });

  const defeito2 = await prisma.defeito.upsert({
    where: { id: 'def-002' },
    update: {},
    create: {
      id: 'def-002',
      execucaoId: 'exec-003',
      autorId: testador.id,
      titulo: 'Token JWT não expira após logout',
      descricao:
        'Após realizar logout, o token JWT continua válido e pode ser reutilizado para acessar endpoints protegidos.',
      gravidade: 'CRITICA',
      estado: 'EM_CORRECAO',
      passosReproducao:
        '1. Fazer login e copiar o token\n2. Fazer logout\n3. Usar o token copiado em requisição autenticada\n4. Observar que a requisição é aceita',
    },
  });

  const defeito3 = await prisma.defeito.upsert({
    where: { id: 'def-003' },
    update: {},
    create: {
      id: 'def-003',
      execucaoId: 'exec-007',
      autorId: gerente.id,
      titulo: 'Email de recuperação com formatação incorreta',
      descricao: 'O email de recuperação enviado apresentava quebras de linha incorretas no cliente Outlook.',
      gravidade: 'BAIXA',
      estado: 'FECHADO',
      passosReproducao:
        '1. Solicitar recuperação de senha\n2. Abrir email recebido no Outlook\n3. Observar formatação quebrada no corpo do email',
    },
  });

  console.log('Defeitos criados:', defeito1.titulo, defeito2.titulo, defeito3.titulo);

  // Logs de auditoria
  await prisma.logAuditoria.createMany({
    data: [
      {
        entidade: 'PlanoTeste',
        entidadeId: planoAtivo.id,
        acao: 'CRIACAO',
        usuarioId: admin.id,
        dadosAntes: undefined,
        dadosDepois: { nome: planoAtivo.nome, status: 'ATIVO' },
      },
      {
        entidade: 'Defeito',
        entidadeId: defeito2.id,
        acao: 'MUDANCA_ESTADO',
        usuarioId: gerente.id,
        dadosAntes: { estado: 'ABERTO' },
        dadosDepois: { estado: 'EM_CORRECAO' },
      },
      {
        entidade: 'Defeito',
        entidadeId: defeito3.id,
        acao: 'MUDANCA_ESTADO',
        usuarioId: admin.id,
        dadosAntes: { estado: 'RETESTADO' },
        dadosDepois: { estado: 'FECHADO' },
      },
    ],
    skipDuplicates: true,
  });

  console.log('Logs de auditoria criados');
  console.log('\nSeed concluído com sucesso!');
  console.log('---');
  console.log('Usuários disponíveis:');
  console.log('  admin@stuv.com     / admin123    (ADMINISTRADOR)');
  console.log('  gerente@stuv.com   / gerente123  (GERENTE)');
  console.log('  testador@stuv.com  / testador123 (TESTADOR)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
