"use strict";
// ============================================================
//   GitHub: приём работ (Contents API) + список работ для панели
// ============================================================

function b64(str) { return btoa(unescape(encodeURIComponent(str))); }

function ghHeaders() {
  const h = { "Accept": "application/vnd.github+json", "User-Agent": "ai-hack-submission" };
  if (CONFIG.github.token) h["Authorization"] = "Bearer " + CONFIG.github.token;
  return h;
}

function ghConfigured() {
  const g = CONFIG.github;
  return !!(g.owner && g.repo && g.token);
}

// Отправить работу команды. Возвращает URL, который попадёт в QR.
async function ghSubmit(group, html) {
  const g = CONFIG.github;
  if (!ghConfigured()) throw new Error("GITHUB_NOT_SET");
  const path = "works/team" + group + ".html";
  const url = "https://api.github.com/repos/" + g.owner + "/" + g.repo + "/contents/" + path;

  // если файл уже есть (пересдача) — берём sha
  let sha;
  const cur = await fetch(url, { headers: ghHeaders() });
  if (cur.ok) sha = (await cur.json()).sha;
  else if (cur.status !== 404) throw new Error("GitHub " + cur.status);

  const r = await fetch(url, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify({
      message: "team" + group + " submission " + new Date().toISOString(),
      content: b64(html),
      sha: sha
    })
  });
  if (!r.ok) {
    let msg = "GitHub " + r.status;
    try { const j = await r.json(); if (j.message) msg += ": " + j.message; } catch (e) {}
    throw new Error(msg);
  }
  if (g.pagesBase) return g.pagesBase.replace(/\/?$/, "/") + path;
  return "https://github.com/" + g.owner + "/" + g.repo + "/blob/main/" + path;
}

// Список работ (для панели преподавателя). Публичный репо — без токена.
async function ghListWorks() {
  const g = CONFIG.github;
  if (!g.owner || !g.repo) throw new Error("GITHUB_NOT_SET");
  const url = "https://api.github.com/repos/" + g.owner + "/" + g.repo + "/contents/works";
  const r = await fetch(url, { headers: ghHeaders() });
  if (r.status === 404) return { missing: true, works: {} };
  if (!r.ok) throw new Error("GitHub list " + r.status);
  const arr = await r.json();
  const works = {};
  for (const f of arr) {
    const m = f.name.match(/^team(\d+)\.html$/);
    if (m) works[+m[1]] = { name: f.name, size: f.size, updated: f.updated_at };
  }
  return { missing: false, works };
}
