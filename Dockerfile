FROM node:10.15.1 as builder

COPY . workdir
WORKDIR workdir

RUN npm install --global yarn
RUN yarn install
RUN yarn build

FROM alpine:3.10.2

RUN apk --no-cache --update add \
  apache2 \
  apache2-ctl \
  apache2-http2 \
  apache2-proxy \
  apache2-ssl \
  apache2-utils \
  git \
  libxml2-dev \
  && true

COPY --from=builder /workdir/build/webpack /opt/deck/html/

COPY --from=builder /workdir/docker /opt/deck/bin/

WORKDIR /opt/deck

RUN adduser -D -G www-data www-data

RUN bin/setup-apache2.sh

RUN chown -R www-data:www-data /opt/deck

USER www-data

CMD bin/run-apache2.sh
