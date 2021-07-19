FROM node:12-alpine
WORKDIR /app

#Entry Point
COPY ./package.json ./

COPY ./ ./

#Rebuild bcrypt After bpm insatll
RUN apk add --no-cache make gcc g++ python && \
  npm install && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python

CMD ["npm","start"]