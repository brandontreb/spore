FROM node:alpine

RUN mkdir -p /usr/src/spore && chown -R node:node /usr/src/spore

WORKDIR /usr/src/spore

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]