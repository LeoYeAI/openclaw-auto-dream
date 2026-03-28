<p align="center">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-D4AF37?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMEwxMiAyeiIgZmlsbD0iI0Q0QUYzNyIvPjwvc3ZnPg==" alt="Powered by MyClaw.ai" />
  <img src="https://img.shields.io/badge/OpenClaw-Skill-2563EB?style=for-the-badge" alt="OpenClaw Skill" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Version-3.0-8B5CF6?style=for-the-badge" alt="v3.0" />
</p>

<h1 align="center">🌀 OpenClaw Auto-Dream</h1>

<p align="center">
  <strong>Tu IA no solo recuerda. Sueña.</strong>
</p>

<p align="center">
  Una arquitectura de memoria cognitiva que da a los agentes OpenClaw la capacidad de dormir, soñar y despertar más inteligentes.<br/>
  Cinco capas de memoria. Puntuación de importancia. Curvas de olvido. Grafos de conocimiento. Dashboards de salud.<br/>
  <em>No es gestión de archivos — es neurociencia.</em>
</p>

<p align="center">
  <a href="https://myclaw.ai">MyClaw.ai</a> · <a href="https://clawhub.ai/skills/openclaw-auto-dream">ClawHub</a> · <a href="https://github.com/openclaw/openclaw">OpenClaw</a>
</p>

---

<p align="center">
  🌐 <a href="README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.fr.md">Français</a> · <a href="README.de.md">Deutsch</a> · <a href="README.ru.md">Русский</a> · <a href="README.ja.md">日本語</a> · <a href="README.it.md">Italiano</a> · Español
</p>

---

## El Problema

Todo agente de IA olvida. La sesión termina, el contexto desaparece. Los archivos se acumulan. ¿Cuál fue esa decisión de hace dos semanas? ¿Qué workflow funcionó la última vez? Tu agente tiene amnesia — funcional, pero olvidando todo en el momento en que se duerme.

**Auto-Dream soluciona esto.** Al igual que el cerebro humano consolida recuerdos durante el sueño, Auto-Dream ejecuta "ciclos de sueño" periódicos que escanean, extraen, organizan, puntúan, vinculan y podan el conocimiento de tu agente — automáticamente, de forma segura e inteligente.

## Por Qué Es Diferente

| Característica | Claude Code CLAUDE.md | Plugins de memoria típicos | **Auto-Dream** |
|----------------|----------------------|---------------------------|----------------|
| Capas de memoria | 1 archivo plano | 1 archivo o clave-valor | **5 capas cognitivas** |
| Puntuación | ❌ | ❌ | **Importancia × Recencia × Referencias** |
| Olvido | Limpieza manual | Eliminar o nada | **Decaimiento gradual + archivado** |
| Grafo de conocimiento | ❌ | ❌ | **Entradas vinculadas + alcanzabilidad** |
| Monitoreo de salud | ❌ | ❌ | **Puntuación de 5 métricas + seguimiento de tendencias** |
| Cross-instancia | ❌ | ❌ | **Bundles de exportación/importación/fusión** |
| Dashboard | ❌ | ❌ | **HTML interactivo con gráficos** |

## Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ┌─────────────┐   ┌──────────────┐   ┌───────────────────┐   │
│   │  RECOPILAR   │──▶│  CONSOLIDAR  │──▶│     EVALUAR       │   │
│   │             │   │              │   │                   │   │
│   │ Escanear    │   │ Enrutar por  │   │ Puntuar           │   │
│   │  7 días     │   │  capas       │   │  importancia      │   │
│   │ Detectar    │   │ Dedup semánt.│   │ Curva de olvido   │   │
│   │  marcadores │   │ Asignar IDs  │   │ Métricas de salud │   │
│   │ Extraer     │   │ Vincular     │   │ Generar           │   │
│   │  insights   │   │  relaciones  │   │  insights         │   │
│   └─────────────┘   └──────────────┘   └───────────────────┘   │
│                                                                  │
│                     ☽ Ciclo de Sueño ☾                           │
└──────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
     │  📊 Dashboard │ │ 🔔 Notificar│ │ 📝 Log del   │
     │  HTML+Gráfic.│ │ Push al chat│ │  sueño       │
     │              │ │             │ │ Agregar rep. │
     └──────────────┘ └─────────────┘ └──────────────┘
```

### Cinco Capas de Memoria

| Capa | Almacenamiento | Qué contiene |
|------|---------------|--------------|
| **Trabajo** | OpenClaw LCM (integrado) | Contexto de conversación activo |
| **Episódica** | `memory/episodes/*.md` | Narrativas de proyectos, cronologías de eventos, arcos argumentales |
| **Largo plazo** | `MEMORY.md` | Hechos, decisiones, personas, hitos, estrategia |
| **Procedimental** | `memory/procedures.md` | Workflows, preferencias, patrones de herramientas, atajos |
| **Índice** | `memory/index.json` | Metadatos, puntuaciones de importancia, relaciones, estadísticas de salud |

## Características

### 🧠 Ciclo de Sueño Cognitivo

Se ejecuta automáticamente vía cron (por defecto: diariamente a las 4 AM). Tres fases:

1. **Recopilar** — Escanea los logs diarios no consolidados (últimos 7 días), detecta marcadores de prioridad (`⚠️ PERMANENT`, `🔥 HIGH`, `📌 PIN`, `<!-- important -->`), extrae decisiones / personas / hechos / proyectos / lecciones / procedimientos / hilos abiertos

2. **Consolidar** — Enruta cada insight a la capa de memoria correcta, realiza deduplicación semántica, asigna IDs únicos (`mem_NNN`), crea vínculos de relación entre entradas conectadas

3. **Evaluar** — Puntúa la importancia con `base_weight × recency × reference_boost / 8.0`, aplica curvas de olvido (>90 días + baja importancia → archivado, nunca eliminado), calcula la puntuación de salud de 5 métricas, genera 1–3 observaciones no obvias, redacta el informe del sueño, envía la notificación

### 📊 Puntuación de Importancia

Cada entrada recibe una puntuación en cada ciclo de sueño:

```
importance = (base_weight × recency_factor × reference_boost) / 8.0
```

- **Recencia**: `max(0.1, 1.0 - days/180)` — decaimiento gradual en 6 meses
- **Referencias**: `log₂(count + 1)` — impulso logarítmico para entradas frecuentemente referenciadas
- **Marcadores**: `🔥 HIGH` duplica el peso base; `⚠️ PERMANENT` siempre puntúa 1.0

### 📉 Olvido Inteligente

Los recuerdos no se eliminan — se archivan con elegancia:
- La entrada debe tener >90 días sin referencias Y importancia < 0.3
- Se comprime a un resumen de una línea en `memory/archive.md`
- El ID original se preserva para el seguimiento de relaciones
- Las entradas `⚠️ PERMANENT` y `📌 PIN` son inmunes

### 🕸️ Grafo de Conocimiento

Las entradas están vinculadas por relaciones semánticas. La métrica de alcanzabilidad mide la conectividad del grafo:
- Algoritmo union-find sobre todas las relaciones de entradas
- Detecta clusters de conocimiento aislados
- Sugiere referencias cruzadas para mejorar la coherencia

### 🩺 Puntuación de Salud (5 Métricas)

```
health = (freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15) × 100
```

| Métrica | Qué mide |
|---------|----------|
| **Frescura** | % de entradas referenciadas en los últimos 30 días |
| **Cobertura** | % de categorías de conocimiento actualizadas en los últimos 14 días |
| **Coherencia** | % de entradas con al menos un vínculo de relación |
| **Eficiencia** | Cuán conciso se mantiene MEMORY.md (inversamente proporcional al conteo de líneas) |
| **Alcanzabilidad** | Cuán bien conectado está el grafo de memoria |

### 🔔 Notificaciones Push

Los resultados del sueño se entregan automáticamente en tu chat:

| Nivel | Qué recibes |
|-------|-------------|
| `silent` | Nada — registrado solo en dream-log.md |
| `summary` | `🌀 Salud: 82/100 \| +5 nuevos, ~3 actualizados, -1 archivado \| 💡 Insight principal` |
| `full` | Informe del sueño completo con todas las secciones |

### 📊 Dashboard Interactivo

Un dashboard HTML sin dependencias con:
- Indicador de salud animado (0–100)
- 5 tarjetas de métricas con código de colores
- Gráfico de dona de distribución de memoria
- Histograma de importancia
- Gráfico de líneas de tendencia de salud (últimos 30 ciclos)
- Visualización del grafo de conocimiento dirigido por fuerza
- Cambios recientes, insights, sugerencias, entradas obsoletas

Para generarlo: *"Mostrar el dashboard de memoria"*

### 🔄 Migración Cross-Instancia

Mueve recuerdos entre instancias de OpenClaw:

```
"Export memory bundle"    →  memory/export-2026-03-28.json
"Import memory bundle"    →  fusiona con los existentes (el más reciente gana)
"Export only procedures"  →  exportación selectiva por capa
```

Formato de bundle JSON portátil con metadatos completos, resolución de conflictos y respaldo pre-importación.

### 🔮 Insights del Sueño

Después de cada ciclo, 1–3 observaciones no obvias:
- **Conexiones de patrones** — *"La estrategia del Proyecto X refleja lo que funcionó para el Proyecto Y"*
- **Tendencias temporales** — *"Las decisiones estratégicas se agrupan los lunes — planificación semanal detectada"*
- **Detección de brechas** — *"Sin lecciones registradas para los últimos 4 proyectos — retrospectivas vencidas"*
- **Alertas de tendencia** — *"Salud en declive durante 3 ciclos: 85→79→72 — entradas obsoletas acumulándose"*
- **Análisis de densidad** — *"mem_042 referenciado por 8 entradas pero no tiene vínculos salientes"*

## Inicio Rápido

### Instalación

```bash
clawhub install openclaw-auto-dream
```

O clona manualmente:
```bash
git clone https://github.com/LeoYeAI/openclaw-auto-dream.git \
  ~/.openclaw/workspace/skills/openclaw-auto-dream
```

### Configuración

Dile a tu agente: **"Configura Auto-Dream"**

El agente:
1. Creará un cron job (por defecto: diariamente a las 4 AM en tu zona horaria)
2. Inicializará `memory/index.json` con el esquema v3.0
3. Preguntará tu nivel de notificación preferido
4. Ejecutará el primer ciclo de sueño

### Activación Manual

- *"Ejecutar mantenimiento de memoria"*
- *"Consolidar mis recuerdos"*
- *"Soñar ahora"*

### Dashboard

- *"Mostrar el dashboard de memoria"*
- *"Generar el dashboard de memoria"*

## Ejemplo de Informe del Sueño

```markdown
## 🌀 Informe del Sueño — 2026-03-28 04:00 UTC

### 📊 Estadísticas
- Escaneados: 7 archivos | Nuevos: 5 | Actualizados: 3 | Podados: 1
- MEMORY.md: 142 líneas | Episodios: 2 | Procedimientos: 8 entradas

### 🧠 Salud: 76/100
- Frescura: 72% | Cobertura: 80% | Coherencia: 55% | Eficiencia: 90% | Alcanzabilidad: 40%

### 🔮 Insights
- [Patrón] La trayectoria de crecimiento de MyClaw refleja la de Shopify en sus inicios — considerar su playbook de Serie A
- [Brecha] Sin archivo de episodio para la migración de infraestructura — 12 entradas relacionadas dispersas en los logs diarios

### 📝 Cambios
- [Nuevo] mem_089 — Decisión del roadmap de producto: priorizar el SDK móvil
- [Actualizado] mem_042 — Tamaño del equipo actualizado: 30 → 35
- [Archivado] mem_015 — Endpoint antiguo de API de staging (reemplazado hace 95 días)

### 💡 Sugerencias
- Coherencia al 55% — vincular mem_089 a las entradas de proyecto relacionadas
- Alcanzabilidad en 0.40 — 3 clusters de memoria aislados detectados; agregar referencias cruzadas
```

## Seguridad

| Regla | Por qué |
|-------|---------|
| Nunca eliminar los logs diarios | Fuente de verdad inmutable |
| Nunca eliminar `⚠️ PERMANENT` | La protección del usuario es absoluta |
| Los episodios son solo de adición | La historia narrativa se preserva para siempre |
| Auto-respaldo en >30% de cambios | Previene la corrupción accidental |
| Respaldo del índice en cada ciclo | Siempre recuperable |
| Política de secretos | Solo consolida secretos ya presentes |

## Actualización

| Desde | Hasta | Guía |
|-------|-------|------|
| v1.x | v2.x | [migration-v1-to-v2.md](references/migration-v1-to-v2.md) |
| v2.x | v3.0 | [migration-v2-to-v3.md](references/migration-v2-to-v3.md) |
| v1.x | v3.0 | [migration-v2-to-v3.md](references/migration-v2-to-v3.md) (incluye ruta directa) |

Todas las actualizaciones son no destructivas. Tus datos siempre se preservan.

## Cómo Funciona Por Dentro

Auto-Dream aprovecha las primitivas nativas de OpenClaw:

| Primitiva | Rol |
|-----------|-----|
| **Cron** | Programa los ciclos de sueño en intervalos configurables |
| **Sesiones aisladas** | Ejecuta la consolidación sin contaminar el historial del chat principal |
| **Sistema de archivos** | Lee/escribe archivos de memoria en las cinco capas |
| **LCM** | Proporciona compresión de memoria de trabajo para conversaciones largas |

Sin dependencias externas. Sin claves API. Sin bases de datos. Solo archivos e inteligencia.

## Acerca de MyClaw.ai

**[MyClaw.ai](https://myclaw.ai)** es la plataforma de asistente personal de IA que da a cada usuario un servidor dedicado con control total del código, capacidades de red y herramientas. Auto-Dream es parte del [ecosistema de skills abierto de MyClaw](https://myclaw.ai/skills) — donde los agentes aprenden nuevas capacidades a través de paquetes de skills instalables.

Cada instancia de MyClaw ejecuta OpenClaw. Cada instancia puede soñar.

## Licencia

[MIT](LICENSE)

---

<p align="center">
  <em>"El cerebro no deja de trabajar cuando duermes. Comienza su trabajo más importante."</em>
</p>
