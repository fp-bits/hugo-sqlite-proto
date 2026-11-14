---
title: "Consultas SQL en SQLite para generar JSON"
date: 2026-11-14
tags: [sql]
---
Con la extensión `json1` de SQLite se puede sacar el JSON directamente desde una consulta `SELECT`, sin montarlo luego en Python.

Por ejemplo, para contar cuántas páginas tiene cada etiqueta:

```sql
SELECT tag, COUNT(*) AS total
FROM tags
GROUP BY tag
ORDER BY total DESC, tag;
```

Así `tools/index.py` solo ejecuta las consultas y guarda el resultado en `data/tags.json` y `static/search.json`.
