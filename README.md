# TMDB — Backend

API REST em NestJS para o TMDB, com autenticação via SSO do Portal ADATA + JWT, persistência em SQL Server através do Prisma e documentação automática em Swagger.

## Stack

| Camada          | Tecnologia                        |
| --------------- | --------------------------------- |
| Framework       | NestJS 10                         |
| ORM             | Prisma 6.10 (adapter MSSQL)       |
| Banco           | SQL Server                        |
| Autenticação    | SSO do Portal ADATA + JWT (Passport) |
| Documentação    | Swagger (`@nestjs/swagger`)       |
| Filas           | Bull (envio de e-mails)           |
| E-mail          | Nodemailer + Handlebars           |
| Armazenamento   | MinIO                             |
| Lint / Format   | ESLint + Prettier                 |

## Pré-requisitos

- Node.js 20 ou superior
- Docker — no fluxo com container, o banco de desenvolvimento sobe junto
- Acesso a uma instância externa de SQL Server (apenas para `production`)

---

## Instalação — Ambiente Local

### 1. Instalar as dependências

```bash
npm install
```

### 2. Criar o arquivo de variáveis de ambiente

Copie o `.env.example` para `.env` na raiz do projeto e preencha os valores:

```bash
cp .env.example .env
```

### 3. Configurar as variáveis de ambiente

#### Banco de dados

O projeto trabalha com dois bancos, escolhidos pelo ambiente (ver [Bancos por ambiente](#bancos-por-ambiente)).

**Banco externo — usado em `production`:**

| Variável       | Descrição                                            |
| -------------- | ---------------------------------------------------- |
| `DATABASE_URL` | Connection string do SQL Server (ver formato abaixo) |

```
DATABASE_URL="sqlserver://HOST:PORTA;database=NOME_DO_BANCO;user=USUARIO;password=SENHA;encrypt=true;trustServerCertificate=true"
```

**Banco em container — usado em `development`:**

| Variável            | Exemplo            | Descrição                                        |
| ------------------- | ------------------ | ------------------------------------------------ |
| `MSSQL_DB`          | `adata_tmdb_dev`   | Nome do banco criado no container                |
| `MSSQL_SA_PASSWORD` | `Tmdb@Local2026`   | Senha do usuário `sa`                            |
| `MSSQL_PORT`        | `1433`             | Porta publicada no host                          |

A `DATABASE_URL` do ambiente de desenvolvimento **não é escrita à mão**: o `docker-compose.override.yml` a monta a partir dessas três variáveis, então basta alterá-las em um lugar só.

> A senha do `sa` precisa atender à política do SQL Server: no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo. Evite `$` no valor, para não conflitar com a interpolação do Compose.

#### Aplicação

| Variável      | Exemplo                 |
| ------------- | ----------------------- |
| `NODE_ENV`    | `development`           |
| `APP_ENV`     | `local`                 |
| `APP_PORT`    | `3001`                  |
| `APP_VERSION` | `TMDB Backend v1.0.0`   |

#### CORS

| Variável           | Exemplo                              |
| ------------------ | ------------------------------------ |
| `CORS_ORIGIN`      | `*`                                  |
| `CORS_METHODS`     | `GET,HEAD,PUT,PATCH,POST,DELETE`     |
| `CORS_PREFLIGHT`   | `false`                              |
| `CORS_SUSS_STATUS` | `204`                                |

#### Swagger

| Variável              | Exemplo                   |
| --------------------- | ------------------------- |
| `SWAGGER_TITLE`       | `TMDB`                    |
| `SWAGGER_DESCRIPTION` | `TMDB - Documentation`    |
| `SWAGGER_VERSION`     | `1.0`                     |
| `SWAGGER_ENDPOINT`    | `swagger`                 |
| `SWAGGER_API_URL`     | `http://localhost:3001`   |
| `SWAGGER_ENABLED`     | `true`                    |

#### JWT

| Variável         | Exemplo     |
| ---------------- | ----------- |
| `JWT_AT_SECRET`  | `at-secret` |
| `JWT_AT_EXPIRES` | `12h`       |
| `JWT_RT_SECRET`  | `rt-secret` |
| `JWT_RT_EXPIRES` | `7d`        |

#### SSO do Portal ADATA

Obrigatórias: o SSO é a única forma de login (ver [Login via SSO do Portal ADATA](#login-via-sso-do-portal-adata)).

| Variável              | Exemplo (sandbox local)    | Descrição |
| --------------------- | -------------------------- | --------- |
| `SSO_PORTAL_API_URL`  | `http://localhost:3010`    | URL base da API do Portal, sem `/api` |
| `SSO_API_KEY`         | `sandbox-api-key`          | Chave enviada no header `x-api-key` da troca do código |
| `SSO_SYSTEM_ID`       | `1`                        | Id do TMDB no cadastro de sistemas do Portal |
| `SSO_FRONTEND_ORIGIN` | `http://localhost:3000`    | Origem pública do front, idêntica ao `sso_origin` cadastrado no Portal (sem barra final) |

#### E-mail (Nodemailer)

| Variável             | Descrição                                              |
| -------------------- | ------------------------------------------------------ |
| `MAIL_HOST`          | Host SMTP                                              |
| `MAIL_PORT`          | Porta SMTP                                             |
| `MAIL_FROM`          | Remetente padrão                                       |
| `MAIL_REQUIRED_AUTH` | `true` quando o SMTP exigir autenticação (sem relay)   |
| `MAIL_AUTH_USER`     | Usuário SMTP                                           |
| `MAIL_AUTH_PASS`     | Senha SMTP                                             |
| `MAIL_SECURE`        | Uso de conexão segura                                  |
| `MAIL_TLS_ENABLE`    | Habilita TLS                                           |

#### MinIO

| Variável            | Descrição                          |
| ------------------- | ---------------------------------- |
| `MINIO_ENDPOINT`    | Host do MinIO                      |
| `MINIO_PORT`        | Porta do MinIO (padrão `9001`)     |
| `MINIO_USE_SSL`     | `true` para conexão via HTTPS      |
| `MINIO_ACCESS_KEY`  | Access key                         |
| `MINIO_SECRET_KEY`  | Secret key                         |
| `MINIO_BUCKET`      | Bucket padrão                      |
| `MINIO_API_URL`     | URL base usada para montar os links dos arquivos |

#### Integrações externas

| Variável                       | Descrição                  |
| ------------------------------ | -------------------------- |
| `ENABLE_MES`                   | `true` consulta a API do MES; `false` usa a lista local de exemplo |
| `MES_API_URL`                  | URL da API do MES          |
| `MES_API_USER`                 | Usuário da API do MES      |
| `MES_API_PASSWORD`             | Senha da API do MES        |
| `DATA_COLLECTION_API_URL`      | URL da API do Data Collection |
| `DATA_COLLECTION_BFF_API_URL`  | URL do BFF do Data Collection |
| `DATA_COLLECTION_API_USER`     | Usuário do Data Collection |
| `DATA_COLLECTION_API_PASSWORD` | Senha do Data Collection   |
| `ENABLE_RMS_IMPORT`            | `true` importa rotinas do RMS ao sincronizar máquinas |
| `RMS_API_URL`                  | URL base da API do RMS     |
| `RMS_API_USER`                 | Usuário de serviço no RMS  |
| `RMS_API_PASSWORD`             | Senha do usuário de serviço |

> Com `ENABLE_MES=false`, o `GET /machines/mes` responde a partir de `src/common/mocks/machines.ts`, sem depender da API do MES. É o modo indicado para desenvolvimento.


### 4. Aplicar as migrações do banco

> Rodando a aplicação direto no host (fora do Docker), a `DATABASE_URL` usada é a do `.env` — ou seja, o **banco externo**. Se quiser usar o banco em container a partir do host, suba só o banco com `docker compose up -d db` e aponte a `DATABASE_URL` para `sqlserver://localhost:${MSSQL_PORT};database=${MSSQL_DB};user=sa;password=${MSSQL_SA_PASSWORD};encrypt=true;trustServerCertificate=true`.

```bash
npx prisma migrate deploy
```

Em desenvolvimento, para criar uma nova migração a partir de alterações no `schema.prisma`:

```bash
npx prisma migrate dev
```

### 5. Popular os dados iniciais (seed)

```bash
npx prisma db seed        # catálogo de permissões
```

**Catálogo de permissões** ([seed.ts](prisma/seeders/seed.ts), com a lógica em [catalog.ts](prisma/seeders/catalog.ts)) — roda automaticamente a cada deploy:

| Registro | Conteúdo |
| --- | --- |
| `modules` | `machines`, `notifications`, `change-log` e `permissions` |
| `operations` | 8 operações, no formato `<ação>-<módulo>` (ex.: `show-machines`, `sync-machines`) |
| `profiles` | Perfil `admin` (Administrador) |
| `profile_operation` | Operações liberadas para o perfil `admin` |

Ele só **acrescenta**; nunca remove nem altera registros existentes. As operações são vinculadas ao perfil `admin` em dois casos:

- quando o perfil `admin` é criado, recebe todas as operações;
- quando uma operação nova é criada, ela é vinculada ao `admin`.

Uma operação retirada do `admin` pela tela continua retirada nos deploys seguintes.

Nenhum usuário é criado pelo seed: os usuários nascem no primeiro acesso via Portal (ver [Login via SSO do Portal ADATA](#login-via-sso-do-portal-adata)). Para ter um administrador, cadastre no Portal um perfil com alias `admin` para o sistema TMDB.

> Ao implementar novos módulos, acrescente o módulo e suas operações em `modulesDataQuery` no [catalog.ts](prisma/seeders/catalog.ts). No próximo deploy, as operações novas são criadas e liberadas para o perfil `admin`.

### 6. Executar a aplicação

```bash
npm run start:dev
```

### 7. Testar a aplicação

Acesse a URL do Swagger conforme configurado no `.env`:

```
http://localhost:3001/swagger
```

---

## Instalação — Docker

Nenhum valor de configuração fica nos arquivos do Compose: todas as variáveis vêm do `.env` da raiz, via `env_file`. Portanto, criar o `.env` também é pré-requisito aqui.

### Bancos por ambiente

O ambiente é definido por qual combinação de arquivos do Compose você usa:

| Ambiente      | Banco                                       | Origem da `DATABASE_URL`                                 |
| ------------- | ------------------------------------------- | -------------------------------------------------------- |
| `development` | Container SQL Server que sobe junto (`db`)  | Montada pelo `docker-compose.override.yml` a partir de `MSSQL_DB`, `MSSQL_SA_PASSWORD` |
| `production`  | Servidor externo                            | A `DATABASE_URL` do `.env`                               |

A divisão dos arquivos é a seguinte:

| Arquivo                       | Papel                                                                    |
| ----------------------------- | ------------------------------------------------------------------------ |
| `docker-compose.yml`          | Base: serviço `app`, `env_file`, porta                                   |
| `docker-compose.override.yml` | Desenvolvimento — carregado **automaticamente** pelo Compose             |
| `docker-compose.prod.yml`     | Produção — precisa ser informado explicitamente com `-f`                 |

### Desenvolvimento

```bash
docker compose up --build
```

Como o Compose carrega o `docker-compose.override.yml` sozinho, esse comando já sobe os dois serviços:

- **`db`** — SQL Server 2022 (edição Developer), com os dados em um volume nomeado (`mssql-data`), publicado na `MSSQL_PORT` do host e com healthcheck via `sqlcmd`.
- **`app`** — sobe no estágio `development`, com hot reload: a raiz do projeto é montada em `/app` e o `node_modules` fica em um volume próprio, para não ser sobrescrito pelo `node_modules` do host.

O `app` só inicia depois que o `db` fica **healthy** (`depends_on` com `condition: service_healthy`), e o comando do container é:

```
npx prisma migrate deploy && npx prisma db seed && npm run start:dev
```

Ou seja: no ambiente de desenvolvimento as migrations e o catálogo de permissões **são aplicados automaticamente** a cada subida. O banco é criado pelo próprio `migrate deploy`, e o seed pode rodar repetidas vezes sem efeito colateral.

Para acessar o banco do container direto:

```bash
docker compose exec db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -d "$MSSQL_DB" -Q "SELECT * FROM users"
```

Para zerar o banco e começar do zero:

```bash
docker compose down -v
```

> **Hot reload no Windows:** o watcher do TypeScript recompila alterações em arquivos existentes, mas **não detecta arquivos novos** através do bind mount. Ao criar um módulo, DTO ou qualquer arquivo novo, rode `docker compose restart app` — caso contrário o `dist` continua sem ele e a rota não aparece.

### Produção

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Nessa combinação o `override` não é carregado, então **não há container de banco**: sobe apenas o `app`, no estágio `production` (sem bind mount e sem devDependencies), apontando para a `DATABASE_URL` externa do `.env`.

Ao iniciar, o container executa `npx prisma migrate deploy` antes de `node dist/main`, então as migrations pendentes são aplicadas automaticamente a cada deploy. Se a migration falhar, a aplicação não sobe.

### Testar

```
http://localhost:3001/swagger
```

(a porta segue a `APP_PORT` do `.env`)

### Estágios da imagem

O `.adata/Dockerfile` é multi-stage:

| Estágio       | Uso                                                                 |
| ------------- | ------------------------------------------------------------------- |
| `deps`        | Instala as dependências (camada reaproveitada em cache)             |
| `development` | Dependências completas + `npm run start:dev`                        |
| `build`       | Gera o `dist` com `npm run build`                                   |
| `production`  | Dependências de produção + `dist`; aplica as migrations e sobe a app |

Para gerar a imagem de produção manualmente:

```bash
docker build -f .adata/Dockerfile --target production -t tmdb-backend .
```

> É este mesmo Dockerfile que o pipeline do GitLab usa para gerar a imagem publicada. Ao subir, o container executa `npx prisma migrate deploy && npx prisma db seed && node dist/main`: aplica as migrations e o catálogo de permissões, nessa ordem, e só então inicia a aplicação. Se qualquer etapa falhar, a aplicação não sobe.
>
> O `ts-node` fica em `dependencies`, e o `tsconfig.json` é copiado para a imagem: os dois são necessários para os seeds rodarem no container de produção.

#### Primeiro deploy em um ambiente novo

O deploy cria as tabelas e as permissões, mas **não cria nenhum usuário**. Antes de liberar o ambiente, cadastre o TMDB no Portal ADATA (ver [Login via SSO do Portal ADATA](#login-via-sso-do-portal-adata)) e preencha as variáveis `SSO_*` com os dados fornecidos pelo Portal.

> O `QueueMailModule` registra a fila do Bull sem um `BullModule.forRoot()`, então a conexão cai no padrão `localhost:6379`. Não há serviço de Redis no compose: dentro do container esse endereço aponta para o próprio container e a fila fica em erro de conexão. Para usar a fila de e-mails será preciso configurar o Redis explicitamente.

---

## Scripts disponíveis

| Comando               | Descrição                                    |
| --------------------- | -------------------------------------------- |
| `npm run start`       | Inicia a aplicação                           |
| `npm run start:dev`   | Inicia em modo watch                         |
| `npm run start:debug` | Inicia em modo watch com debug               |
| `npm run start:prod`  | Executa o build gerado (`dist/main`)         |
| `npm run build`       | Compila o projeto                            |
| `npm run lint`        | Roda o ESLint com `--fix`                    |
| `npm run format`      | Formata o código com o Prettier              |
| `npx prisma db seed`  | Aplica o catálogo de permissões              |

## Estrutura do projeto

```
.adata/
  Dockerfile           # imagem multi-stage (development / build / production), usada também pelo CI
.gitlab-ci.yml         # pipeline de build, deploy e notificação

docker-compose.yml           # base
docker-compose.override.yml  # desenvolvimento (app + banco em container)
docker-compose.prod.yml      # produção (app + banco externo)

prisma/
  migrations/          # histórico de migrações
  seeders/catalog.ts   # módulos, operações e perfil admin
  seeders/seed.ts      # aplica o catálogo (roda no deploy)
  schema.prisma        # modelo de dados

src/
  authentication/      # login via SSO do Portal, whoami, estratégia JWT
  common/
    decorators/        # @Public, @CurrentUser, @AuthToken, ...
    dto/               # DTOs compartilhados (paginação, arquivos)
    enums/             # enums de domínio
    functions/         # helpers (datas, parsers, tokens)
    guards/            # AtGuard (global) e PermissionGuard
    minio/             # integração com MinIO
    queue/mail/        # fila Bull de envio de e-mails
    services/          # integrações e serviços (excel, pdf, mail, APIs)
    templates/         # templates Handlebars de e-mail
  database/            # PrismaModule / PrismaService
  modules/
    access-control/
      profiles/        # CRUD de perfis de acesso
      audit/           # repositório de audit_log
      notification/    # repositório de notification_log
  main.ts              # bootstrap, CORS, validação global e Swagger
```

## Endpoints principais

| Método | Rota                          | Descrição                       |
| ------ | ----------------------------- | ------------------------------- |
| `POST` | `/authentication/sso`         | Troca o código SSO do Portal e emite o token |
| `POST` | `/authentication/whoami`      | Dados do usuário autenticado    |
| `POST` | `/profiles`                   | Cria perfil                     |
| `GET`  | `/profiles`                   | Lista perfis (paginado)         |
| `GET`  | `/profiles/:id`               | Detalha perfil                  |
| `PATCH`| `/profiles/:id`               | Atualiza perfil                 |
| `PATCH`| `/profiles/:id/change-status` | Ativa/inativa perfil            |
| `DELETE`| `/profiles/:id`              | Remove perfil                   |

### Permissões por perfil

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/modules` | Módulos ativos com as operações que cada um oferece |
| `GET` | `/profile-operation` | Matriz atual: perfis ativos e suas operações |
| `POST` | `/profile-operation` | Substitui as operações dos perfis informados |

O `POST /profile-operation` recebe uma lista e **troca integralmente** as operações de cada perfil:

```json
[{ "identifier": "admin", "operations": ["show-machines", "edit-machines"] }]
```

Perfis não encontrados pelo `identifier` e operações inexistentes são ignorados, sem erro. Como as permissões viajam dentro do JWT, a alteração só vale para o usuário **após um novo login**.

### Notificações e registro de alterações

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/notification-log` | Histórico de notificações (paginado) |
| `GET` | `/notification-log/reports?type=pdf\|excel` | Exporta o histórico completo |
| `GET` | `/change-log` | Trilha de auditoria das alterações (paginado) |
| `GET` | `/change-log/reports?type=pdf\|excel` | Exporta a trilha completa |

Ambas as listagens aceitam filtro por `description` e por período (`start` / `end`, no formato `YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm`), e vêm ordenadas do mais recente para o mais antigo, já com o nome do usuário resolvido.

Os registros são gravados pelos próprios módulos de negócio, através do `AuditLogRepository` e do `NotificationRepository` — por exemplo, cadastrar ou editar uma máquina gera uma linha em cada um.

### Máquinas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/machines` | Lista máquinas (paginado) |
| `GET` | `/machines/:id` | Detalha máquina |
| `GET` | `/machines/select` | Lista `{id, code}` para campos de seleção |
| `GET` | `/machines/mes` | Máquinas do MES cruzadas com o cadastro local |
| `POST` | `/machines` | Cadastra máquina |
| `POST` | `/machines/mes` | Sincroniza máquinas em lote a partir do MES |
| `PATCH` | `/machines/:id` | Atualiza máquina |
| `PATCH` | `/machines/:id/change-status` | Ativa/inativa máquina |
| `DELETE` | `/machines/:id` | Exclusão lógica (`is_blocked = 1`) |

#### Importação de rotinas do RMS

Ao sincronizar máquinas (`POST /machines/mes`), o TMDB consulta o RMS e copia as rotinas, ações e códigos de motivo já configurados lá, evitando recadastro manual.

O fluxo, para cada máquina sincronizada:

1. Localiza a máquina no RMS pelo `code`
2. Busca as rotinas dessa máquina, com as ações aninhadas
3. Cria as rotinas no TMDB, reaproveitando ações existentes (mesmo `name` + `description`) e preservando a ordem de execução e os códigos de motivo

Três regras governam o comportamento:

| Situação | Resultado |
| --- | --- |
| Máquina já possui rotinas no TMDB | **Ignorada** — nunca sobrescreve ajuste manual |
| Máquina sem par no RMS, ou sem rotinas lá | Ignorada |
| RMS indisponível ou com erro | A sincronização **conclui normalmente**; a falha é registrada no log e contabilizada |

A resposta traz um resumo:

```json
{
	"message": "Máquinas sincronizadas com sucesso",
	"rms_import": { "enabled": true, "imported": 1, "skipped": 1, "failed": 0 }
}
```

Para desligar a importação, defina `ENABLE_RMS_IMPORT="false"` — a sincronização de máquinas segue funcionando normalmente.

> A integração é somente de leitura: o TMDB consome `GET /machines/select`, `GET /configuration/routines` e `GET /configuration/reason-code` do RMS, sem alterar nada lá.

### Configuração de máquinas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/configuration/routines` | Lista rotinas com ações e códigos de motivo |
| `GET` | `/configuration/routines/types` | Estados do MES que disparam rotinas |
| `GET` | `/configuration/routines/:id` | Detalha rotina |
| `POST` | `/configuration/routines` | Cria rotina |
| `POST` | `/configuration/routines/execute-command` | Executa a rotina na máquina |
| `PATCH` | `/configuration/routines/:id` | Atualiza rotina |
| `DELETE` | `/configuration/routines/:id` | Remove rotina |
| `GET` | `/configuration/actions` | Lista ações |
| `POST` | `/configuration/actions` | Cria ação |
| `PATCH` | `/configuration/actions/:id` | Atualiza ação |
| `DELETE` | `/configuration/actions/:id` | Remove ação |
| `PATCH` | `/configuration/routines-action` | Define as ações da rotina e sua ordem |
| `GET` | `/configuration/reason-code` | Lista códigos de motivo |
| `PATCH` | `/configuration/reason-code/:id` | Atualiza código de motivo |
| `DELETE` | `/configuration/reason-code/:code?routine_id=` | Remove código da rotina |

A lista completa e atualizada fica disponível no Swagger.

## Autenticação

O `AtGuard` é registrado como guard global (`APP_GUARD`), então **todas as rotas exigem um Bearer token JWT por padrão**. Para expor uma rota publicamente, use o decorator `@Public()`.

No Swagger, use o botão **Authorize** (esquema `JWT-auth`) e informe um token emitido pelo `/authentication/sso` — o mais simples é entrar no front pelo Portal e copiar o `access_token` do `localStorage`. O token fica persistido entre recarregamentos da página.

### Login via SSO do Portal ADATA

O TMDB não tem login próprio nem cadastro de usuários: o acesso é concedido pelo Portal ADATA. O fluxo é:

1. No Portal, o usuário clica no card do TMDB e o Portal abre `<SSO_FRONTEND_ORIGIN>/sso/bridge?state=...&returnTo=...`.
2. A bridge do front e o Portal trocam `portal:sso:ready` / `portal:sso:init` via `postMessage`; o front recebe um `sso_code` de uso único (TTL curto).
3. O front envia `sso_code`, `system_id`, `state` e `client_nonce` para `POST /authentication/sso`.
4. O backend troca o código em `POST <SSO_PORTAL_API_URL>/api/systems/sso/exchange` (header `x-api-key`) e recebe o usuário com seus `profiles` (aliases).
5. O perfil do TMDB é o **primeiro alias**, na ordem enviada pelo Portal, que corresponda ao `identifier` de um perfil ativo. Sem correspondência, a resposta é **403**.
6. O usuário é criado no primeiro acesso ou atualizado nos seguintes (nome, e-mail e perfil), sempre a partir do Portal. O vínculo é feito por `portal_user_id`; usuários anteriores ao SSO são vinculados pelo e-mail.

O código é consumido pelo Portal na primeira tentativa, válida ou não — um erro exige abrir o TMDB novamente pelo Portal.

**Cadastro do TMDB no Portal:**

| Campo | Valor |
| --- | --- |
| Modo | `sso` |
| `sso_origin` | Mesmo valor de `SSO_FRONTEND_ORIGIN` |
| `sso_path` | `/sso/bridge` |
| `sso_return_to` | `/` |
| Perfis | Aliases iguais aos `identifier` dos perfis do TMDB (ex.: `admin`) |

**Testando com o sandbox** (`sandbox_adata`): use `SSO_PORTAL_API_URL=http://localhost:3010`, `SSO_API_KEY=sandbox-api-key` e `SSO_SYSTEM_ID=1`, e no `.env` do sandbox aponte `SSO_SYSTEM_ORIGIN` para o front do TMDB. Os perfis seed do sandbox usam os aliases `administrator` e `supplier-user` — crie perfis com esses `identifier` no TMDB ou cadastre um sistema com aliases do TMDB pela tela *Sandbox Controls*.

### Permissões

Além do `AtGuard`, a maioria das rotas usa o `PermissionGuard`, que compara a operação exigida com a lista `operations` gravada no JWT. A cadeia é:

```
users.profile_id → profiles → profile_operation → operations.identifier
```

O login via SSO carrega essa cadeia e grava os identificadores no token; uma mudança de perfil no Portal só vale após um novo acesso pelo Portal. Um usuário **sem `profile_id`**, ou cujo perfil não tenha operações vinculadas, autentica normalmente mas recebe **403 em toda rota protegida** — só `/authentication/whoami` e as rotas públicas respondem.


## Segurança

| Recurso | Implementação |
| --- | --- |
| Cabeçalhos de segurança | `helmet` aplicado globalmente; `X-Powered-By` desabilitado |
| Rate limiting | `ThrottlerGuard` global: 20 req/s e 300 req/min por IP |
| Login | Somente via SSO do Portal; `/authentication/sso` limitado a 20 tentativas por minuto |
| Mass assignment | `ValidationPipe` com `whitelist: true` — propriedades não declaradas nos DTOs são descartadas |
| Validação de ambiente | `validateEnv()` interrompe o boot se faltar variável obrigatória |
| Senhas | O TMDB não armazena senhas |

### Regras adicionais em produção

Quando `NODE_ENV=production`, o boot é interrompido se:

- `JWT_AT_SECRET` ou `JWT_RT_SECRET` estiverem com valores de exemplo (`at-secret`, `rt-secret`)
- `SSO_API_KEY` estiver com a chave do sandbox (`sandbox-api-key`)
- `CORS_ORIGIN` estiver como `*`

O `CORS_ORIGIN` aceita múltiplas origens separadas por vírgula, por exemplo `https://app.exemplo.com,https://admin.exemplo.com`.

Para desabilitar o Swagger em produção, defina `SWAGGER_ENABLED="false"`.

## CI/CD

O pipeline do GitLab (`.gitlab-ci.yml`) roda nas branches `dev`, `test` e `prod`, em três estágios:

| Estágio | O que faz |
| --- | --- |
| `build` | Gera a imagem com `.adata/Dockerfile` e publica em `registry-sao.adata.com/<projeto>:<branch>` |
| `deploy` | Via SSH, baixa a imagem e atualiza o serviço Docker Swarm do ambiente |
| `notification` | Envia e-mail ao autor do push com o resultado do deploy |

| Branch | Ambiente | Serviço |
| ------ | -------- | ------- |
| `dev`  | Desenvolvimento | `dev-tmdb_backend` |
| `test` | Teste | `test-tmdb_backend` |
| `prod` | Produção | `tmdb_backend` |

Como o container aplica `prisma migrate deploy` e `prisma db seed` ao iniciar, toda migration e todo módulo novo do catálogo de permissões presentes na branch chegam ao banco do ambiente durante o deploy. Nenhum usuário é criado pelo deploy — veja [Primeiro deploy em um ambiente novo](#primeiro-deploy-em-um-ambiente-novo).
