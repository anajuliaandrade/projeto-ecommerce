# Documentacao do Product Description

## Visao geral

O projeto possui duas partes executadas ao mesmo tempo:

- `client`: frontend React que aparece no navegador.
- `server`: backend Express que recebe requisicoes e executa as regras.

Quando `npm.cmd run dev` e executado, o frontend abre na porta `5173` e o
backend na porta `3333`.

## Estrutura

```text
files-mentioned-by-the-user-product/
|-- client/
|   |-- index.html
|   |-- src/
|       |-- main.jsx
|       |-- styles.css
|-- server/
|   |-- src/
|       |-- index.js
|   |-- prisma/
|       |-- schema.prisma
|-- package.json
|-- README.md
```

## Frontend

O frontend esta em `client`.

### `client/src/main.jsx`

Este arquivo contem toda a interface React:

- `request`: envia requisicoes para o backend e inclui o token JWT.
- `Auth`: exibe as telas de cadastro e login.
- `Generator`: exibe o formulario do produto e os textos gerados.
- `ResultCard`: exibe cada resultado e permite copiar seu conteudo.
- `App`: controla usuario autenticado, navegacao e favoritos.

O token e o usuario autenticado ficam no `localStorage` do navegador. Isso
permite atualizar a pagina sem perder imediatamente a sessao.

### `client/src/styles.css`

Define cores, tamanhos, fontes, espacamentos e adaptacao para telas menores.

## Backend

O backend esta em `server/src/index.js`.

### Dados temporarios

Os arrays `users` e `favorites` simulam um banco de dados. Eles permitem testar
o projeto sem instalar PostgreSQL, mas sao apagados quando o servidor reinicia.

### Autenticacao

1. `POST /auth/register` valida os dados, cria o hash da senha e cadastra o usuario.
2. `POST /auth/login` compara a senha informada com o hash salvo.
3. As duas rotas retornam um token JWT.
4. A funcao `auth` valida esse token antes de liberar rotas privadas.

### Geracao das descricoes

`POST /descriptions/generate` recebe os campos preenchidos no frontend.
A funcao `generateDescription` combina esses dados em templates locais e retorna:

- titulo otimizado;
- descricao curta;
- descricao completa;
- beneficios;
- hashtags;
- texto para anuncio.

Essa geracao nao utiliza servicos ou APIs pagas de inteligencia artificial.

### Favoritos

- `GET /favorites`: lista somente os favoritos do usuario autenticado.
- `POST /favorites`: salva uma descricao.
- `DELETE /favorites/:id`: exclui um favorito do usuario.

## Fluxo completo

```text
Usuario abre o frontend
  -> cria uma conta ou entra
  -> backend devolve um token JWT
  -> frontend envia o token nas proximas requisicoes
  -> usuario preenche os dados do produto
  -> backend gera os textos
  -> usuario pode copiar ou salvar o resultado
```

## Como executar

Abra a pasta do projeto no VS Code:

```text
C:\Users\anaju\Documents\Codex\2026-06-08\files-mentioned-by-the-user-product
```

No terminal integrado, execute:

```powershell
npm.cmd run dev
```

Abra `http://localhost:5173` no navegador.
