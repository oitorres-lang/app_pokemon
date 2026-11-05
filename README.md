# 📱 PokéAPI - Aplicación Móvil con Ionic & Angular

Aplicación móvil multiplataforma desarrollada con **Ionic Framework** y **Angular**, diseñada bajo una **arquitectura limpia en capas** (Modelo, Servicio y Presentación) para consumir la API pública de Pokémon ([PokéAPI](https://pokeapi.co/)).

---

## 🏗️ Arquitectura del Proyecto (Capas)

El proyecto sigue una estricta separación de responsabilidades:

```text
src/app/
├── models/                     # 📦 CAPA DE MODELOS (Tipado TypeScript)
│   └── pokemon.model.ts        # Interfaces: PokemonListItem, PokemonDetail, etc.
│
├── services/                   # ⚙️ CAPA DE LÓGICA (Servicios con HttpClient)
│   ├── poke-api.ts             # Consumo de endpoints, transformaciones y conversiones
│   └── poke-api.spec.ts        # Pruebas unitarias del servicio
│
└── pages/                      # 🎨 CAPA DE PRESENTACIÓN (UI con Ionic Components)
    ├── home/                   # Pantalla Principal (Listado de Pokémon)
    │   ├── home.page.ts
    │   ├── home.page.html
    │   ├── home.page.scss
    │   └── home.page.spec.ts
    │
    └── detail/                 # Pantalla de Detalle (/detail/:id)
        ├── detail.page.ts
        ├── detail.page.html
        ├── detail.page.scss
        └── detail.page.spec.ts
```

---

## 🚀 Requisitos Técnicos Cumplidos

### 1. Pantalla Principal (Listado de Pokémon)
- **Consumo de PokéAPI**: Consulta `https://pokeapi.co/api/v2/pokemon?limit=25` por defecto.
- **Capa de Lógica**: Implementada en `PokeApiService` mediante `HttpClient` y tipada con interfaces en `pokemon.model.ts`.
- **Componentes Nativos de Ionic**:
  - `ion-content`, `ion-header`, `ion-toolbar`, `ion-title`
  - `ion-list` e `ion-item` con directiva `button` y `detail="true"`.
  - `ion-thumbnail` con la imagen oficial de cada criatura.
  - `ion-label` mostrando número de ID (`#001`) y nombre formateado.
- **Interactividad y Navegación**:
  - Al presionar cualquier Pokémon se navega hacia `/detail/:id`.
  - Barra de búsqueda interactiva (`ion-searchbar`) con filtrado reactivo en tiempo real por nombre o ID.
  - Pull to refresh (`ion-refresher`) para recargar los 25 Pokémon.
  - Listado limitado estrictamente a los primeros 25 Pokémon según el enunciado (`https://pokeapi.co/api/v2/pokemon?limit=25`).
  - Estados de carga con `ion-skeleton-text` y `ion-spinner`.

### 2. Pantalla de Detalle (Información del Pokémon)
- **Ruta Dinámica**: Recibe el ID o nombre mediante el parámetro de ruta `/detail/:id`.
- **Endpoint Individual**: Consulta `https://pokeapi.co/api/v2/pokemon/{id}`.
- **Componentes Nativos de Ionic**:
  - `ion-back-button`: Botón de retorno a la pantalla principal con `defaultHref="/home"`.
  - `ion-card`: Contenedor principal estilizado con diseño temático según el tipo primario.
  - **Imagen Oficial Grande**: Arte oficial en alta definición (`official-artwork`) con animación flotante y sombra.
  - **Identificador y Nombre**: ID destacado (`#025`) y nombre formateado con mayúscula inicial.
  - **Tipos del Pokémon**: Representados con `ion-badge` con colores característicos y traducción al español (*Fuego*, *Agua*, *Planta*, *Eléctrico*, etc.).
  - **Altura y Peso Convertidos**:
    - Altura: De decímetros (dm) a **metros (m)** (ej. 7 dm $\rightarrow$ 0.7 m)
    - Peso: De hectogramos (hg) a **kilogramos (kg)** (ej. 69 hg $\rightarrow$ 6.9 kg)
    - Mostrados dentro de una cuadrícula estructurada con `ion-grid`, `ion-row` e `ion-col`.
  - **Estadísticas Base (Stats)**:
    - PS (HP), Ataque, Defensa, Atq. Especial, Def. Especial, Velocidad.
    - Barras de progreso nativas (`ion-progress-bar`) con valores normalizados (escala máxima 255) y colores distintivos por estadística.
  - **Habilidades Especiales**: Etiquetas `ion-chip` identificando habilidades regulares y ocultas.

---

## 🛠️ Instrucciones de Ejecución

### 1. Entrar a la carpeta del proyecto
```bash
cd poke_api
```

### 2. Instalar dependencias (si no están instaladas)
```bash
npm install
```

### 3. Levantar la aplicación en modo desarrollo
```bash
ionic serve
```
> O alternativamente:
> ```bash
> npm start
> ```
La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8100`.

### 4. Compilar para producción
```bash
npm run build
```

### 5. Ejecutar pruebas unitarias
```bash
npm run test:unit
```

### 6. Ejecutar linter
```bash
npm run lint
```

