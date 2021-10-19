# Image de base
FROM node:14-alpine

# Changer le répertoire de travail
WORKDIR /app

# Installe les dépendences
COPY package.json /app/
RUN npm install && npm install -g nodemon

# Copie des fichiers du projet dans l'image
COPY . .

# Le port qui sera exposé par default (facultatif)
EXPOSE 8884

# Commande qui sera lancée au démarrage du container
CMD ["npm", "start"]