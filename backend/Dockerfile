FROM node:22-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência primeiro (para aproveitar o cache do Docker)
COPY package.json package-lock.json ./

# Instala TODAS as dependências (incluindo as de desenvolvimento)
RUN npm install

# Copia o resto do código-fonte
COPY . .

# Roda o script de build do NestJS (compila TypeScript para JavaScript)
RUN npm run build

# Começa de uma imagem Node.js limpa
FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência do estágio de build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Instala APENAS as dependências de produção
RUN npm install

# Copia o código JavaScript compilado (a pasta 'dist') do estágio de build
COPY --from=builder /app/dist ./dist

# Expõe a porta que o NestJS usa (definida no seu main.ts)
EXPOSE 3000

# O comando para iniciar a aplicação
CMD ["node", "dist/main"]