# MãeGuia DF

SaaS para mães atípicas do Distrito Federal. Projeto React + Vite, pronto para deploy na Vercel.

## Como publicar na Vercel (passo a passo)

### 1. Suba o projeto para o GitHub
- Crie uma conta em https://github.com (se ainda não tiver).
- Crie um repositório novo (botão "New repository"). Pode deixar como público.
- Faça upload de TODOS os arquivos desta pasta para o repositório.
  - Forma simples: na página do repositório recém-criado, clique em "uploading an existing file" e arraste todos os arquivos e a pasta `src`.
  - NÃO precisa enviar a pasta `node_modules` (ela nem existe ainda).

### 2. Conecte na Vercel
- Crie uma conta em https://vercel.com (pode entrar com a conta do GitHub).
- Clique em "Add New..." → "Project".
- Selecione o repositório que você acabou de criar.
- A Vercel detecta automaticamente que é um projeto Vite. Não precisa mudar nada.
- Clique em "Deploy".

### 3. Pronto
- Em 1-2 minutos a Vercel mostra um link tipo `https://maeguia-df.vercel.app`.
- Abra esse link no navegador do celular.
- A câmera vai funcionar de verdade porque a Vercel serve em HTTPS.

## Rodar localmente (opcional, no seu computador)
```
npm install
npm run dev
```

## Observações
- A câmera ("Tirar Foto do Laudo") só abre em dispositivo real via HTTPS. No desktop ela abre o seletor de arquivos comum — é o comportamento esperado.
- A sessão de login persiste enquanto a aba estiver aberta. Para persistir mesmo após fechar o navegador, troque as funções `loadStore`/`saveStore` em `src/MaeGuiaDF.jsx` por `localStorage` (o código tem um comentário indicando onde).
