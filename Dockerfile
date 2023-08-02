FROM node:18.17.0-bullseye-slim

EXPOSE 3000

WORKDIR /opt/app

COPY --chown=node:node package.json yarn.lock /opt/app
RUN cd /opt/app \
     && yarn install --pure-lockfile

COPY --chown=node:node . /opt/app

USER node

CMD yarn start
