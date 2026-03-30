# VAX Frontend - Cazenga Crowdfunding

Este é o frontend da plataforma VAX, construído com React, TypeScript, Tailwind CSS e Vite. 
Integrado com o backend em `https://vax-backend.vercel.app/`.

## Como Executar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Tecnologias Principais
- **React 18** + **Vite**
- **Tailwind CSS** (Estilização)
- **Lucide React** (Ícones)
- **Framer Motion** (Animações Premium)
- **Axios** (Comunicação com API)
- **Supabase SDK** (Upload de Imagens para Storage)

## Deploy no Vercel

1. Suba este código para um repositório no **GitHub**.
2. No dashboard da **Vercel**, importe o repositório.
3. Clique em **Deploy**. (As variáveis de ambiente do Supabase já estão configuradas no código para o demo, mas para produção recomenda-se usar `.env`).
