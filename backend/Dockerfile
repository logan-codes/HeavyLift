# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Cache Maven dependencies first (layer invalidates only on pom.xml change)
COPY pom.xml .
RUN mvn --batch-mode dependency:go-offline -f pom.xml

# Copy source and build (skip tests — they need a live DB)
COPY src ./src
RUN mvn --batch-mode -DskipTests package -f pom.xml

# ── Stage 2: run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# curl is needed for the Docker healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
