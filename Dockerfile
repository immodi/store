FROM node:18-alpine
WORKDIR /app
RUN npm install -g npm@9
COPY package*.json .

# Copy your custom theme.
COPY themes ./themes

COPY node_modules ./node_modules

# Copy your custom extensions.
COPY extensions ./extensions

# Copy your config.
COPY config ./config

# Copy your media.
COPY media ./media

# Copy your public files.
COPY public ./public

# Copy your translations.
COPY translations ./translations

# Build assets.
RUN npm run build

EXPOSE 80
CMD ["npm", "run", "start"]