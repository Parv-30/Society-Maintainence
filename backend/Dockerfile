FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

# Use nodemon for development
CMD ["npm", "run", "dev"]
