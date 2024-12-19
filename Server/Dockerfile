FROM node:16


WORKDIR /index

COPY package*.json ./

RUN npm install 

COPY . .


RUN npm install -g typescript



EXPOSE 4200

CMD ["node", "Server/index.js"]
