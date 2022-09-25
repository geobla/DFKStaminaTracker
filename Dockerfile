# Install node//
FROM node:current-alpine3.14

# Add source code to docker image //
WORKDIR /usr/src/app

# Install dependencies first for caching reasons, so we don't have to reinstall all node 
# modules every time we change source code. COPY json file in container //
COPY package*.json ./

# Run npm install //
RUN npm install 

# Copy source code, but ignore host node_modules. We accomplish this with dockerignore file //
COPY . .

# Use environment variable to run code //
ENV PORT=8080

EXPOSE 8080 

# Run the app //
CMD [ "npm", "start" ]