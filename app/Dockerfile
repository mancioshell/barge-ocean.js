FROM node:17-buster-slim AS build

WORKDIR /app
COPY package.json /app/
COPY yarn.lock /app/

RUN yarn install
COPY ./ /app/
RUN yarn build

FROM nginx:latest AS web

COPY --from=build /app/build/ /usr/share/nginx/html
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf.template

COPY docker-entrypoint.sh /

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]