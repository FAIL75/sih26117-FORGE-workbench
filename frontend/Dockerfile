FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]