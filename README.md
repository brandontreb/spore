# spore.blog

An Indie Web blog engine.

## 1. Install the packages

```bash
yarn install
```

## 2. Migrate the database

```bash
node_modules/.bin/sequelize db:migrate
```

## 3. Configure the environment

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Table of Contents

- [Features](#features)
- [Commands](#commands)
- [Environment Variables](#environment-variables)

## Features

TODO

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Port number
PORT=3000

# JWT
# JWT secret key
JWT_SECRET="correct horse battery staple"
```

## Install 

- [Server Setup](https://www.learnwithjason.dev/blog/deploy-nodejs-ssl-digitalocean)
- [SSL Setup](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)
- [Nginx Reverse Proxy Setup](https://engineerworkshop.com/blog/setup-an-nginx-reverse-proxy-on-a-raspberry-pi-or-any-other-debian-os/)