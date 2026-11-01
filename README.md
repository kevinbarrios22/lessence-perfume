# L’Essence — Perfumería selecta

Tienda en línea de perfumes desarrollada con Next.js, React y PostgreSQL. Permite explorar un catálogo, filtrar fragancias, ver sus detalles y preparar pedidos por WhatsApp. Incluye un panel privado para administrar productos e imágenes.

## Funcionalidades

- Catálogo con búsqueda, filtros y paginación.
- Fichas de producto con descripción, notas olfativas, etiquetas y variantes de tamaño y precio.
- Carrito de compras y preparación del pedido por WhatsApp.
- Panel de administración protegido por contraseña para gestionar el catálogo y los banners.
- Carga de imágenes a Cloudflare R2.
- Metadatos, sitemap e imágenes Open Graph para compartir productos y páginas.
- Migraciones SQL versionadas.

## Tecnologías

- Next.js 16 y React 19
- TypeScript y Tailwind CSS 4
- PostgreSQL 17
- Cloudflare R2 para almacenar imágenes
- Node.js y npm

## Requisitos

- Node.js y npm
- Docker con Docker Compose, para ejecutar PostgreSQL localmente

## Instalación local

1. Clona el repositorio y entra en la carpeta:

   ```bash
   git clone https://github.com/kevinbarrios22/lessence-perfume.git
   cd lessence-perfume
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo local de configuración a partir de la plantilla:

   **macOS / Linux**
   ```bash
   cp .env.example .env.local
   ```

   **PowerShell**
   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Inicia PostgreSQL:

   ```bash
   npm run db:up
   ```

   Docker Compose publica la base de datos local en el puerto `5434`. La URL predeterminada de `DATABASE_URL` en `.env.example` ya corresponde a esta configuración.

5. Aplica las migraciones:

   ```bash
   npm run db:migrate
   ```

6. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Configúralas en `.env.local` para desarrollo y en el proveedor de hosting para producción.

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. |
| `ADMIN_PASSWORD` | Contraseña para acceder al panel de administración. Cámbiala por una contraseña segura. |
| `ADMIN_SECRET` | Secreto aleatorio para firmar la sesión del panel. Usa un valor largo y único. |
| `R2_ACCOUNT_ID` | ID de cuenta de Cloudflare, necesario para subir imágenes a R2. |
| `R2_ACCESS_KEY_ID` | Clave de acceso de R2. |
| `R2_SECRET_ACCESS_KEY` | Secreto de acceso de R2. |
| `R2_BUCKET` | Nombre del bucket de imágenes. |
| `R2_PUBLIC_URL` | URL pública del bucket para servir imágenes. |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, utilizada en metadatos y enlaces compartidos. |
| `NEXT_PUBLIC_WHATSAPP_NUMERO` | Número de WhatsApp para pedidos, solo dígitos y con código de país. |

Las credenciales de R2 solo son necesarias para las funciones que suben imágenes. No publiques `.env.local` ni incluyas secretos en el repositorio.

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Inicia Next.js en modo desarrollo. |
| `npm run build` | Genera la compilación de producción. |
| `npm start` | Sirve la compilación de producción. |
| `npm run lint` | Ejecuta ESLint. |
| `npm test` | Ejecuta las pruebas con Node.js. |
| `npm run db:up` | Inicia PostgreSQL con Docker Compose. |
| `npm run db:down` | Detiene los servicios de Docker Compose. |
| `npm run db:migrate` | Aplica las migraciones SQL pendientes. |

## Estructura

```
app/                 Páginas, rutas API y panel de administración
components/          Componentes de catálogo y navegación
lib/                 Acceso a datos, catálogo, autenticación y almacenamiento
postgres/
  init.sql           Esquema inicial de PostgreSQL
  migrations/        Migraciones SQL versionadas
scripts/             Herramientas de mantenimiento
tests/               Pruebas
public/              Recursos estáticos
```

## Producción

Configura las variables de entorno en tu hosting, usa una base de datos PostgreSQL accesible desde el servidor y ejecuta `npm run db:migrate` durante el despliegue. Configura las credenciales de Cloudflare R2 si necesitas subir imágenes desde el panel. Define `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_WHATSAPP_NUMERO` con los valores del sitio publicado.

## Pruebas

```bash
npm test
```
