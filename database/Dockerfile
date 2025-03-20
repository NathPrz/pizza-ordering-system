FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=password
ENV MYSQL_DATABASE=pizza_db
ENV MYSQL_USER=pizza_user
ENV MYSQL_PASSWORD=pizza_password

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306