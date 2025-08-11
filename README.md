# Auctions App

Una aplicación moderna de subastas en tiempo real con autenticación de usuarios.

## Características

- 🔐 **Autenticación completa**: Registro e inicio de sesión de usuarios
- 🎯 **Categorías**: Yugioh y Coleccionables
- 💰 **Sistema de pujas**: Pujas en tiempo real
- 📱 **Diseño responsive**: Funciona en móviles y desktop
- 🌙 **Modo oscuro**: Soporte para tema oscuro
- 🎨 **UI moderna**: Diseño limpio y atractivo

## Tecnologías

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- React Hooks

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs

## Configuración

### 1. Instalar dependencias

```bash
# Instalar dependencias del servidor
cd apps/server
pnpm install

# Instalar dependencias del cliente
cd ../client
pnpm install
```

### 2. Configurar base de datos

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d db

# Ejecutar migraciones
cd apps/server
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auctions" npx prisma migrate dev
```

### 3. Variables de entorno

Crear un archivo `.env` en `apps/server/`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auctions"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### Acceso a la base de datos con Prisma Studio

Para ver y editar los datos de la base de datos usando Prisma Studio:

```bash
cd apps/server
npx prisma studio
```

Esto abrirá una interfaz web en http://localhost:5555 donde podrás explorar todas las tablas y registros.

### 4. Ejecutar la aplicación

```bash
# Terminal 1: Servidor backend (inicia automáticamente Docker para db y redis)
cd apps/server
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production" DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auctions" pnpm dev

# Alternativamente, para iniciar todos los servicios Docker (db, redis, server, client)
cd apps/server
pnpm dev:docker

# Terminal 2: Cliente frontend
cd apps/client
pnpm dev
```

## Uso

1. **Registrarse**: Haz clic en "Registrarse" en la esquina superior derecha
2. **Iniciar sesión**: Usa tu email y contraseña para acceder
3. **Explorar subastas**: Navega por las categorías de Yugioh y Coleccionables
4. **Pujar**: Una vez autenticado, podrás pujar en las subastas

## Estructura del proyecto

```
auctions-app/
├── apps/
│   ├── client/                 # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/           # Páginas de la app
│   │   │   ├── components/    # Componentes React
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── types/         # Tipos TypeScript
│   │   └── package.json
│   └── server/                # Backend Express
│       ├── src/
│       │   ├── api/           # Endpoints de la API
│       │   ├── lib/           # Utilidades
│       │   ├── middleware/    # Middleware de Express
│       │   └── prisma/        # Esquema de base de datos
│       └── package.json
└── docker-compose.yml         # Configuración de Docker
```

## API Endpoints

### Autenticación
- `POST /api/auth/signup` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión

### Subastas (próximamente)
- `GET /api/auctions` - Obtener subastas
- `POST /api/auctions` - Crear subasta
- `POST /api/auctions/:id/bid` - Hacer puja

## Base de datos

El esquema incluye las siguientes tablas:
- `User` - Información de usuarios
- `Auction` - Subastas
- `Bid` - Pujas
- `Payment` - Pagos
- `Notification` - Notificaciones

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
