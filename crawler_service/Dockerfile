FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -Dmaven.test.skip=true


FROM debian:trixie-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y \
        openjdk-21-jre-headless \
        chromium \
        chromium-driver \
        fonts-liberation \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build \
    /app/target/crawler_service-0.0.1-SNAPSHOT.jar \
    ./crawler_service-0.0.1-SNAPSHOT.jar

COPY --from=build \
    /app/src/main/resources/application-prod.yml \
    ./application-prod.yml

CMD ["java","-jar","crawler_service-0.0.1-SNAPSHOT.jar","--spring.config.location=file:///app/application-prod.yml","--spring.profiles.active=prod"]