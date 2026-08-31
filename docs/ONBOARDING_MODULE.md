# Módulo de Onboarding y Configuración Inicial

## Descripción General

Este módulo implementa un asistente de configuración inicial (onboarding) que se ejecuta la primera vez que se inicia la aplicación. El sistema bloquea la aplicación hasta que se complete la configuración inicial, garantizando que todos los parámetros requeridos estén establecidos antes de cualquier operación.

## Arquitectura del Módulo

### 1. Backend (Electron Main Process)

#### `src/main/database.js`
- **Responsabilidad:** Inicialización y gestión de la base de datos SQLite
- **Características:**
  - Crea la base de datos en `app.getPath('userData')` para aislarla del código
  - Inicializa el cliente de Prisma
  - Ejecuta migraciones automáticas
  - Verifica si existe configuración

```javascript
- initializeDatabase(): Configura la URL de la BD y crea el cliente Prisma
- getPrismaClient(): Obtiene la instancia del cliente
- disconnectDatabase(): Limpia los recursos
- configurationExists(): Verifica si hay configuración almacenada
```

#### `src/main/services/configService.js`
- **Responsabilidad:** Lógica de negocio para configuración
- **Características:**
  - Crea la configuración inicial con usuario administrador
  - Valida datos de entrada
  - Encripta contraseña con bcrypt
  - Persiste en la base de datos via Prisma

```javascript
- createInitialConfiguration(): Crea config + usuario admin
- getConfiguration(): Obtiene la configuración actual
- updateConfiguration(): Actualiza parámetros
```

#### `src/main/ipcHandlers.js`
- **Responsabilidad:** Comunicación IPC entre renderer y main process
- **Endpoints:**
  - `config:needs-onboarding`: Verifica si se requiere onboarding
  - `config:get`: Obtiene la configuración actual
  - `config:create-initial`: Crea la configuración inicial
  - `config:validate`: Valida datos en el servidor

```javascript
- setupConfigurationHandlers(): Registra todos los handlers IPC
```

#### `src/main/main.js` (Actualizado)
- Inicializa la base de datos antes de crear la ventana
- Configura los handlers de IPC
- Limpia recursos al cerrar la aplicación

### 2. Frontend (React + Vite)

#### `src/renderer/screens/OnboardingScreen.jsx`
- **Responsabilidad:** Interfaz de usuario del asistente
- **Características:**
  - Formulario multi-campo con validación en tiempo real
  - Indicador de carga
  - Mostrador de errores
  - Cálculo en vivo del ejemplo de tarifa
  - UI responsiva con Tailwind CSS

**Campos del formulario:**
- Nombre Oficial de la Junta (requerido)
- Costo del Agua Cruda (requerido, no negativo)
- Límite de Consumo Básico m³ (requerido, > 0)
- Costo de la Tarifa Base (requerido, no negativo)
- Costo del m³ Excedente (requerido, no negativo)

#### `src/renderer/hooks/useOnboarding.js`
- **Responsabilidad:** Lógica del estado de onboarding
- **Características:**
  - Detecta si se requiere onboarding
  - Maneja el estado del formulario
  - Valida datos del lado del cliente
  - Comunica con el main process via IPC
  - Auto-limpia errores al editar campos

```javascript
- needsOnboarding: Boolean
- loading: Boolean (carga inicial)
- submitting: Boolean (envío del formulario)
- error: String | null
- formData: Object (datos del formulario)
- validationErrors: Object (errores por campo)
- handleFieldChange(): Actualiza campo
- handleSubmit(): Valida y envía configuración
```

#### `src/renderer/utils/validation.js`
- **Responsabilidad:** Validaciones de datos
- **Características:**
  - Validadores individuales para cada campo
  - Función de validación de formulario completo
  - Formateo de moneda y volumen para display

```javascript
- validators.nombreJunta()
- validators.cost()
- validators.volume()
- validateConfiguration()
- formatCurrency()
- formatVolume()
```

#### `src/renderer/App.jsx` (Actualizado)
- Integra el OnboardingScreen
- Bloquea la aplicación hasta completar el onboarding
- Redirige al Dashboard después

### 3. Base de Datos (Prisma + SQLite)

#### `prisma/schema.prisma`
```prisma
model Configuracion {
  id                  Int
  nombreJunta         String (UNIQUE)
  costoAguaCruda      Float
  limiteConsumoBasico Float
  costoTarifaBase     Float
  costoM3Excedente    Float
  createdAt           DateTime
  updatedAt           DateTime
}

model Usuario {
  id              Int
  nombre          String (UNIQUE)
  email           String (UNIQUE, NULLABLE)
  passwordHash    String (bcrypt)
  rol             String ("ADMINISTRADOR" | "DIGITADOR")
  activo          Boolean
  createdAt       DateTime
  updatedAt       DateTime
}
```

## Flujo de Ejecución

### Primer Inicio de la Aplicación

1. **Electron Main Process inicia:**
   - `app.whenReady()` → `initializeDatabase()`
   - Crea base de datos en `userData/sistema-agua.db`
   - Genera cliente Prisma
   - Ejecuta migraciones automáticas

2. **Registra IPC Handlers:**
   - Listeners para comunicación con renderer

3. **Abre ventana de Renderer:**
   - Carga React + Vite dev server
   - Renderiza `App.jsx`

4. **App.jsx ejecuta:**
   - `useEffect` → `configNeedsOnboarding()`
   - Si necesita onboarding → renderiza `OnboardingScreen`
   - Si ya está configurado → renderiza `Dashboard`

5. **OnboardingScreen se monta:**
   - Muestra formulario con campos vacíos
   - Valida en tiempo real al escribir
   - Bloquea toda interacción con el resto de la app

6. **Usuario completa formulario y envía:**
   - Validación cliente-side (React)
   - Envío via IPC → `config:validate` (server-side)
   - Si válido → `config:create-initial`
   - Main process crea BD records
   - Renderer cierra screen y muestra Dashboard

7. **Inicio Posterior:**
   - La app detecta que configuración existe
   - Salta el onboarding
   - Carga directamente al Dashboard

## Validaciones Implementadas

### Cliente-side (Instantáneo)
- Campos requeridos
- Tipos numéricos correctos
- Valores no negativos
- Volumen > 0

### Servidor-side (Robustez)
- Validaciones duplicadas
- Verificación de datos antes de persistencia
- Manejo de errores de BD

## Seguridad

### Contraseña del Admin
- Encriptada con bcryptjs (10 rondas de salt)
- Nunca se transmite en texto plano
- Se almacena hashificada en BD

### Aislamiento de Datos
- Archivo `.db` en `userData/` del usuario (no en carpeta de código)
- Ruta exclusiva de cada usuario de Windows
- No se versionea en git

## Persistencia de Datos

### Ubicación de la Base de Datos
```
Windows: C:\Users\{Usuario}\AppData\Local\sistema-agua\userData\sistema-agua.db
macOS: ~/Library/Application Support/sistema-agua/userData/sistema-agua.db
Linux: ~/.config/sistema-agua/userData/sistema-agua.db
```

### Copia de Seguridad
- Estructura lista para implementar backup automático
- Recomendación: copiar `.db` a USB después del onboarding

## Pruebas Unitarias

### `src/test/validation.test.js` (20 tests)
- Pruebas de validadores individuales
- Pruebas de validación de formulario completo
- Pruebas de formateo de datos

### `src/test/configService.test.js` (8 tests)
- Pruebas de creación de configuración
- Pruebas de obtención/actualización de datos
- Pruebas de hash de contraseña

### `src/test/OnboardingScreen.test.jsx` (3 tests)
- Pruebas de renderizado
- Pruebas de presencia de campos
- Pruebas de interacción básica

### `src/test/useOnboarding.test.js` (5 tests)
- Pruebas del hook personalizado
- Pruebas de validación
- Pruebas de cambio de campos

## Ejecución

### Instalación de Dependencias
```bash
npm install
```

### Desarrollo
```bash
npm start
# Ejecuta Vite dev server + Electron
```

### Build
```bash
npm run build
```

### Tests
```bash
npm run test
npm run test:ui  # Con interfaz visual
```

### Prisma
```bash
npx prisma generate   # Genera cliente
npx prisma migrate dev # Crea migraciones
```

## Criterios de Aceptación - Estado

✅ **1. Detección de ausencia de configuración**
- La app detecta si la tabla Configuracion está vacía
- Invoca el asistente obligatorio en primer inicio

✅ **2. Campos solicitados**
- Nombre oficial de la Junta
- Costo del agua cruda
- Límite del consumo básico (m³)
- Costo de la tarifa base
- Costo del m³ excedente

✅ **3. Creación de usuario administrador**
- Se crea automáticamente el usuario "Administrador"
- Contraseña encriptada con bcrypt
- Se almacena en tabla Usuario

✅ **4. Base de datos en userData**
- Archivo `.db` creado en `app.getPath('userData')`
- Aislado del código fuente
- Ruta específica por usuario

✅ **5. Bloqueo de aplicación**
- La pantalla de onboarding bloquea toda la app
- No se puede acceder a Dashboard hasta completar
- Se persiste en la primera inicialización

## Notas Técnicas

### Tecnologías Utilizadas
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Desktop:** Electron 44
- **ORM:** Prisma 5
- **BD:** SQLite3
- **Testing:** Vitest + React Testing Library
- **Seguridad:** bcryptjs
- **IPC:** Electron IPC (Main ↔ Renderer)

### Características de Arquitectura
- **Patrón Adapter:** Estructura lista para agregar otros providers de BD
- **Separación de Responsabilidades:** Lógica en servicios, UI en componentes
- **Type-safe:** Prisma proporciona tipos automáticos
- **Offline-first:** Toda la lógica es local
- **ACID Compliance:** SQLite garantiza integridad de datos

## Extensiones Futuras

1. **Backup Automático**
   - Copiar `.db` a USB/cloud después del onboarding

2. **Validación de Duplicados**
   - Prevenir dos juntas con mismo nombre

3. **Edición de Configuración**
   - Pantalla para admin que permita cambiar parámetros

4. **Exportación de Datos**
   - Exportar configuración a JSON

5. **Importación de Configuración**
   - Restaurar desde backup
