# node-mongo-jwt

`docker-compose build`

`docker-compose up -d`

`npm init -y`

`npm start`

or 

`npm run dev`

fix Error: `/app/node_modules/bcrypt/lib/binding/bcrypt_lib.node: invalid ELF header`

# Solution to first problem, setup Dockerfile to build Bcrypt
In your Dockerfile run this:

`RUN apk add --no-cache make gcc g++ python && \
  npm install && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python`

https://www.richardkotze.com/top-tips/install-bcrypt-docker-image-exclude-host-node-modules

