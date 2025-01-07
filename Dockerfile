# Use an official Node.js runtime as the base image
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3005

# Command to run the application
CMD ["npx", "tsx", "main.ts", "--dir=/root/content", "--port=3005"]

#将这个文件打包成docker镜像
#docker build -t dodola/js-mdx-server:0.2 .
# 上传到dockerhub
#docker push dodola/js-mdx-server:0.2