"use strict";
// ============================================================
//   AI-HACK: страница команды (/1/ /2/ /3/) — IDE + нейронка
// ============================================================
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const teamNo = window.TEAM || (location.pathname.match(/\/(\d)(?:\/|$)/) || [])[1] * 1 || 0;
  if (!teamNo || teamNo < 1 || teamNo > 3) {
    document.body.innerHTML = "<div style='padding:60px;text-align:center;font-family:Segoe UI,sans-serif;color:#44546a'>Неизвестная команда. <a href='../'>← На главную</a></div>";
    return;
  }
  const task = taskById(teamNo);
  const MAXT = CONFIG.timeLimit * 60 * 1000;

  // ================= UI =================
  document.body.insertAdjacentHTML("beforeend",
    "<div class='bg'></div>" +
    "<header class='top'>" +
    "  <div class='logo'>🛰 <b>AI-HACK</b> <span class='badge top-badge'>PLATFORM v3</span></div>" +
    "  <div class='top-right'>" +
    "    <span class='chip'>КОМАНДА <b id='teamNum'>" + teamNo + "</b></span>" +
    "    <span class='chip mono-line' id='timerChip'>⏱ --:--</span>" +
    "  </div>" +
    "</header>" +
    "<div class='wrap'>" +
    "  <div class='final-banner' id='finalBanner' hidden>ФИНАЛЬНАЯ ПОПЫТКА · нейронка отключена — работайте с кодом и сдавайте работу</div>" +
    "  <section id='scrWork'>" +
    "    <div class='card task-band'>" +
    "      <div class='tb-left'>" +
    "        <div class='mono-tag'>ЗАДАНИЕ · КОМАНДА " + teamNo + "</div>" +
    "        <h1 class='tb-title'>" + esc(task.title) + "</h1>" +
    "        <p class='muted tb-desc'>" + esc(task.desc) + "</p>" +
    "      </div>" +
    "      <div class='tb-right'>" +
    "        <details class='req' open><summary>Требования — жюри проверяет каждый пункт</summary>" +
    "          <ul id='tMust'>" + task.must.map(m => "<li>" + esc(m) + "</li>").join("") + "</ul>" +
    "        </details>" +
    "      </div>" +
    "    </div>" +
    "    <div class='panes'>" +
    "      <div class='card pane'>" +
    "        <div class='pane-head'>" +
    "          <div class='pane-title'>🛠 РЕДАКТОР</div>" +
    "          <div class='actions' style='margin:0'>" +
    "            <button class='btn sm' id='runBtn' type='button'>▶ Запустить</button>" +
    "            <button class='btn sm ghost' id='clearBtn' type='button'>Очистить</button>" +
    "          </div>" +
    "        </div>" +
    "        <div class='ed-tabs' id='edTabs'>" +
    "          <button class='ed-tab on' data-ed='html' type='button'>index.html</button>" +
    "          <button class='ed-tab' data-ed='css' type='button'>style.css</button>" +
    "          <button class='ed-tab' data-ed='js' type='button'>script.js</button>" +
    "        </div>" +
    "        <textarea class='editor' id='ed-html' spellcheck='false' placeholder='<!-- HTML: структура страницы (то, что внутри <body>) -->'></textarea>" +
    "        <textarea class='editor' id='ed-css' spellcheck='false' hidden placeholder='/* CSS: стили */'></textarea>" +
    "        <textarea class='editor' id='ed-js' spellcheck='false' hidden placeholder='// JS: логика'></textarea>" +
    "        <div class='err' id='submitErr'></div>" +
    "        <button class='btn big' id='submitBtn' type='button'>📤 Проверили, работает — отправить работу</button>" +
    "      </div>" +
    "      <div class='card pane'>" +
    "        <div class='pane-head'>" +
    "          <div class='pane-title'>🤖 НЕЙРОНКА · ВЕГА</div>" +
    "          <div class='actions' style='margin:0'>" +
    "            <span class='badge' id='attemptBadge'>ПОПЫТКА 0/" + MAX_TRIES + "</span>" +
    "            <span class='chip' id='aiState'>" + (aiReady() ? "🟢 онлайн" : "🟡 перезагрузка") + "</span>" +
    "          </div>" +
    "        </div>" +
    "        <div class='chat'>" +
    "          <div class='chat-msgs' id='chatMsgs'></div>" +
    "          <div class='typing' id='typing' hidden>ВЕГА печатает…</div>" +
    "          <div class='chat-in'>" +
    "            <input type='text' id='chatInput' placeholder='Опиши, что нужно нейронке…'>" +
    "            <button class='btn' id='chatSend' type='button'>➤</button>" +
    "          </div>" +
    "        </div>" +
    "      </div>" +
    "    </div>" +
    "  </section>" +
    "  <section id='scrDone' hidden>" +
    "    <div class='card done-box'>" +
    "      <div class='big-emoji'>✅</div>" +
    "      <h2>Работа сдана</h2>" +
    "      <p class='muted'>QR-код работы появится здесь, как только GitHub Pages подхватит файл (~1 минута). Потом покажите его преподавателю — он дублируется на пульте.</p>" +
    "      <div class='qr-wrap' id='doneQr'></div>" +
    "      <div class='muted mono-line' id='doneUrl'></div>" +
    "      <div class='actions' style='justify-content:center'>" +
    "        <button class='btn' id='dlCopy' type='button'>💾 Скачать копию (.html)</button>" +
    "        <a class='btn ghost' id='openWork' target='_blank' href='#'>🌐 Открыть работу</a>" +
    "      </div>" +
    "    </div>" +
    "  </section>" +
    "</div>" +
    "<footer class='foot'>AI-HACK PLATFORM · команда " + teamNo + " · " + esc(task.title) + "</footer>" +
    "<div id='toast'></div>");

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ================= редактор =================
  $("#edTabs").addEventListener("click", e => {
    const b = e.target.closest(".ed-tab");
    if (!b) return;
    document.querySelectorAll(".ed-tab").forEach(x => x.classList.toggle("on", x === b));
    ["html", "css", "js"].forEach(k => { $("#ed-" + k).hidden = (k !== b.dataset.ed); });
  });
  $("#clearBtn").onclick = () => {
    if (!confirm("Очистить все три вкладки?")) return;
    $("#ed-html").value = ""; $("#ed-css").value = ""; $("#ed-js").value = "";
  };
  function assemble() {
    const h = $("#ed-html").value, c = $("#ed-css").value, j = $("#ed-js").value;
    return "<!DOCTYPE html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"UTF-8\">\n" +
      "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n" +
      "<title>Работа команды " + teamNo + "</title>\n<style>\n" + c + "\n</style>\n</head>\n<body>\n" +
      h + "\n<script>\n" + j + "\n<\/script>\n</body>\n</html>";
  }
  // «▶ Запустить» — превью прямо на странице (iframe), без новых вкладок:
  // так игра открывается всегда, даже если браузер блокирует window.open
  $("#runBtn").onclick = () => {
    const full = assemble();
    if (full.length < 400) { toast("Сначала вставь код (у нейронки справа есть кнопка «⚡ Вставить»)"); return; }
    showPreview(full);
  };
  function showPreview(full) {
    let ov = document.getElementById("previewOv");
    if (ov) ov.remove();
    ov = document.createElement("div");
    ov.id = "previewOv";
    ov.style.cssText = "position:fixed;inset:0;z-index:200;background:#0d1117;display:flex;flex-direction:column";
    ov.innerHTML =
      "<div style='display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--navy);flex-wrap:wrap'>" +
      "  <b style='color:#fff;font-size:14px;letter-spacing:1px'>▶ ПРЕВЬЮ ПРИЛОЖЕНИЯ</b>" +
      "  <span style='color:#9fb4d8;font-size:12px'>так работа будет выглядеть на отдельной странице</span>" +
      "  <span style='flex:1'></span>" +
      "  <button class='btn sm' id='pvNew' type='button'>↗ Новая вкладка</button>" +
      "  <button class='btn sm ghost' id='pvClose' type='button'>✖ Закрыть</button>" +
      "</div>" +
      "<iframe style='flex:1;width:100%;border:0;background:#fff'></iframe>";
    document.body.appendChild(ov);
    ov.querySelector("iframe").srcdoc = full;
    ov.querySelector("#pvClose").onclick = () => ov.remove();
    ov.querySelector("#pvNew").onclick = () => {
      const url = URL.createObjectURL(new Blob([full], { type: "text/html" }));
      const w = window.open(url, "_blank");
      if (w) toast("Открыл в новой вкладке");
    };
    document.addEventListener("keydown", function h(e) {
      if (e.key === "Escape") { ov.remove(); document.removeEventListener("keydown", h); }
    });
  }

  // ================= таймер (синхрон с пультом препода) =================
  let startedAt = Date.now();
  let syncedStart = false;
  async function syncStart() {
    try {
      const s = await ghReadStart();
      // первый подхват или новый старт (препода нажал «Начать занятие») — пересинхронизируемся
      if (s && (!syncedStart || s.start > startedAt)) {
        startedAt = s.start;
        syncedStart = true;
        localStorage.removeItem("hack_start_g" + teamNo);
      }
    } catch (e) {}
  }
  syncStart();
  if (!syncedStart) {
    startedAt = +localStorage.getItem("hack_start_g" + teamNo) || Date.now();
    localStorage.setItem("hack_start_g" + teamNo, String(startedAt));
  }
  // Pages подхватывает файл старта после сборки (~1 мин) — опрашиваем постоянно,
  // чтобы таймер перезапустился даже если страница команды уже открыта
  setInterval(syncStart, 10000);
  setInterval(() => {
    const left = MAXT - (Date.now() - startedAt);
    const el = $("#timerChip");
    if (left <= 0) { el.textContent = "⏱ ВРЕМЯ ВЫШЛО"; el.style.color = "var(--bad)"; return; }
    el.style.color = "";
    const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    el.textContent = "⏱ " + m + ":" + String(s).padStart(2, "0");
  }, 1000);

  // ================= чат с ВЕГОЙ =================
  let attempts = 0;
  let finished = false;
  let lastHtml = null;
  const history = [];

  function scrollChat() { const c = $("#chatMsgs"); c.scrollTop = c.scrollHeight; }
  function addMsg(cls, text) {
    const d = document.createElement("div");
    d.className = "msg " + cls;
    d.textContent = text;
    $("#chatMsgs").appendChild(d);
    scrollChat();
    return d;
  }
  function addBot(text, code) {
    const d = document.createElement("div");
    d.className = "msg bot";
    const p = document.createElement("span");
    p.textContent = text;
    d.appendChild(p);
    if (code) {
      const note = document.createElement("span");
      note.className = "code-note";
      note.textContent = "📄 Код готов (HTML + CSS + JS).";
      d.appendChild(note);
      const btns = document.createElement("div");
      btns.className = "msg-btns";
      const b = document.createElement("button");
      b.className = "btn sm"; b.type = "button";
      b.textContent = "⚡ Вставить в редактор";
      b.onclick = () => {
        $("#ed-html").value = code.html;
        $("#ed-css").value = code.css;
        $("#ed-js").value = code.js;
        toast("Код в редакторе! Жми «▶ Запустить»");
      };
      btns.appendChild(b);
      d.appendChild(btns);
    }
    $("#chatMsgs").appendChild(d);
    scrollChat();
  }
  function setTyping(on) { $("#typing").hidden = !on; }

  function lockNeuron() {
    finished = true;
    document.body.classList.add("final-mode");
    $("#finalBanner").hidden = false;
    $("#chatInput").disabled = true;
    $("#chatSend").disabled = true;
    $("#chatInput").placeholder = "Нейронка отключена — финальная попытка";
    $("#aiState").textContent = "⛔ отключена";
    $("#attemptBadge").textContent = "ФИНАЛ · " + (MAX_TRIES + 1) + "/" + (MAX_TRIES + 1);
  }

  async function sendChat(rawText) {
    const text = String(rawText || "").trim();
    if (!text || finished) return;
    attempts++;
    addMsg("user", text);
    $("#chatInput").value = "";
    if (attempts <= MAX_TRIES) $("#attemptBadge").textContent = "ПОПЫТКА " + attempts + "/" + MAX_TRIES;
    const btn = $("#chatSend");
    btn.disabled = true;
    setTyping(true);
    const t0 = Date.now();
    if (attempts > MAX_TRIES) {
      await sleep(1800); // финал отдаём с паузой, как живой ответ
      setTyping(false);
      btn.disabled = false;
      const fa = finalAnswer(task);
      addBot(fa.text, fa.code);
      lockNeuron();
      return;
    }
    let res;
    try {
      res = await studentReply(task, history);
    } catch (e) {
      const detail = /^[A-Z_]+$/.test(String(e.message || "")) ? "" : ": " + (e.message || e);
      res = { text: "🟡 Нестабильная связь с сервером" + detail + ". У вас ещё есть попытки — переформулируйте промт точнее: что за объект, какие правила, что должно быть на экране.", code: null, _err: true };
    }
    const wait = 1600 - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
    setTyping(false);
    btn.disabled = false;
    if (res._err) {
      $("#aiState").textContent = "🟡 перезагрузка";
    } else if (!aiReady()) {
      // ключ не настроен — честно, но без спойлеров
    } else {
      $("#aiState").textContent = "🟢 онлайн";
    }
    addBot(res.text, res.code || null);
    history.push({ role: "user", text: text });
    history.push({ role: "assistant", text: res.text });
  }

  $("#chatSend").onclick = () => sendChat($("#chatInput").value);
  $("#chatInput").addEventListener("keydown", e => { if (e.key === "Enter") sendChat($("#chatInput").value); });
  addBot(greeting(task));

  // ================= отправка на GitHub =================
  function copyText(s) {
    if (navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(s).then(() => true).catch(() => fallbackCopy(s));
    return Promise.resolve(fallbackCopy(s));
  }
  function fallbackCopy(s) {
    const ta = document.createElement("textarea");
    ta.value = s; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    return ok;
  }
  function downloadWork() {
    if (!lastHtml) return;
    const blob = new Blob([lastHtml], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "work_team" + teamNo + ".html";
    document.body.appendChild(a); a.click(); a.remove();
    toast("Копия работы скачана");
  }
  $("#dlCopy").onclick = downloadWork;

  $("#submitBtn").onclick = async () => {
    const err = $("#submitErr");
    err.textContent = "";
    const full = assemble();
    if (full.length < 400) { err.textContent = "Код слишком короткий — вставь его у нейронки (кнопка «⚡ Вставить в редактор»)."; return; }
    if (!confirm("Проверили, что работает? Отправляем работу на GitHub?")) return;
    const btn = $("#submitBtn");
    btn.disabled = true; btn.textContent = "Отправляю…";
    try {
      if (!ghConfigured()) throw new Error("GITHUB_NOT_SET");
      const url = await ghSubmit(teamNo, full);
      lastHtml = full;
      showDone(url);
    } catch (e) {
      lastHtml = full;
      if (e.message === "GITHUB_NOT_SET")
        err.textContent = "GitHub ещё не настроен (config.js → github). План Б: скачайте работу файлом и передайте преподавателю.";
      else err.textContent = "Не получилось отправить: " + e.message + " (попробуйте ещё раз)";
    }
    btn.disabled = false; btn.textContent = "📤 Проверили, работает — отправить работу";
  };

  function renderQr(box, url) {
    box.innerHTML = "";
    try {
      if (window.QRCode) new QRCode(box, { text: url, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
      else box.innerHTML = "<p style='color:#000'>QR-библиотека не загрузилась (нужен интернет)</p>";
    } catch (e) { box.innerHTML = "<p style='color:#000'>QR-ошибка</p>"; }
  }
  function showDone(url) {
    $("#scrWork").hidden = true;
    $("#scrDone").hidden = false;
    $("#doneUrl").textContent = url;
    $("#openWork").href = url;
    const box = $("#doneQr");
    box.innerHTML = "<div style='text-align:center;padding:30px 0'><div style='font-size:32px'>⏳</div><div style='margin-top:10px;font-size:15px;font-weight:600'>СОБИРАЕМ РАБОТУ… (~1 мин)</div><div style='margin-top:6px;font-size:13px;color:#44546a'>QR появится, как только GitHub Pages подхватит файл</div></div>";
    window.scrollTo({ top: 0 });
    // QR показываем только когда работа реально на сайте (Pages собирает ~1 минуту)
    let tries = 0;
    (async () => {
      while (tries < 45) {
        await sleep(5000);
        tries++;
        if (await ghWorkLive(teamNo)) {
          renderQr(box, url);
          toast("Работа на сайте — QR готов!");
          return;
        }
        box.innerHTML = "<div style='text-align:center;padding:30px 0'><div style='font-size:32px'>⏳</div><div style='margin-top:10px;font-size:15px;font-weight:600'>СОБИРАЕМ РАБОТУ… (~1 мин)</div><div style='margin-top:6px;font-size:13px;color:#44546a'>Pages пересобирает сайт · ожидание " + tries + " из 45</div></div>";
      }
      renderQr(box, url);
      toast("QR показан — если ссылка пока не открывается, подождите минуту");
    })();
  }
})();
