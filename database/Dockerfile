FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=password \
    MYSQL_DATABASE=pizza_db \
    MYSQL_USER=pizza_user \
    MYSQL_PASSWORD=pizza

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306