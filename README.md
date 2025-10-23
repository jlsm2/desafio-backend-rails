# API - Biblioteca Digital (Desafio Backend)

API RESTful desenvolvida em NestJS para gerenciar uma plataforma de biblioteca digital, como parte de um desafio técnico. Permite o gerenciamento de Materiais (Livros, Artigos, Vídeos) e Autores (Pessoas, Instituições), com autenticação JWT e validação de dados rigorosa. O projeto é containerizado com Docker para facilitar a configuração e execução.

## Funcionalidades Implementadas

* **Autenticação Segura:** Sistema completo de registro e login de usuários via e-mail/senha, utilizando JWT (JSON Web Tokens) para proteger endpoints. Senhas são armazenadas com hash bcrypt.
* **Gerenciamento de Autores:** CRUD completo para Autores, suportando dois tipos distintos (Pessoa e Instituição) com campos e validações específicas, utilizando herança (Single Table Inheritance) no TypeORM.
* **Gerenciamento de Materiais:** CRUD completo para Materiais, suportando tipos Livro, Artigo e Vídeo, cada um com seus campos e validações (ISBN/DOI únicos, etc.), também utilizando herança no TypeORM.
* **Controle de Permissão:** Implementada regra de negócio crucial: apenas o usuário que cadastrou um material pode alterá-lo ou removê-lo.
* **Integração com API Externa:** Ao cadastrar um Livro sem título ou número de páginas, a API consulta a [OpenLibrary Books API](https://openlibrary.org/developers/api) usando o ISBN fornecido para preencher esses campos automaticamente.
* **Busca e Paginação:** Endpoint `GET /api/material` permite buscar materiais por termo (título, descrição, nome do autor) com resultados paginados (`?pagina=X&limite=Y`).
* **Validação Robusta:** Utilização intensiva de `class-validator` e `class-transformer` em DTOs para garantir que todos os dados recebidos pela API sigam as regras especificadas no desafio (campos obrigatórios, formatos, tamanhos, valores únicos).
* **Documentação Interativa:** Geração automática de documentação via Swagger (OpenAPI), acessível em `/api-docs`. *(Observação sobre a autenticação abaixo).*
* **Testes Automatizados:** Testes unitários com Jest para garantir a lógica de negócio dos serviços principais (Autenticação, CRUD de Autor, CRUD de Material com permissões e API externa). Cobertura acima de 80%.
* **Containerização:** Aplicação e banco de dados (PostgreSQL) totalmente configurados para rodar com Docker e Docker Compose, garantindo um ambiente de desenvolvimento consistente.
* **(Diferencial) Endpoint GraphQL:** Implementada uma consulta GraphQL básica (`/graphql`) para listar autores, demonstrando a capacidade de usar diferentes protocolos de API.
* **(Diferencial) Deploy:** Aplicação deployada online via Render.

## Tecnologias Utilizadas

* **Backend Framework:** NestJS (v11)
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL (Imagem Docker `postgres:15` / Render Managed DB)
* **ORM:** TypeORM
* **Autenticação:** JWT (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`)
* **Validação:** `class-validator`, `class-transformer`
* **Requisições HTTP:** `@nestjs/axios`
* **Documentação:** `@nestjs/swagger` (v11)
* **GraphQL:** `@nestjs/graphql`, `@nestjs/apollo` (v13), `@apollo/server`
* **Testes:** Jest (`@nestjs/testing`)
* **Containerização:** Docker, Docker Compose
* **Deploy:** Render (via `render.yaml`)
* **Ambiente Node.js:** Node.js v22 (via Dockerfile)

---

## Configuração do Ambiente de Desenvolvimento

**Pré-requisitos:**
* Git
* Node.js (v22 LTS recomendado para consistência, mas o Docker cuidará disso)
* NPM
* Docker
* Docker Compose

**Passos:**

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/jlsm2/desafio-backend-rails.git
    ```

2.  **Configurar Variáveis de Ambiente:**
    * Crie um arquivo chamado `.env` na **raiz** do projeto (na mesma pasta do `docker-compose.yml`).
    * Copie e cole o conteúdo abaixo no arquivo `.env`, substituindo `JWT_SECRET_KEY` por uma string aleatória e segura:
        ```env
        # Postgres Config (para Docker local)
        DB_HOST=postgres-db
        DB_PORT=5432
        DB_USER=biblioteca_admin
        DB_PASSWORD=admin123
        DB_NAME=biblioteca_db

        # JWT Config
        JWT_SECRET=JWT_SECRET_KEY
        JWT_EXPIRES_IN=1d
        ```
    * **(Importante):** Este arquivo `.env` está no `.gitignore` e não deve ser enviado ao GitHub.

3.  **Subir os Containers Docker (Desenvolvimento):**
    * Na pasta **raiz** do projeto, execute o comando:
        ```bash
        docker-compose up --build -d
        ```
    * Este comando fará o build da imagem do backend (pode demorar na primeira vez) e iniciará os containers do `backend` e `postgres-db` usando o `Dockerfile.dev` e o `docker-compose.yml` padrão.
    * A API estará disponível em `http://localhost:3000`.

---

## Acesso à Aplicação em Produção (Render)

A API foi deployada e está acessível publicamente através do Render.

**URL Base da API:**
`https://biblioteca-zr5o.onrender.com`

**Endpoints Importantes:**

* **Documentação Interativa (Swagger UI):**
    `https://biblioteca-zr5o.onrender.com/api-docs`
    *(Lembre-se da observação sobre a autenticação no Swagger UI mencionada anteriormente. Use Insomnia/Postman para testes autenticados).*

* **GraphQL Playground:**
    `https://biblioteca-zr5o.onrender.com/graphql`

* **Endpoints da API (Exemplos):**
    * `POST https://biblioteca-zr5o.onrender.com/api/auth/login`
    * `GET https://biblioteca-zr5o.onrender.com/api/autor` (requer token)

## Uso da API

A API segue os padrões RESTful e está prefixada com `/api`. Todos os endpoints (exceto `/api/auth/register` e `/api/auth/login`) exigem autenticação via Bearer Token JWT.

### 1. Autenticação (`/api/auth`)

* **Registrar um novo usuário:**
    * `POST /api/auth/register`
    * **Body (JSON):** `{ "email": "user@example.com", "senha": "password123" }` (Senha mín. 6 caracteres)
    * **Resposta (201 Created):** `{ "id_usuario": 1, "email": "user@example.com" }`

* **Fazer Login:**
    * `POST /api/auth/login`
    * **Body (JSON):** `{ "email": "user@example.com", "senha": "password123" }`
    * **Resposta (200 OK):** `{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`

### 2. Usando o Token JWT

Copie o valor do `access_token` retornado no login. Para acessar endpoints protegidos, inclua o seguinte cabeçalho HTTP em suas requisições:

`Authorization: Bearer <seu_access_token>`

### 3. Endpoints Principais (Exemplos)

*(Consulte a documentação Swagger em `/api-docs` na URL de produção para detalhes completos de DTOs e respostas)*

* **Autores (`/api/autor`)**
    * `POST /pessoa`: Cria um autor pessoa.
    * `POST /instituicao`: Cria um autor instituição.
    * `GET /`: Lista todos os autores.
    * `GET /:id`: Busca um autor específico.
    * `PATCH /:id`: Atualiza um autor.
    * `DELETE /:id`: Remove um autor.

* **Materiais (`/api/material`)**
    * `POST /livro`: Cria um livro.
    * `POST /artigo`: Cria um artigo.
    * `POST /video`: Cria um vídeo.
    * `GET /?pagina=1&limite=10&termo=...`: Busca materiais com paginação e filtro.
    * `GET /:id`: Busca um material específico.
    * `PATCH /:id`: Atualiza um material (apenas o criador).
    * `DELETE /:id`: Remove um material (apenas o criador).

* **Usuário (`/api/usuario`)**
    * `GET /me`: Retorna os dados do usuário logado (sem senha).
    * `PATCH /:id`: Atualiza os dados do usuário (apenas o próprio usuário).
    * `DELETE /:id`: Remove a conta do usuário (apenas o próprio usuário).

*(Observação sobre Autenticação no Swagger UI mantida da versão anterior)*

*(Seção Endpoint GraphQL mantida da versão anterior)*

## Testes Automatizados

Os testes unitários foram escritos usando Jest e cobrem a lógica principal dos serviços (`AuthService`, `AutorService`, `MaterialService`), garantindo o funcionamento de:

* **Autenticação:** Registro (com hash de senha e checagem de e-mail duplicado) e Login (validação de credenciais e geração de token).
* **Criação de Entidades:** Criação correta dos diferentes tipos de Autores (Pessoa, Instituição) e Materiais (Livro, Artigo, Vídeo), incluindo a lógica de herança.
* **Validações:** Checagem de unicidade para e-mail, ISBN e DOI durante a criação e atualização. Verificação da existência de Autores ao associá-los a Materiais.
* **Permissões:** Validação de que apenas o usuário criador pode alterar ou remover um Material.
* **API Externa:** Simulação da chamada à API OpenLibrary e verificação do preenchimento automático de dados do Livro.
* **Busca:** Simulação da busca paginada e com filtro de termo para Materiais.

**Como Rodar os Testes:**

1.  Certifique-se de que as dependências de desenvolvimento estão instaladas (o `docker-compose up` cuida disso no ambiente de desenvolvimento).
2.  Execute o comando na pasta `backend/` localmente, ou dentro do container:
    ```bash
    npm run test:cov
    ```
    *(Opcional: use `npm run test` para rodar sem calcular cobertura).*

## Regras de Negócio Chave Implementadas

* **Unicidade:** E-mails de usuários, ISBNs de livros e DOIs de artigos devem ser únicos no sistema. A API retorna `409 Conflict` se houver tentativa de duplicidade.
* **Validação de Dados:** Todos os campos de entrada (Body, Query Params) são validados via DTOs (`class-validator`) quanto a tipo, formato, tamanho e obrigatoriedade, conforme especificado no desafio. Requisições inválidas retornam `400 Bad Request` com mensagens claras.
* **Integridade Referencial:** A API verifica se o `id_autor` fornecido ao criar um Material corresponde a um autor existente no banco de dados. Caso contrário, retorna `400 Bad Request`.
* **Propriedade de Materiais:** As rotas `PATCH /api/material/:id` e `DELETE /api/material/:id` verificam se o `id_usuario` do token JWT corresponde ao `id_usuario_criador` do material. Se não corresponder, a API retorna `403 Forbidden`.
* **Status Controlado:** O campo `status` dos Materiais só aceita os valores definidos no enum (`rascunho`, `publicado`, `arquivado`), garantido pela validação `@IsEnum` no DTO.
* **API Externa (OpenLibrary):** Na criação de Livros (`POST /api/material/livro`), se os campos `titulo` ou `numero_paginas` não forem fornecidos, o serviço tenta buscá-los na API OpenLibrary usando o `isbn`. Falhas na API externa são registradas no console, mas não impedem o cadastro se os dados essenciais (ISBN, autor) estiverem presentes e válidos (embora uma validação adicional no serviço garanta que título e páginas existam *antes* de salvar).
* **Segurança de Senhas:** Senhas nunca são retornadas pela API (exceto no processo interno de validação do login) e são armazenadas no banco de dados usando hash bcrypt.