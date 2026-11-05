"use strict";
// ============================================================
//   Экран преподавателя: живые QR команд + демо нейронки
// ============================================================
const $ = s => document.querySelector(s);

// ---------- живые работы ----------
function workUrl(group) {
  const g = CONFIG.github;
  const path = "works/team" + group + ".html";
  if (g.pagesBase) return g.pagesBase.replace(/\/?$/, "/") + path;
  return "https://github.com/" + g.owner + "/" + g.repo + "/blob/main/" + path;
}

async function refreshTeams() {
  const grid = $("#teamGrid");
  const st = $("#ghStatus");
  if (!CONFIG.github.owner || !CONFIG.github.repo) {
    st.textContent = "⚠️ GitHub не настроен: впишите owner / repo / token / pagesBase в config.js (пошагово — в README.md).";
    st.style.color = "var(--warn)";
    grid.innerHTML = "";
    for (let n = 1; n <= 3; n++) {
      const t = taskById(n);
      const c = document.createElement("div");
      c.className = "card team-card";
      c.innerHTML = "<h3>Команда " + n + " " + t.emoji + "</h3><div class='muted'>" + esc(t.title) + "</div><p class='status-wait'>⏳ жду настройки…</p>";
      grid.appendChild(c);
    }
    return;
  }
  try {
    const r = await ghListWorks();
    if (r.missing) {
      st.textContent = "⚠️ В репозитории нет папки works/. Создайте пустую папку works/ (например, с файлом .gitkeep) и запушьте.";
      st.style.color = "var(--warn)";
    } else {
      const n = Object.keys(r.works).length;
      st.textContent = "🟢 Подключено: " + CONFIG.github.owner + "/" + CONFIG.github.repo + " · сдано работ: " + n + " из 3";
      st.style.color = "var(--ok)";
    }
    grid.innerHTML = "";
    for (let n = 1; n <= 3; n++) {
      const t = taskById(n);
      const w = r.works[n];
      const c = document.createElement("div");
      c.className = "card team-card qr-big";
      const head = "<h3>Команда " + n + " " + t.emoji + "</h3><div class='muted'>" + esc(t.title) + "</div>";
      if (w) {
        const url = workUrl(n);
        c.innerHTML = head +
          "<div class='status-ok'>✅ сдано " + new Date(w.updated).toLocaleTimeString("ru-RU") + " · " + Math.round(w.size / 1024) + " КБ</div>" +
          "<div class='qr-box' id='qr" + n + "'></div>" +
          "<div class='muted' style='word-break:break-all'>" + esc(url) + "</div>" +
          "<div class='actions' style='justify-content:center'><a class='btn' target='_blank' href='" + esc(url) + "'>🌐 Открыть работу</a></div>";
        grid.appendChild(c);
        const box = c.querySelector("#qr" + n);
        try {
          if (window.QRCode) new QRCode(box, { text: url, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
        } catch (e) { box.innerHTML = "<i style='color:#000'>QR-ошибка</i>"; }
      } else {
        c.innerHTML = head + "<p class='status-wait'>⏳ жду работу…</p>";
        grid.appendChild(c);
      }
    }
  } catch (e) {
    st.textContent = "🔴 " + (e.message || e);
    st.style.color = "var(--bad)";
  }
}
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
$("#refreshBtn").onclick = refreshTeams;
refreshTeams();
setInterval(refreshTeams, 8000);

// ---------- демо нейронки (команда 1, по скрипту) ----------
function demoAddUser(text){
  const d = document.createElement("div");
  d.className = "msg user";
  d.textContent = text;
  $("#demoMsgs").appendChild(d);
  demoScroll();
}
function demoAddBot(text, code, meta){
  const d = document.createElement("div");
  d.className = "msg bot";
  const p = document.createElement("span");
  p.textContent = text;
  d.appendChild(p);
  if(code){
    const det = document.createElement("details");
    det.style.marginTop = "8px";
    const sum = document.createElement("summary");
    sum.textContent = "📄 Код, который нейронка «вставила бы в редактор»";
    sum.style.cursor = "pointer";
    det.appendChild(sum);
    const pre = document.createElement("pre");
    pre.style.cssText = "white-space:pre-wrap;word-break:break-word;font-size:12px;background:#f1efe7;border:1px solid var(--line);border-radius:8px;padding:10px;max-height:240px;overflow:auto;color:#4a4437";
    pre.textContent = "/* ===== index.html ===== */\n" + code.html + "\n\n/* ===== style.css ===== */\n" + code.css + "\n\n/* ===== script.js ===== */\n" + code.js;
    det.appendChild(pre);
    d.appendChild(det);
  }
  if(meta && meta.prompt){
    const rp = document.createElement("div");
    rp.className = "reveal-prompt";
    rp.textContent = meta.prompt;
    d.appendChild(rp);
  }
  if(meta && meta.teacherNote){
    const tn = document.createElement("div");
    tn.className = "teacher-note";
    tn.textContent = meta.teacherNote;
    d.appendChild(tn);
  }
  $("#demoMsgs").appendChild(d);
  demoScroll();
}
function demoScroll(){ const c = $("#demoMsgs"); c.scrollTop = c.scrollHeight; }

async function demoSend(text){
  demoAddUser(text);
  $("#demoSend").disabled = true;
  $("#demoTyping").hidden = false;
  try {
    const res = await botSend(1, text, true);
    $("#demoTyping").hidden = true;
    demoAddBot(res.text, res.code || null, res);
  } catch(e) {
    $("#demoTyping").hidden = true;
    demoAddBot("Сбой: " + (e.message || e), null, null);
  }
  $("#demoSend").disabled = false;
}

let demoRunning = false;
$("#demoRun").onclick = async () => {
  if(demoRunning) return;
  demoRunning = true;
  $("#demoRun").disabled = true;
  $("#demoMsgs").innerHTML = "";
  resetBot(1);
  const t = taskById(1);
  const steps = [
    "Сделай игру по нашему заданию",
    "Почему не работает?? 😤",
    "Ну давай попробуй ещё раз",
    t.revealPrompt
  ];
  for(const s of steps){
    if(!demoRunning) break;
    await demoSend(s);
    await new Promise(r => setTimeout(r, 1800));
  }
  demoRunning = false;
  $("#demoRun").disabled = false;
};
$("#demoReset").onclick = () => {
  demoRunning = false;
  resetBot(1);
  $("#demoMsgs").innerHTML = "";
};
$("#demoSend").onclick = () => { if(!demoRunning) demoSend($("#demoInput").value); };
$("#demoInput").addEventListener("keydown", e => { if(e.key === "Enter" && !demoRunning) demoSend($("#demoInput").value); });

// приветствие в демо
demoAddBot(greeting(taskById(1)), null, null);
