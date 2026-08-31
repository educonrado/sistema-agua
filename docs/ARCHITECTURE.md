# ARCHITECTURE.md - Proyecto sistema agua

## 1. Visión Global del Proyecto
El **Proyecto sistema agua** está concebido como una solución tecnológica para la gestión comunitaria de agua potable en sectores rurales de la región andina. Su enfoque principal es operar de manera autónoma en entornos caracterizados por:
- **Conectividad a Internet nula o limitada** (Entorno Offline-First).
- **Hardware heterogéneo o de escasos recursos** (PCs con procesadores de gama de entrada, 2GB - 4GB RAM, Windows 10/11 x86_64).
- **Usuarios con baja experiencia tecnológica**.

El sistema reemplaza los procesos manuales (cuadernos físicos) con una aplicación de escritorio que garantiza la autonomía financiera, administrativa y la integridad de los datos de la junta de agua, cumpliendo estricta y linealmente con la normativa comunitaria.

---

## 2. Decisiones Arquitectónicas y Principios

### 2.1. Patrón de Arquitectura
- **Standalone & Mononodo (Un Nodo = Una Licencia):** El sistema opera de forma 100% aislada en la computadora local de la junta. No depende de servidores locales, infraestructura LAN compleja, ni servicios en la nube para su operación crítica diaria.
- **Offline-First Absoluto:** Todas las funciones core (ingreso de lecturas, emisión de cobros, administración de usuarios, reportes de morosidad) operan sin conexión a Internet.
- **Cero Infraestructura de Servidor:** No se requieren servicios de background pesados ni motores de base de datos cliente-servidor externos (ej. PostgreSQL, MySQL) para el MVP.

### 2.2. Stack Tecnológico Definido
- **Empaquetador de Escritorio:** **Tauri (Rust)** o **Electron**. Seleccionado para generar un ejecutable compacto, de bajo consumo de RAM y compatible con PCs antiguas.
- **Frontend / Interfaz de Usuario:** **React + Vite + Tailwind CSS**. Seleccionado para construir vistas declarativas, responsivas y enfocadas en el minimalismo radical (flujos lineales inquebrantables de 1 clic).
- **Backend / Capa Nativa (Main Process):** **Node.js / Rust IPC**. Maneja la lógica de negocio, transacciones financieras y acceso al sistema de archivos local de manera segura.
- **Motor de Base de Datos:** **SQLite**. Base de datos relacional en un archivo autocontenido (`.db`). Garantiza **Integridad Financiera (Transacciones ACID)** evitando corrupción ante cortes de energía repentinos.
- **Generación de Reportes:** **PDFMake / React-To-Print**. Compatibilidad directa para generar recibos y balances físicos listos para impresoras locales/térmicas por USB.

### 2.3. Respaldo de Datos y Tolerancia a Fallos
- **Respaldo Físico Primario:** Copias de seguridad locales, automáticas e inmediatas de la base de datos cifrada hacia una memoria USB.
- **Respaldo Híbrido / Asíncrono (Cloud-Agnostic):** Sincronización en segundo plano hacia la nube **únicamente** cuando el sistema detecte conexión a Internet activa. 
  - *Nota de Desarrollo:* Dado que el proveedor de almacenamiento en la nube (AWS, Google Drive, R2, etc.) **aún no está definido**, el módulo de sincronización debe implementarse utilizando un **patrón de adaptador (Adapter pattern) mediante interfaces genéricas**. El núcleo de la aplicación solo debe emitir el archivo `.db` cifrado y llamar a una interfaz `CloudStorageProvider`, dejando la implementación específica para el futuro.

### 2.4. Seguridad y Control de Acceso (RBAC)
- **Cifrado Local:** Contraseñas de operadores cifradas en reposo utilizando algoritmo `bcrypt`.
- **Roles Definidos:**
  - *Administrador (Presidente/Tesorero):* Acceso total (tarifas, padrón, caja, reportes, auditoría, usuarios).
  - *Digitador:* Acceso restringido exclusivamente al flujo de ingreso ágil de lecturas de medidores.
- **Validación Multicapa:** El control de roles se aplica en el renderizado de la UI, en la protección de rutas locales, y es validado estrictamente a nivel del *Main Process* (Backend IPC) antes de ejecutar cualquier escritura en la base de datos.
## 3. Guía de Interfaz y Experiencia de Usuario (UI/UX)
El diseño de la aplicación se rige estrictamente por la filosofía de **"Minimalismo Radical"**, creando una interfaz que debe ser tan obvia que no requiera manuales de instrucción.

### 3.1. Principios de Diseño Visual
- **Pantallas de Propósito Único:** Cada vista debe resolver una sola tarea (ej. panel de digitación masiva de lecturas o punto de recaudación). Queda prohibido incluir menús complejos, gráficos innecesarios o atajos que distraigan al operador.
- **Tipografía sobre Iconografía:** Los iconos abstractos pueden ser confusos en entornos rurales. Se debe priorizar el uso de botones enormes, con alto contraste y textos de acción directos, como "GUARDAR LECTURA" o "COBRAR".
- **Sistema de Colores (Semántica Obvia):**
  - **Azul Principal (Sky-600):** Utilizado en encabezados, botones primarios y branding[cite: 2].
  - **Verde (Green-600):** Indica éxito, confirmación de transacciones y usuarios al día[cite: 2].
  - **Amarillo/Naranja (Amber-600):** Alertas visuales de mora incipiente (1 mes de atraso)[cite: 1, 2].
  - **Rojo (Red-600):** Alerta visual inmediata de peligro para morosos (más de 2 o 3 meses) que requieran corte o cobro urgente[cite: 1, 2].
  - **Fondo:** Se prioriza un fondo claro (Slate-50) con texto oscuro (Slate-900) para asegurar la máxima legibilidad[cite: 2].

### 3.2. Cero Fricciones y Operación Segura
- **Lenguaje Cotidiano:** La interfaz debe evitar la jerga contable compleja para respetar la gestión comunitaria tradicional. Por ejemplo, se debe usar el término "Comuneros con Deuda" en lugar de conceptos como "Cartera Vencida".
- **Flujos Inquebrantables:** Los procesos deben ser estrictamente lineales. El flujo de recaudación debe ser directo: Buscar usuario -> Ver total a pagar -> Registrar pago -> Emitir comprobante, sin botones secundarios que diluyan la atención.
- **Prevención de Errores (Poka-yoke):** El diseño debe cuidar al usuario bloqueando errores lógicos de manera inmediata. Por ejemplo, si se ingresa una lectura de medidor que es menor a la del mes anterior, el sistema debe marcar un error visual instantáneo exigiendo justificación
- **Integración Transparente (Hardware):** Al hacer clic en imprimir, el sistema debe disparar la impresión directamente a la minipresora térmica conectada. No se deben abrir cuadros de diálogo confusos del sistema operativo de Windows