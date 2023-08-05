# Use official Node.js runtime as parent image
FROM node:18

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# Install any needed packages specified in package.json
RUN npm install

# Copy app source inside the docker image
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]