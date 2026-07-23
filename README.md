# Gott Calculator

Web app sin backend para explorar la teoria de Gott y estimar la probabilidad de que un suceso termine.

## Inspiración:

[![Inspiration](https://i.ytimg.com/vi/QHo-O52c5wM/hq720.jpg?sqp=-oaymwEqCNAFEJQDSFryq4qpAxwIARUAAIhCGAHYAQHiAQoIGBACGAY4AUABuAIX&rs=AOn4CLCl6EOZ0HEfGc82fj53rvh90V9gpA&usqp=CBc)](https://www.youtube.com/watch?v=QHo-O52c5wM)


## Que incluye

- Calculadora interactiva con formulario y sliders
- Confianza configurable (50% por defecto)
- Resultado en vivo al cambiar datos
- Apartado de compartir con:
  - Descarga de imagen PNG
  - Copiar enlace con parametros
  - Web Share API (si el navegador lo soporta)
  - QR que apunta a https://gott-calculator.ismola.dev con los parametros actuales
- Endpoint frontend tipo API en /api/gott usando query params
- Despliegue con Docker Compose

## Modelo usado

La app usa una formulacion clasica de Gott:

- Ventana de tiempo restante para confianza c:
  - alpha = (1 - c) / 2
  - restante_min = edad_observada * alpha / (1 - alpha)
  - restante_max = edad_observada * (1 - alpha) / alpha
- Probabilidad de terminar antes de un horizonte H:
  - P(fin antes de H) = H / (edad_observada + H)

## Uso local

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

## Endpoint frontend

Ruta:

/api/gott?event=Startup&elapsed=4&horizon=3&confidence=0.5&unit=years

Parametros:

- event: nombre del suceso
- elapsed: tiempo transcurrido
- horizon: horizonte para calcular probabilidad
- confidence: nivel de confianza entre 0.05 y 0.99
- unit: days, months, years

El endpoint es frontend-only: calcula en navegador y muestra respuesta JSON-like en pantalla.

## Docker Compose

Levantar en modo deploy local:

```bash
docker compose up --build
```

La app quedara disponible en http://localhost:8080.

Parar servicios:

```bash
docker compose down
```

## Scripts

- npm run dev: modo desarrollo
- npm run build: build de produccion
- npm run preview: preview local del build
- npm run lint: lint
