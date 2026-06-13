FROM eclipse-temurin:21-jdk-jammy

WORKDIR /Microservicio-usuarios

COPY *.jar app.jar

EXPOSE 7082

ENTRYPOINT ["java", "-jar", "app.jar"]