FROM node:14.15.4-slim AS builder

RUN yarn global add truffle
WORKDIR /app
ADD . /app
COPY .env.example ./.env
RUN echo ".secret" > .secret
RUN yarn install
RUN yarn build

FROM node:14.15.4-slim AS runtime
WORKDIR /app
COPY --from=builder /app/.env.example /app
COPY --from=builder /app/build/ /app
COPY --from=builder /app/package.json /app
RUN yarn install --production=true
ENTRYPOINT ["node", "/app/src/bot.js"]
