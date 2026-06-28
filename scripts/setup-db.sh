#!/usr/bin/env bash
# Cria o usuário e banco PostgreSQL para o STUV
set -e

echo "Criando usuário e banco stuv no PostgreSQL..."

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'stuv') THEN
    CREATE USER stuv WITH PASSWORD 'stuv';
    RAISE NOTICE 'Usuário stuv criado.';
  ELSE
    RAISE NOTICE 'Usuário stuv já existe.';
  END IF;
END
\$\$;

SELECT 1 FROM pg_database WHERE datname = 'stuv';
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stuv') THEN
    PERFORM dblink_exec('', 'CREATE DATABASE stuv OWNER stuv');
  END IF;
END
\$\$;
SQL

# Tentativa direta (funciona se o bloco acima falhar no CREATE DATABASE)
sudo -u postgres createdb -O stuv stuv 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stuv TO stuv;" 2>/dev/null || true
sudo -u postgres psql -d stuv -c "GRANT ALL ON SCHEMA public TO stuv;" 2>/dev/null || true

echo ""
echo "Banco configurado. Rodando migrações e seed..."
cd "$(dirname "$0")/.."
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed

echo ""
echo "Setup concluído!"
