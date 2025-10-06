FROM nginx:1.25-alpine

RUN apk add --no-cache gettext

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/entrypoint.sh /docker-entrypoint.sh
COPY algorithm-game /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080
ENV PORT=8080

CMD ["/docker-entrypoint.sh"]
