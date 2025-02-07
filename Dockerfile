FROM 851725200411.dkr.ecr.ap-southeast-1.amazonaws.com/shared/base/node:20-alpine as development
ENV NODE_ENV=development
WORKDIR /usr/src/app

COPY . .
RUN npm ci

FROM 851725200411.dkr.ecr.ap-southeast-1.amazonaws.com/shared/base/node:20-alpine as builder
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=development /usr/src/app .
RUN npm run build
RUN npm prune --omit=dev

FROM 851725200411.dkr.ecr.ap-southeast-1.amazonaws.com/shared/base/node:20-alpine as production
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
RUN chown -R node:node /usr/src/app
USER node
CMD [ "node", "dist/main.js" ]
