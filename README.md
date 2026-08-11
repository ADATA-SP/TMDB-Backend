# TMDB — Backend

API REST em NestJS para o TMDB, com autenticação via LDAP + JWT, persistência em SQL Server através do Prisma e documentação automática em Swagger.

## Stack

| Camada          | Tecnologia                        |
| --------------- | --------------------------------- |
| Framework       | NestJS 10                         |
| ORM             | Prisma 6.10 (adapter MSSQL)       |
| Banco           | SQL Server                        |
| Autenticação    | LDAP (`ldapts`) + JWT (Passport)  |
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

#### LDAP

| Variável         | Exemplo                        |
| ---------------- | ------------------------------ |
| `LDAP_SERVER`    | `ldap://SERVIDOR:389`          |
| `LDAP_BASE`      | `DC=exemplo,DC=org,DC=br`      |
| `LDAP_USER`      | usuário de bind                |
| `LDAP_PASSWORD`  | senha de bind                  |
| `LDAP_ATTRIBUTE` | `sAMAccountName`               |

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
npx prisma db seed
```

O seed monta toda a cadeia de controle de acesso:

| Registro | Conteúdo |
| --- | --- |
| `modules` | `users`, `machines` e `permissions` |
| `operations` | 11 operações, no formato `<ação>-<módulo>` (ex.: `show-users`, `sync-machines`) |
| `profiles` | Perfil `admin` (Administrador) |
| `profile_operation` | Vincula **todas** as operações ao perfil `admin` |
| `users` | Usuário `admin` / senha `admin`, associado ao perfil `admin` |

O seed é idempotente e também **repara** um admin já existente que esteja sem `profile_id`.

> Ao implementar novos módulos, acrescente o módulo e suas operações em `modulesDataQuery` no [seed.ts](prisma/seeders/seed.ts) e rode o seed novamente — as operações novas são vinculadas ao perfil `admin` automaticamente.

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

Ou seja: no ambiente de desenvolvimento as migrations e o seed **rodam automaticamente** a cada subida. O banco é criado pelo próprio `migrate deploy` e o seed é idempotente (`upsert`), então repetir não causa efeito colateral. Na primeira subida a aplicação já nasce com a tabela `users` e o admin criado.

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

Nessa combinação o `override` não é carregado, então **não há container de banco**: sobe apenas o `app`, no estágio `production` (`node dist/main`, sem bind mount e sem devDependencies), apontando para a `DATABASE_URL` externa do `.env`.

As migrations não são aplicadas automaticamente aqui — rode-as de forma controlada no deploy:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Testar

```
http://localhost:3001/swagger
```

(a porta segue a `APP_PORT` do `.env`)

### Estágios da imagem

O `.build/Dockerfile` é multi-stage:

| Estágio       | Uso                                                                 |
| ------------- | ------------------------------------------------------------------- |
| `deps`        | Instala as dependências (camada reaproveitada em cache)             |
| `development` | Dependências completas + `npm run start:dev`                        |
| `build`       | Gera o `dist` com `npm run build`                                   |
| `production`  | Apenas dependências de produção + `dist` + `node dist/main`         |

Para gerar a imagem de produção manualmente:

```bash
docker build -f .build/Dockerfile --target production -t tmdb-backend .
```

> O pipeline do GitLab não usa este Dockerfile — ele constrói a imagem a partir do `Dockerfile.node22.18.pnpm.nest` do repositório `environment/cicd`. O `.build/Dockerfile` serve ao uso local e a builds manuais.

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
| `npx prisma db seed`  | Executa o seed (`prisma/seeders/seed.ts`)    |

## Estrutura do projeto

```
.build/
  Dockerfile           # imagem multi-stage (development / build / production)

docker-compose.yml           # base
docker-compose.override.yml  # desenvolvimento (app + banco em container)
docker-compose.prod.yml      # produção (app + banco externo)

prisma/
  migrations/          # histórico de migrações
  seeders/seed.ts      # dados iniciais (usuário admin)
  schema.prisma        # modelo de dados

src/
  authentication/      # sign-in, whoami, estratégia JWT
  common/
    decorators/        # @Public, @CurrentUser, @AuthToken, ...
    dto/               # DTOs compartilhados (paginação, arquivos)
    enums/             # enums de domínio
    functions/         # helpers (datas, hash, parsers, tokens)
    guards/            # AtGuard (global) e PermissionGuard
    minio/             # integração com MinIO
    queue/mail/        # fila Bull de envio de e-mails
    services/          # integrações e serviços (excel, pdf, mail, APIs)
    templates/         # templates Handlebars de e-mail
    validators/        # validadores de senha
  database/            # PrismaModule / PrismaService
  ldap/                # integração com o servidor LDAP
  modules/
    access-control/
      profiles/        # CRUD de perfis de acesso
      audit/           # repositório de audit_log
      notification/    # repositório de notification_log
    users/             # CRUD de usuários
  main.ts              # bootstrap, CORS, validação global e Swagger
```

## Endpoints principais

| Método | Rota                          | Descrição                       |
| ------ | ----------------------------- | ------------------------------- |
| `POST` | `/authentication/sign-in`     | Autenticação e emissão do token |
| `POST` | `/authentication/whoami`      | Dados do usuário autenticado    |
| `POST` | `/users`                      | Cria usuário                    |
| `GET`  | `/users`                      | Lista usuários (paginado)       |
| `GET`  | `/users/search-account-name`  | Busca conta no LDAP             |
| `GET`  | `/users/:id`                  | Detalha usuário                 |
| `PATCH`| `/users/:id`                  | Atualiza usuário                |
| `PATCH`| `/users/:id/change-status`    | Ativa/inativa usuário           |
| `PUT`  | `/users/change-password`      | Altera a senha                  |
| `DELETE`| `/users/:id`                 | Remove usuário                  |
| `POST` | `/profiles`                   | Cria perfil                     |
| `GET`  | `/profiles`                   | Lista perfis (paginado)         |
| `GET`  | `/profiles/:id`               | Detalha perfil                  |
| `PATCH`| `/profiles/:id`               | Atualiza perfil                 |
| `PATCH`| `/profiles/:id/change-status` | Ativa/inativa perfil            |
| `DELETE`| `/profiles/:id`              | Remove perfil                   |

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

No Swagger, use o botão **Authorize** (esquema `JWT-auth`) e informe o token retornado pelo `/authentication/sign-in`. O token fica persistido entre recarregamentos da página.

### Permissões

Além do `AtGuard`, a maioria das rotas usa o `PermissionGuard`, que compara a operação exigida com a lista `operations` gravada no JWT. A cadeia é:

```
users.profile_id → profiles → profile_operation → operations.identifier
```

O login carrega essa cadeia e grava os identificadores no token. Um usuário **sem `profile_id`**, ou cujo perfil não tenha operações vinculadas, autentica normalmente mas recebe **403 em toda rota protegida** — só `/authentication/whoami` e as rotas públicas respondem.

Credenciais padrão após o seed: `admin` / `admin`, com as 11 operações liberadas.

## Segurança

| Recurso | Implementação |
| --- | --- |
| Cabeçalhos de segurança | `helmet` aplicado globalmente; `X-Powered-By` desabilitado |
| Rate limiting | `ThrottlerGuard` global: 20 req/s e 300 req/min por IP |
| Proteção de força bruta | `/authentication/sign-in` limitado a 5 tentativas por minuto |
| Mass assignment | `ValidationPipe` com `whitelist: true` — propriedades não declaradas nos DTOs são descartadas |
| Validação de ambiente | `validateEnv()` interrompe o boot se faltar variável obrigatória |
| Senhas | Armazenadas com hash `bcrypt` |

### Regras adicionais em produção

Quando `NODE_ENV=production`, o boot é interrompido se:

- `JWT_AT_SECRET` ou `JWT_RT_SECRET` estiverem com valores de exemplo (`at-secret`, `rt-secret`)
- `CORS_ORIGIN` estiver como `*`

O `CORS_ORIGIN` aceita múltiplas origens separadas por vírgula, por exemplo `https://app.exemplo.com,https://admin.exemplo.com`.

Para desabilitar o Swagger em produção, defina `SWAGGER_ENABLED="false"`.

## CI/CD

O pipeline do GitLab (`.gitlab-ci.yml`) possui dois estágios:

- **test** — análise de código com SonarQube (apenas na branch `main`)
- **deploy** — build da imagem e atualização do serviço, por ambiente:

| Branch | Ambiente        |
| ------ | --------------- |
| `dev`  | Desenvolvimento |
| `test` | Teste           |
| `main` | Produção        |
