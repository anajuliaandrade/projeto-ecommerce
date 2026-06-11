# Product Description

Este projeto foi desenvolvido por mim para fins de estudo, prática e
aprimoramento dos meus conhecimentos em desenvolvimento web full stack.

A aplicação simula uma ferramenta de criação de descrições de produtos para
e-commerce, permitindo praticar conceitos como React, Node.js, APIs REST,
autenticação JWT, integração entre frontend e backend e organização de projetos.

Por ser um projeto educacional e demonstrativo, ele nao utiliza APIs pagas de
inteligencia artificial nem banco de dados. Os dados sao armazenados
temporariamente na memoria do backend.

## Como executar

1. Instale as dependencias:
   `npm install && npm run install:all`
2. Inicie frontend e backend:
   `npm run dev`

Frontend: `http://localhost:5173`  
API: `http://localhost:3333`

## Onde esta o frontend?

O frontend fica na pasta `client`:

- `client/src/main.jsx`: telas, componentes, estados e chamadas para a API.
- `client/src/styles.css`: cores, layout e responsividade.
- `client/index.html`: pagina HTML inicial carregada pelo Vite.

Para entender o projeto passo a passo, consulte [DOCUMENTACAO.md](DOCUMENTACAO.md).

## Observacao

Usuarios e favoritos ficam armazenados temporariamente na memoria do backend.
Ao encerrar ou reiniciar o servidor, os dados cadastrados sao apagados.
O schema Prisma permanece no projeto apenas como referencia para uma futura integracao com PostgreSQL.
