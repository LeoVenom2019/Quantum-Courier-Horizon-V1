FROM node:20-alpine AS base

# Definir diretório de trabalho
WORKDIR /app

# Copiar os arquivos de dependências
COPY package.json package-lock.json ./

# Instalar as dependências
RUN npm ci

# Copiar todo o resto do projeto (respeitando o .dockerignore)
COPY . .

# Fazer o build do Next.js
RUN npm run build

# Expor a porta que o Next.js usa
EXPOSE 3000

# Iniciar o servidor de produção do Next.js
CMD ["npm", "start"]
