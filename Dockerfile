# Utiliser une image légère de Node.js
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du projet
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]

