FROM node:alpine
WORKDIR /home/apollo-server
COPY ./package*.json ./
RUN npm i --quiet yarn -g
RUN yarn
COPY . .

CMD [ "yarn","dev" ]
