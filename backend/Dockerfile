# syntax=docker/dockerfile:1
# ==========================================================================
# FlowMetrics backend — imagen de producción (Render)
# --------------------------------------------------------------------------
# Build multi-etapa:
#   1) build:  compila y empaqueta el jar con Maven + JDK 21 (sin ejecutar tests:
#              los tests de integración requieren una base de datos).
#   2) runtime: JRE 21 mínimo; solo copia el jar.
#
# La configuración de conexión y demás secretos NO van en la imagen: se inyectan
# como variables de entorno en Render (ver docs/despliegue.md).
# Render debe arrancar con SPRING_PROFILES_ACTIVE=prod.
# ==========================================================================

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cachear dependencias
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Compilar (sin tests: requieren PostgreSQL)
COPY src ./src
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Límite de memoria relativo al contenedor (Render free = 512 MB).
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

COPY --from=build /app/target/backend-*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
