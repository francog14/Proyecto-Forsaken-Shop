# Forsaken Shop

Sistema integral de gestion retail para una tienda de ropa. El proyecto reemplaza registros manuales por una aplicacion web conectada a microservicios Spring Boot, permitiendo administrar inventario, usuarios, ventas, pedidos y mensajeria interna segun el actor que inicia sesion.

## Datos del proyecto

- Autor: Franco Tomas Garay Millar.
- Profesor: Guillermo Matias Villacura Torres.
- Proyecto: Forsaken Shop.
- Stack: Angular, TypeScript, SCSS, Java, Spring Boot, Spring Data JPA y MySQL.
- Arquitectura: frontend web responsive y backend separado por microservicios REST.

## Actores

| Actor | Acceso principal |
| --- | --- |
| Usuario | Vitrina de prendas, compra simulada y consulta de pedidos. |
| Vendedor | Panel de ventas, clientes, stock, mensajes y pedidos. |
| Bodeguero | Inventario, prendas, categorias y gestion de pedidos. |
| Admin | Panel general, usuarios, ventas, catalogo, categorias y pedidos. |

## Modulos implementados

- Autenticacion por rol.
- Gestion de usuarios y roles.
- Gestion de categorias.
- Gestion de prendas e inventario.
- Registro de ventas.
- Registro de detalle de ventas.
- Registro y seguimiento de pedidos.
- Mensajeria interna de soporte.
- Frontend Angular con vistas diferenciadas por actor.

## Estructura

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
    consultas.rest
    setup_databases.sql
  Frontend/
    Frontend-Forsaken-Shop/
```

## Microservicios

| Microservicio | Puerto | Base de datos | Responsabilidad |
| --- | ---: | --- | --- |
| Categoria | 7070 | categoria_db | CRUD de categorias de prendas. |
| Rol | 7075 | rol_db | CRUD de roles del sistema. |
| Venta | 7077 | venta_db | Registro de ventas asociadas a usuarios. |
| Detalle Venta | 7078 | detalle_venta_db | Detalle de productos vendidos por venta. |
| Mensajeria | 7079 | mensajeria_db | Mensajes internos y solicitudes de soporte. |
| Pedido | 7080 | pedido_db | Consulta y seguimiento de pedidos. |
| Auth | 7081 | auth_db | Inicio de sesion y registro de cuentas. |
| Usuario | 7082 | usuario_db | Clientes, vendedores y usuarios del sistema. |
| Prenda | 7580 | prenda_db | Catalogo, stock, tallas y colores. |

## Requisitos

- Java 21.
- Node.js y npm.
- MySQL en localhost.
- Visual Studio Code recomendado.
- Extension REST Client opcional para probar `Backend/consultas.rest`.

## Preparacion de base de datos

Ejecutar en MySQL:

```sql
SOURCE Backend/setup_databases.sql;
```

Si el comando `SOURCE` no aplica en tu cliente SQL, abrir el archivo `Backend/setup_databases.sql` y ejecutar sus sentencias `CREATE DATABASE`.

## Ejecucion del backend

Cada microservicio se levanta desde su carpeta interna. Ejemplo en Windows:

```bash
cd Backend/Usuario-Microservicio/Microservicio-Usuario
mvnw.cmd spring-boot:run
```

Ejemplo en Linux o macOS:

```bash
cd Backend/Usuario-Microservicio/Microservicio-Usuario
./mvnw spring-boot:run
```

Orden recomendado para probar el flujo completo:

1. Rol
2. Categoria
3. Usuario
4. Prenda
5. Venta
6. Detalle Venta
7. Mensajeria
8. Pedido
9. Auth

## Ejecucion del frontend

```bash
cd Frontend/Frontend-Forsaken-Shop
npm install
npm start
```

Abrir la aplicacion en:

```txt
http://localhost:4200
```

El frontend usa `proxy.conf.json` para conectar con los microservicios y evitar problemas de CORS durante el desarrollo local.

## Cuentas demo

| Rol | Correo | Password |
| --- | --- | --- |
| Admin | admin@forsaken.cl | admin123 |
| Vendedor | vendedor@forsaken.cl | vendedor123 |
| Bodeguero | bodega@forsaken.cl | bodega123 |
| Usuario | cliente@forsaken.cl | cliente123 |

## Pruebas y verificacion

Frontend:

```bash
cd Frontend/Frontend-Forsaken-Shop
npm run build
npm test -- --watch=false
```

Backend, desde cada microservicio:

```bash
mvnw.cmd -DskipTests package
```

Consultas manuales:

- Usar `Backend/consultas.rest` con REST Client.
- Probar `GET /` en cada microservicio para verificar nombre y version del servicio.
- Verificar que los puertos coincidan con `application.properties`.
- Confirmar que MySQL este activo antes de iniciar los microservicios.

## Estado de entrega

- Frontend compilado correctamente.
- Tests del frontend ejecutados correctamente.
- Microservicios Spring Boot compilados correctamente.
- README y consultas REST preparados para revision.
