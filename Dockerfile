# Usa a imagem do Node.js com Alpine para ser leve
FROM node:22.14-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instala o Quasar CLI globalmente
RUN npm install -g @quasar/cli

# Expõe a porta padrão do Quasar
EXPOSE 8087

# Comando padrão para manter o contêiner rodando
CMD ["sh"]
