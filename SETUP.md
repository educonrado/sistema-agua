# Guía de Ejecución y Validación - Sistema de Agua

## Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar en desarrollo
```bash
npm start
```
Esto inicia:
- Vite dev server (http://localhost:5173)
- Electron app (ventana de escritorio)

### 3. Compilar para producción
```bash
npm run build
```
Genera:
- `dist/index.html` - archivo HTML compilado
- `dist/assets/main-*.js` - código JavaScript
- `dist/assets/main-*.css` - estilos compilados

## Pruebas

### Ejecutar todas las pruebas
```bash
npm run test
```

### Ver pruebas con interfaz gráfica
```bash
npm run test:ui
```

### Pruebas específicas
```bash
npm run test src/test/validation.test.js
```

### Con cobertura
```bash
npm run test -- --coverage
```

## Validación Manual

### 1. Primer Inicio (Onboarding)

**Pasos:**
1. Eliminar archivo de BD:
   - Windows: `C:\Users\{Usuario}\AppData\Local\sistema-agua\userData\sistema-agua.db`
   - macOS: `~/Library/Application Support/sistema-agua/userData/sistema-agua.db`
   - Linux: `~/.config/sistema-agua/userData/sistema-agua.db`

2. Ejecutar: `npm start`

3. Se debe mostrar la pantalla de onboarding:
   - Título: "Configuración Inicial de la Junta"
   - 5 campos de entrada
   - Botón "Guardar Configuración"

4. Completar el formulario:
   - Nombre: "Junta Local de Agua"
   - Costo agua cruda: "5.50"
   - Límite consumo básico: "10.5"
   - Costo tarifa base: "15.00"
   - Costo m³ excedente: "2.50"

5. Hacer clic en "Guardar Configuración"

**Validación:**
- ✅ La pantalla debe cerrar
- ✅ Se debe mostrar el Dashboard
- ✅ Los valores deben aparecer en tarjetas de color
- ✅ Archivo `sistema-agua.db` debe crearse en userData

### 2. Inicio Posterior (Sin Onboarding)

**Pasos:**
1. Cerrar la aplicación
2. Ejecutar nuevamente: `npm start`

**Validación:**
- ✅ Se debe saltar el onboarding
- ✅ Se debe mostrar directamente el Dashboard
- ✅ Los valores deben ser los mismos que guardamos

### 3. Validación de Errores

**Formulario vacío:**
1. Hacer clic en "Guardar Configuración" sin llenar campos
2. Validación: Deben aparecer mensajes de error en rojo

**Valores negativos:**
1. Ingresar "-5" en "Costo del Agua Cruda"
2. Validación: Debe mostrar error

**Texto demasiado corto:**
1. Ingresar "AA" en "Nombre Oficial de la Junta"
2. Validación: Debe mostrar error (mínimo 3 caracteres)

### 4. Base de Datos

**Verificar estructura:**
```bash
# Instalar sqlite3 si no lo tienes
npm install -g sqlite3

# Conectar a la BD
sqlite3 "{ruta}/sistema-agua.db"

# Listar tablas
.tables

# Ver configuración
SELECT * FROM Configuracion;

# Ver usuarios
SELECT * FROM Usuario;
```

**Validación:**
- ✅ Tabla Configuracion tiene 1 registro con los datos ingresados
- ✅ Tabla Usuario tiene 1 registro con rol "ADMINISTRADOR"
- ✅ passwordHash no está en texto plano (comienza con $2a$ o similar)

## Estructura de Directorios

```
sistema-agua/
├── src/
│   ├── main/
│   │   ├── main.js                 # Punto de entrada Electron
│   │   ├── database.js             # Inicialización de BD
│   │   ├── services/
│   │   │   ├── configService.js    # Lógica de configuración
│   │   │   └── userService.js      # Lógica de usuarios
│   │   └── ipcHandlers.js          # Handlers de IPC
│   │
│   ├── renderer/
│   │   ├── App.jsx                 # Componente raíz
│   │   ├── screens/
│   │   │   ├── OnboardingScreen.jsx # Formulario de onboarding
│   │   │   └── pages/
│   │   │       └── Dashboard.jsx   # Pantalla principal
│   │   ├── hooks/
│   │   │   └── useOnboarding.js    # Hook personalizado
│   │   └── utils/
│   │       └── validation.js       # Validadores
│   │
│   ├── preload/
│   │   └── preload.js              # Context bridge seguro
│   │
│   └── test/
│       ├── setup.js                # Configuración de pruebas
│       ├── validation.test.js      # Pruebas de validadores
│       ├── configService.test.js   # Pruebas de servicio
│       ├── OnboardingScreen.test.jsx # Pruebas de componente
│       └── useOnboarding.test.js   # Pruebas del hook
│
├── prisma/
│   ├── schema.prisma               # Definición de modelos
│   └── migrations/                 # Historial de cambios
│
├── docs/
│   ├── ARCHITECTURE.md             # Diseño de la app
│   ├── ONBOARDING_MODULE.md        # Este módulo
│   └── SETUP.md                    # Configuración de desarrollo
│
├── index.html                      # Punto de entrada web
├── package.json                    # Dependencias
├── vite.config.js                  # Configuración Vite
├── vitest.config.js                # Configuración Vitest
├── prisma.config.ts                # Configuración Prisma
└── .env                            # Variables de entorno
```

## Troubleshooting

### La app no muestra el onboarding aunque es primer inicio

**Causa:** El archivo de BD ya existe con datos.

**Solución:**
```bash
# Encontrar y eliminar:
rm ~/.config/sistema-agua/userData/sistema-agua.db  # Linux
rm ~/Library/Application\ Support/sistema-agua/userData/sistema-agua.db  # macOS
rmdir "%APPDATA%\sistema-agua\userData\sistema-agua.db"  # Windows
```

### Error "Cannot read properties of undefined (reading 'id')"

**Causa:** Prisma client no está inicializado correctamente.

**Solución:**
```bash
npm run prisma:generate
npm run prisma:migrate
npm start
```

### Errores en tests "Right-hand side of instanceof is not an object"

**Causa:** jsdom no está configurado correctamente.

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run test
```

### Puerto 5173 ya en uso

**Causa:** Otra instancia de Vite está corriendo.

**Solución:**
```bash
# Encontrar proceso
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# O cambiar puerto en vite.config.js
```

## Comandos Útiles

| Comando | Descripción |
|---------|-----------|
| `npm start` | Dev con Electron |
| `npm run dev` | Solo Vite (sin Electron) |
| `npm run build` | Compilar para producción |
| `npm run test` | Ejecutar todas las pruebas |
| `npm run test:ui` | Pruebas con interfaz gráfica |
| `npm run electron` | Ejecutar Electron sin dev server |
| `npm run prisma:generate` | Generar cliente Prisma |
| `npm run prisma:migrate` | Ejecutar migraciones |

## Guía de Flujos de Trabajo

### Workflow: Desarrollar nuevo componente

1. Crear archivo en `src/renderer/`
2. Ejecutar `npm start` (hot reload automático)
3. Editar código y ver cambios en tiempo real
4. Crear test en `src/test/`
5. Ejecutar `npm run test` para validar

### Workflow: Modificar esquema de BD

1. Editar `prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev --name cambio_nombre`
3. Actualizar servicios según sea necesario
4. Crear/actualizar pruebas

### Workflow: Antes de commit

```bash
npm run test           # Todas las pruebas pasan
npm run build          # Compilación exitosa
npm start              # Funciona en desarrollo
```

## Información de Versiones

- **Node.js:** 18+ recomendado
- **npm:** 8+
- **Electron:** 44.0.0
- **Prisma:** 5.9.0
- **React:** 18.2.0
- **Vite:** 8.2.2
- **SQLite3:** 5.1.6

## Referencias Útiles

- [Documentación de Electron](https://www.electronjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React](https://react.dev/)
- [Documentación de Vitest](https://vitest.dev/)
