# CRUD Users Application

Esta es una aplicación backend simple para gestionar usuarios utilizando operaciones CRUD (Crear, Leer, Actualizar, Eliminar). La aplicación utiliza Express.js para manejar las rutas y MongoDB como base de datos para almacenar la información de los usuarios. Además, se utiliza Redis para almacenar tokens de autenticación.

## Funcionalidades

- **Crear Usuario**: Permite crear un nuevo usuario.
- **Leer Usuarios**: Permite obtener la lista de todos los usuarios.
- **Eliminar Usuario**: Permite eliminar un usuario por su ID, verificando primero un token de autenticación.

## Flujo de Datos

1. **Crear Usuario**:
   - Ruta: `POST /users`
   - El controlador `userController.createUser` llama al servicio `userService.createUser` para crear un nuevo usuario en la base de datos MongoDB.

2. **Leer Usuarios**:
   - Ruta: `GET /users`
   - El controlador `userController.getUsers` llama al servicio `userService.getAllUsers` para obtener la lista de todos los usuarios desde la base de datos MongoDB.

3. **Eliminar Usuario**:
   - Ruta: `DELETE /users/:id`
   - El controlador verifica primero si el token JWT es válido utilizando `jwt.verify`.
   - Luego, verifica si el token almacenado en Redis coincide con el token proporcionado en la solicitud.
   - Si el token es válido, el usuario es eliminado de la base de datos MongoDB y el token es eliminado de Redis.

## Estructura del Proyecto

- **models/User.js**: Define el esquema del usuario en MongoDB.
- **services/userService.js**: Contiene la lógica de negocio para interactuar con la base de datos.
- **controllers/userController.js**: Maneja las solicitudes HTTP y llama a los servicios correspondientes.
- **routes/userRoutes.js**: Define las rutas de la API y sus controladores asociados.
- **config/logger.js**: Configuración del logger utilizando Winston.

## Instalación

1. Clona el repositorio.
2. Instala las dependencias con `npm install`.
3. Configura las variables de entorno necesarias (por ejemplo, la clave secreta para JWT y la URL de conexión a MongoDB).
4. Inicia la aplicación con `npm start`.

## Ejemplo de Solicitud para Eliminar Usuario

```bash
curl -X DELETE "http://localhost:3000/users/{id}?token={token}"
```

Donde `{id}` es el ID del usuario a eliminar y `{token}` es el token de autenticación.
