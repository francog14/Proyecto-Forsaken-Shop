# Forsaken Shop

Sistema web para la gestion de una tienda de ropa. El proyecto centraliza inventario, ventas, usuarios, pedidos y mensajeria interna para los actores principales del negocio: usuario, vendedor, bodeguero y administrador.

## Autores

- Franco Tomas Garay Millar

## Objetivo

Desarrollar una aplicacion web responsive para Forsaken Shop que permita reemplazar registros manuales por una plataforma digital conectada a microservicios Spring Boot y una interfaz Angular.

## Actores del sistema

- Usuario: revisa prendas disponibles, realiza compras y consulta pedidos.
- Vendedor: registra clientes, consulta stock, registra ventas y revisa pedidos.
- Bodeguero: administra prendas, stock, categorias y pedidos.
- Admin: revisa panel general, usuarios, catalogo, categorias, ventas y pedidos.

## Tecnologias

- Frontend: Angular, TypeScript, SCSS.
- Backend: Java, Spring Boot, Spring Data JPA.
- Base de datos: MySQL.
- Herramientas: Git, GitHub, Postman, VS Code.

## Estructura del proyecto

```txt
Proyecto-Forsaken-Shop/
  Backend/
    Auth-Microservicio/
    Categoria-Microservicio/
    Detalles-Ventas-Microservicio/
    Mensajeria-Microservicio/
    Pedido-Microservicio/
    Prenda-Microservicio/
    Rol-Microservicio/
    Usuario-Microservicio/
    Venta-Microservicio/
  Frontend/
    Frontend-Forsaken-Shop/
```

## Microservicios

| Microservicio | Puerto | Base de datos |
| --- | ---: | --- |
| Categoria | 7070 | categoria_db |
| Rol | 7075 | rol_db |
| Venta | 7077 | venta_db |
| Detalle Venta | 7078 | detalle_venta_db |
| Mensajeria | 7079 | mensajeria_db |
| Pedido | 7080 | pedido_db |
| Auth | 7081 | auth_db |
| Usuario | 7082 | usuario_db |
| Prenda | 7580 | prenda_db |

## Requisitos previos

- Java 21.
- Node.js y npm.
- MySQL ejecutandose en localhost.
- Bases de datos creadas segun la tabla de microservicios.

## Ejecucion del backend

Cada microservicio se ejecuta por separado desde su carpeta interna. Ejemplo:

```bash
cd Backend/Usuario-Microservicio/Microservicio-Usuario
./mvnw spring-boot:run
```

En Windows tambien se puede ejecutar:

```bash
mvnw.cmd spring-boot:run
```

Repetir el proceso con los microservicios necesarios para la funcionalidad que se quiera probar.

## Ejecucion del frontend

```bash
cd Frontend/Frontend-Forsaken-Shop
npm install
npm start
```

Luego abrir:

```txt
http://localhost:4200
```

## Cuentas demo

| Rol | Correo | Password |
| --- | --- | --- |
| Admin | admin@forsaken.cl | admin123 |
| Vendedor | vendedor@forsaken.cl | vendedor123 |
| Bodeguero | bodega@forsaken.cl | bodega123 |
| Usuario | cliente@forsaken.cl | cliente123 |

## Funcionalidades principales

- Inicio de sesion por rol.
- Vista de tienda para usuario.
- Panel de vendedor con registro de ventas.
- Panel de bodega para control de inventario.
- Panel admin con gestion general.
- Mantenedores de usuarios, roles, categorias y prendas.
- Registro y consulta de pedidos.
- Mensajeria interna de soporte.

## Verificacion

Comandos usados para validar el frontend:

```bash
npm run build
npm test -- --watch=false
```

Los microservicios se pueden validar levantando cada servicio y probando sus endpoints con Postman o desde el frontend Angular.
