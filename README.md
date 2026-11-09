# Recarregaaki (AdonisJS 7)

Migração do projeto AdonisJS 6 + Postgres para **AdonisJS 7 + SQLite**, usando as bibliotecas oficiais:
`@adonisjs/lucid`, `auth`, `bouncer`, `session`, `shield`, `limiter`, `mail`, `drive`, `queue`, `vite`, `static` e VineJS.

## Requisitos

- Node.js **24+**
- pnpm

## Arranque (desenvolvimento)

```bash
pnpm install
cp .env.example .env
node ace generate:key          # preenche APP_KEY
node ace migration:run         # cria tmp/db.sqlite3 e gera database/schema.ts
node ace create:admin "O Teu Nome" email@exemplo.com   # primeiro administrador
pnpm dev
```

Os emails (verificação e recuperação de palavra-passe) são enviados por uma fila (`@adonisjs/queue`, driver `database`).
Em paralelo ao servidor, corre o worker:

```bash
node ace queue:work
```

## Testes, lint e tipos

```bash
node ace test          # 193 testes (unit + functional), usam tmp/test.sqlite3 e fila "sync"
pnpm lint
pnpm typecheck
```

Os testes não precisam de Redis, Postgres nem SMTP: os emails são interceptados (`mail.fake()`), os uploads vão para um
disco falso (`drive.fake()`) e cada teste corre numa transação que é revertida.

## Produção

```bash
node ace build
cd build && pnpm i --prod
node bin/server.js            # e noutro processo: node ace queue:work
```

Defina `APP_URL` (usado nos links dos emails) e, para a BD e os uploads sobreviverem a novos deploys, aponte para um
volume persistente:

```
DB_FILENAME=/var/data/recarregaaki/db.sqlite3
UPLOADS_PATH=/var/data/recarregaaki/uploads
```

## Arquitetura

| Camada | Pasta | Responsabilidade |
| --- | --- | --- |
| Models | `app/models` | Só relações e tipos (as colunas vêm de `database/schema.ts`, gerado). **Sem queries.** |
| Services | `app/services` | Toda a lógica de negócio e consultas à BD. |
| Controllers | `app/controllers` | Finos: autorizar → validar → chamar o service → responder. |
| Policies | `app/policies` | Regras de autorização (Bouncer), uma por recurso. |
| Validators | `app/validators` | VineJS. |
| Jobs / Mails | `app/jobs`, `app/mails` | Envio de emails em fila. |

### Autorização

O middleware `auth` só garante que existe sessão. Quem pode fazer o quê é decidido pelas policies, chamadas **no início
de cada ação** do controller:

```ts
await bouncer.with('CategoryPolicy').authorize('update')
```

Todas as rotas do painel (`/dashboard/*`) são cobertas por `tests/functional/authorization.spec.ts`, que testa cada uma
como visitante (vai para o login), utilizador comum (recusado) e administrador (acesso).

### Segurança

- Registo público não aceita `isAdmin`, `isBlocked` nem `isEmailVerified`.
- Tokens de email têm **tipo** (verificação ≠ recuperação), são guardados com hash sha256, expiram em 1h e são de uso único.
- "Esqueci a palavra-passe" responde sempre o mesmo (não revela que emails existem).
- Login limitado a 5 tentativas/minuto por IP+email (`@adonisjs/limiter`), com bloqueio de 5 minutos.
- Utilizadores bloqueados perdem a sessão no pedido seguinte.
- Pagamentos nunca são apagados em cascata (`ON DELETE RESTRICT`).
- Uploads: só jpg/jpeg/png/webp até 2 MB (SVG foi removido de propósito, ver `app/validators/image_rules.ts`).

## Notas sobre SQLite

- O SQLite devolve booleanos como `0/1`; `database/schema_rules.ts` faz o gerador de schema converter para `true/false`.
- `LIKE` no SQLite só ignora maiúsculas/minúsculas em ASCII (a pesquisa por "é" não encontra "É").
- Um único ficheiro de BD: adequado para uma instância. Para várias instâncias use Postgres (basta trocar a ligação em `config/database.ts`).
