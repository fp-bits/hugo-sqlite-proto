// static/search.js — búsqueda en el navegador. Vainilla ES6+, sin dependencias.
// Estilo funcional: funciones puras arriba; el DOM (efectos) solo al final.
//
// MDN:
//   fetch                 https://developer.mozilla.org/es/docs/Web/API/Fetch_API
//   Array.filter / every  https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
//   String.normalize      https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
//   Element.replaceChildren https://developer.mozilla.org/es/docs/Web/API/Element/replaceChildren
//   Escapes Unicode \p{M} https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape

// --- puras ------------------------------------------------------------------

// "Árbol" → "arbol": minúsculas y sin acentos
const normalize = s => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

const terms = query => normalize(query).split(/\s+/).filter(Boolean);

const haystack = post => normalize(`${post.title} ${post.tags.join(" ")} ${post.text}`);

// Un post coincide si contiene TODOS los términos
const matches = ts => post => ts.every(t => haystack(post).includes(t));

// Cuenta cuántas veces aparece un término en un texto normalizado
const countTerm = (text, term) => text.split(term).length - 1;

// Suma total de coincidencias de todos los términos en el post
const score = ts => post => {
  const text = haystack(post);
  return ts.reduce((acc, t) => acc + countTerm(text, t), 0);
};

// Filtra y ordena los resultados de mayor a menor número de coincidencias
const search = (posts, query) => {
  const ts = terms(query);
  if (!ts.length) return [];
  return posts
    .filter(matches(ts))
    .map(post => ({ post, hits: score(ts)(post) }))
    .sort((a, b) => b.hits - a.hits)
    .map(({ post }) => post);
};

// --- efectos (DOM) ----------------------------------------------------------

// textContent, nunca innerHTML: el contenido se trata como texto, no como HTML
const toItem = base => post => {
  const a = document.createElement("a");
  a.href = base.replace(/\/$/, "") + post.url;
  a.textContent = post.title;

  const reading = post.reading_minutes ? ` (${post.reading_minutes} min)` : "";
  const meta = document.createElement("span");
  meta.className = "meta";
  meta.textContent = ` ${post.date.slice(0, 10)}${reading} — ${post.summary}`;

  const li = document.createElement("li");
  li.append(a, meta);
  return li;
};

const emptyItem = () => {
  const li = document.createElement("li");
  li.className = "meta";
  li.textContent = "Sin resultados.";
  return li;
};

const main = async () => {
  const input = document.querySelector("#q");
  const list = document.querySelector("#results");
  if (!input || !list) return;

  const { index, base } = list.dataset;
  const posts = await fetch(index).then(r => r.json());

  input.addEventListener("input", () => {
    const found = search(posts, input.value);
    const items = found.map(toItem(base));
    list.replaceChildren(...(items.length || !input.value.trim() ? items : [emptyItem()]));
  });
};

main().catch(err => console.error("search.js:", err));
