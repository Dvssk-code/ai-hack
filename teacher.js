"use strict";
// ============================================================
//   AI-HACK: пульт преподавателя — команды, демо-стенд, старт, QR
// ============================================================
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = (CONFIG.github.pagesBase || "").replace(/\/?$/, "/");

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}
function fmt(ms) {
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
  return m + ":" + String(s).padStart(2, "0");
}

// ---------- 01 · QR страниц команд ----------
function pageQr(id) {
  const box = $("#pageQr" + id);
  if (window.QRCode) new QRCode(box, { text: BASE + id + "/", width: 92, height: 92, correctLevel: QRCode.CorrectLevel.M });
  else box.innerHTML = "<span class='muted'>QR н/д</span>";
}
[1, 2, 3].forEach(pageQr);

// ---------- единая ссылка для студентов ----------
(function () {
  const urlEl = $("#rootUrl");
  const root = BASE.replace(/\/$/, "");
  if (urlEl) urlEl.textContent = root;
  const box = $("#rootQr");
  if (box && window.QRCode) new QRCode(box, { text: root, width: 110, height: 110, correctLevel: QRCode.CorrectLevel.M });
})();

// ---------- 03 · работы ----------
function workUrl(id) { return BASE + "works/team" + id + ".html"; }
// работа в репозитории ≠ на сайте: Pages добирает файл ~1 минуту
let workLive = {};
function renderWork(id, meta) {
  const wait = $("#workWait" + id), slot = $("#workQr" + id), urlEl = $("#workUrl" + id), ts = $("#teamStatus" + id);
  if (meta) {
    urlEl.textContent = workUrl(id);
    if (!workLive[id]) {
      wait.hidden = false;
      wait.textContent = "⏳ СДАНА · СОБИРАЕТСЯ НА САЙТЕ (~1 МИН)";
      slot.hidden = true;
      slot.innerHTML = "";
      ts.textContent = "работа: сдана · сборка Pages…";
      ts.className = "tc-status status-wait";
      return;
    }
    wait.hidden = true;
    slot.hidden = false;
    slot.innerHTML = "";
    if (window.QRCode) new QRCode(slot, { text: workUrl(id), width: 190, height: 190, correctLevel: QRCode.CorrectLevel.M });
    else slot.innerHTML = "<p style='color:#000'>QR н/д</p>";
    ts.textContent = "работа: на сайте · обновлена " + new Date(meta.updated).toLocaleTimeString();
    ts.className = "tc-status status-ok";
  } else {
    workLive[id] = false;
    wait.hidden = false;
    wait.textContent = "ОЖИДАНИЕ РАБОТЫ";
    slot.hidden = true;
    slot.innerHTML = "";
    urlEl.textContent = "";
    ts.textContent = "работа: ожидание…";
    ts.className = "tc-status status-wait";
  }
}
async function pollWorks() {
  try {
    const r = await ghListWorks();
    let ok = 0;
    for (const id of [1, 2, 3]) {
      if (r.works[id]) {
        ok++;
        workLive[id] = await ghWorkLive(id);
      } else {
        workLive[id] = false;
      }
      renderWork(id, r.works[id] || null);
    }
    const live = [1, 2, 3].filter(id => workLive[id]).length;
    $("#ghStatus").textContent = ok ? ("Сдано работ: " + ok + " из 3 · на сайте: " + live + " · " + new Date().toLocaleTimeString()) : "Сдано работ: 0 из 3 — ждём команды";
    $("#ghStatusChip").textContent = live ? "🟢 " + live + "/3 на сайте" : (ok ? "🟡 " + ok + "/3 сдаёт" : "🟡 0/3 работ");
  } catch (e) {
    $("#ghStatus").textContent = "Связь с GitHub неустойчива: " + e.message;
    $("#ghStatusChip").textContent = "🔴 ошибка";
  }
}
pollWorks();
setInterval(pollWorks, 8000);

// ---------- старт занятия ----------
let lessonStart = 0;
let startingWait = false;
async function readStart() {
  const st = await ghReadStart();
  if (st) {
    lessonStart = st.start;
    $("#startStatus").textContent = "занятие стартовало в " + new Date(st.start).toLocaleTimeString();
  } else {
    lessonStart = 0;
    $("#startStatus").textContent = "занятие ещё не стартовало";
  }
}
readStart();
// пульт мог быть открыт до старта — подхватываем файл старта после сборки Pages
// (не мешает фазе «идёт ресет» после нажатия кнопки)
setInterval(() => { if (!lessonStart && !startingWait) readStart(); }, 20000);
setInterval(() => {
  if (!lessonStart) return;
  const left = CONFIG.timeLimit * 60 * 1000 - (Date.now() - lessonStart);
  $("#lessonTimer").textContent = left > 0 ? "⏱ " + fmt(left) : "⏱ ВРЕМЯ ВЫШЛО";
}, 1000);

$("#startBtn").onclick = async () => {
  if (!confirm("Сбросить работы всех трёх команд и запустить общий таймер " + CONFIG.timeLimit + ":00?")) return;
  const btn = $("#startBtn");
  btn.disabled = true; btn.textContent = "Ресетим…";
  $("#startStatus").textContent = "очищаем работы…";
  $("#lessonTimer").textContent = "";
  startingWait = true;
  try {
    await ghResetWorks();
    await ghSetStart();
    lessonStart = 0;
    $("#startStatus").textContent = "⏳ Ресетим… старт занятия через ~1 минуту (Pages пересобирает сайт)";
    $("#lessonTimer").textContent = "⏱ ИДЁТ РЕСЕТ…";
    toast("Работы очищены, старт через ~1 минуту");
    await pollWorks();
    let synced = false;
    for (let i = 0; i < 30; i++) {
      await sleep(5000);
      const s = await ghReadStart();
      if (s) {
        lessonStart = s.start;
        $("#startStatus").textContent = "Занятие стартовало в " + new Date(s.start).toLocaleTimeString() + " · страницы команд синхронизированы";
        synced = true;
        break;
      }
    }
    if (!synced) {
      lessonStart = Date.now();
      $("#startStatus").textContent = "⚠️ Pages не пересобрался за 2,5 мин — считаем с " + new Date().toLocaleTimeString();
    }
  } catch (e) {
    lessonStart = 0;
    $("#startStatus").textContent = "Ошибка: " + e.message;
    $("#lessonTimer").textContent = "";
  }
  startingWait = false;
  btn.disabled = false; btn.textContent = "🚀 Начать занятие";
};

// ---------- 02 · демо-стенд ----------
$("#demoEdTabs").addEventListener("click", e => {
  const b = e.target.closest(".ed-tab");
  if (!b) return;
  document.querySelectorAll("#demoEdTabs .ed-tab").forEach(x => x.classList.toggle("on", x === b));
  ["html", "css", "js"].forEach(k => { $("#demoEd" + k[0].toUpperCase() + k.slice(1)).hidden = (k !== b.dataset.ed); });
});
$("#demoClear").onclick = () => {
  if (!confirm("Очистить демо-редактор?")) return;
  $("#demoEdHtml").value = ""; $("#demoEdCss").value = ""; $("#demoEdJs").value = "";
};
$("#demoRunApp").onclick = () => {
  const h = $("#demoEdHtml").value, c = $("#demoEdCss").value, j = $("#demoEdJs").value;
  if (h.length + c.length + j.length < 100) { toast("Сначала прогоните сценарий — код вставится сам"); return; }
  const full = "<!DOCTYPE html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"UTF-8\">\n" +
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>Симулятор гравитации</title>\n" +
    "<style>\n" + c + "\n</style>\n</head>\n<body>\n" + h + "\n<script>\n" + j + "\n<\/script>\n</body>\n</html>";
  const url = URL.createObjectURL(new Blob([full], { type: "text/html" }));
  window.open(url, "_blank") || toast("Браузер заблокировал новую вкладку");
};

function dScroll() { const c = $("#demoMsgs"); c.scrollTop = c.scrollHeight; }
function dMsg(cls, text, label) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  if (label) { const l = document.createElement("span"); l.className = "msg-label"; l.textContent = label; d.appendChild(l); }
  const p = document.createElement("span"); p.textContent = text; d.appendChild(p);
  $("#demoMsgs").appendChild(d); dScroll();
  return d;
}
function dBot(text, code) {
  const d = document.createElement("div");
  d.className = "msg bot";
  const l = document.createElement("span"); l.className = "msg-label"; l.textContent = "ВЕГА · НЕЙРОНКА";
  d.appendChild(l);
  const p = document.createElement("span"); p.textContent = text; d.appendChild(p);
  if (code) {
    const note = document.createElement("span"); note.className = "code-note"; note.textContent = "📄 Код готов.";
    d.appendChild(note);
    const btns = document.createElement("div"); btns.className = "msg-btns";
    const b = document.createElement("button"); b.className = "btn sm"; b.type = "button";
    b.textContent = "⚡ Вставить в демо-редактор";
    b.onclick = () => {
      $("#demoEdHtml").value = code.html;
      $("#demoEdCss").value = code.css;
      $("#demoEdJs").value = code.js;
      toast("Код в демо-редакторе — жмите «▶ Запустить»");
    };
    btns.appendChild(b); d.appendChild(btns);
  }
  $("#demoMsgs").appendChild(d); dScroll();
}
function dTyping(on) { $("#demoTyping").hidden = !on; }
dMsg("bot", "Демо-стенд готов. Жмите «▶ Прогнать сценарий» — покажу классу, как команды собирают приложение.", "ВЕГА · НЕЙРОНКА");

let demoBusy = false;
async function runScenario() {
  if (demoBusy) return;
  demoBusy = true;
  $("#demoRun").disabled = true;
  $("#demoReset").disabled = true;
  $("#demoState").textContent = "СЦЕНАРИЙ ИДЁТ";
  for (const step of DEMO_STEPS) {
    if (step.t === "teacher") {
      await sleep(900);
      dMsg("teacher", step.text, "ПРЕПОДАВАТЕЛЬ");
    } else if (step.t === "prompt") {
      await sleep(800);
      dMsg("user", step.text, "ПРОМТ");
      dTyping(true);
      await sleep(step.wait || 2500);
      dTyping(false);
      dBot(step.reply, step.code ? demoCode(step.code) : null);
    }
  }
  $("#demoState").textContent = "СЦЕНАРИЙ ЗАВЕРШЁН";
  $("#demoRun").disabled = false;
  $("#demoReset").disabled = false;
  demoBusy = false;
}
$("#demoRun").onclick = runScenario;
$("#demoReset").onclick = () => {
  if (demoBusy) return;
  $("#demoMsgs").innerHTML = "";
  $("#demoEdHtml").value = ""; $("#demoEdCss").value = ""; $("#demoEdJs").value = "";
  $("#demoState").textContent = "ГОТОВ К ПРОГОНУ";
  dMsg("bot", "Демо-стенд готов. Жмите «▶ Прогнать сценарий» — покажу классу, как команды собирают приложение.", "ВЕГА · НЕЙРОНКА");
};

// свободный ввод в демо — без API
function demoManual() {
  const text = $("#demoInput").value.trim();
  if (!text || demoBusy) return;
  $("#demoInput").value = "";
  dMsg("user", text, "ПРОМТ");
  dTyping(true);
  setTimeout(() => {
    dTyping(false);
    dBot("Демо-режим: свободные вопросы не обрабатываю — это сценарный стенд. Для полного прогона жмите «▶ Прогнать сценарий».", null);
  }, 1200);
}
$("#demoSend").onclick = demoManual;
$("#demoInput").addEventListener("keydown", e => { if (e.key === "Enter") demoManual(); });
