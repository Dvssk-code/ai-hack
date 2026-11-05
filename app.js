"use strict";
// ============================================================
//   Студент: выбор группы → IDE + нейронка → запуск → отправка
// ============================================================
const $ = s => document.querySelector(s);
let myGroup = null, myTask = null, startedAt = null, timerInt = null, lastSubmittedUrl = null, lastHtml = null;

function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------- экран выбора группы ----------
(function(){
  const g = $("#groupGrid");
  for(let n = 1; n <= 3; n++){
    const t = taskById(n);
    const b = document.createElement("button");
    b.className = "group-btn"; b.type = "button";
    b.innerHTML = n + "<small>" + t.emoji + " " + t.title + "</small>";
    b.onclick = () => openWork(n);
    g.appendChild(b);
  }
})();

function openWork(n){
  myGroup = n;
  myTask = taskById(n);
  $("#groupChip").hidden = false;
  $("#groupNum").textContent = n;
  $("#tEmoji").textContent = myTask.emoji;
  $("#tTitle").textContent = "Задание: " + myTask.title;
  $("#tDesc").textContent = myTask.desc;
  $("#tMust").innerHTML = myTask.must.map(m => "<li>" + esc(m) + "</li>").join("");
  $("#scrGroup").hidden = true;
  $("#scrWork").hidden = false;
  $("#submitErr").textContent = "";
  startTimer();
  // приветствие нейронки
  addBot(greeting(myTask), null, null);
  window.scrollTo({ top: 0 });
}

// ---------- таймер ----------
function startTimer(){
  clearInterval(timerInt);
  startedAt = localStorage.getItem("hack_start_g" + myGroup) || String(Date.now());
  localStorage.setItem("hack_start_g" + myGroup, startedAt);
  tick();
  timerInt = setInterval(tick, 1000);
}
function tick(){
  const total = CONFIG.timeLimit * 60 * 1000;
  const left = total - (Date.now() - (+startedAt));
  const el = $("#timerChip");
  if(left <= 0){ el.textContent = "⏰ время вышло! Сдавай, пока жюри смотрит"; el.style.color = "var(--bad)"; return; }
  el.style.color = "";
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  el.textContent = "⏱ " + m + ":" + String(s).padStart(2, "0");
}

// ---------- редактор ----------
$("#edTabs").addEventListener("click", e => {
  const b = e.target.closest(".ed-tab");
  if(!b) return;
  document.querySelectorAll(".ed-tab").forEach(x => x.classList.toggle("on", x === b));
  ["html","css","js"].forEach(k => $("#ed-" + k).hidden = k !== b.dataset.ed);
});
$("#clearBtn").onclick = () => {
  if(!confirm("Очистить все три вкладки?")) return;
  $("#ed-html").value = ""; $("#ed-css").value = ""; $("#ed-js").value = "";
};

function assemble(){
  const h = $("#ed-html").value, c = $("#ed-css").value, j = $("#ed-js").value;
  return "<!DOCTYPE html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"UTF-8\">\n" +
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n" +
    "<title>Работа команды " + myGroup + "</title>\n<style>\n" + c + "\n</style>\n</head>\n<body>\n" +
    h + "\n<script>\n" + j + "\n<\/script>\n</body>\n</html>";
}
$("#runBtn").onclick = () => {
  const full = assemble();
  if(full.length < 400){ toast("Сначала вставь код (у нейронки справа есть кнопка «⚡ Вставить»)"); return; }
  const url = URL.createObjectURL(new Blob([full], { type: "text/html" }));
  const w = window.open(url, "_blank");
  if(w){
    toast("Открыл в новой вкладке. Проверь, что всё работает!");
  } else {
    // popup-блокеры: показываем превью прямо на странице
    showPreview(url);
  }
};
function showPreview(url){
  let ov = document.getElementById("previewOv");
  if(ov) ov.remove();
  ov = document.createElement("div");
  ov.id = "previewOv";
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px";
  ov.innerHTML = "<div style='background:#111a30;border:1px solid var(--a2);border-radius:14px;padding:14px 22px;text-align:center'>" +
    "<b>Превью твоего приложения</b> <span class='muted'>(браузер заблокировал новую вкладку)</span><br>" +
    "<button class='btn sm' style='margin-top:10px'>🌐 Всё-таки открыть в новой вкладке</button>" +
    "<button class='btn sm ghost' style='margin-top:10px'>✖ Закрыть</button></div>" +
    "<iframe src='" + url + "' style='width:min(900px,92vw);height:min(560px,60vh);border-radius:14px;background:#fff;border:1px solid var(--line)'></iframe>";
  document.body.appendChild(ov);
  ov.querySelector("button").onclick = () => { window.open(url, "_blank"); ov.remove(); };
  ov.querySelectorAll("button")[1].onclick = () => ov.remove();
}

// ---------- чат с нейронкой ----------
function addUser(text){
  const d = document.createElement("div");
  d.className = "msg user";
  d.textContent = text;
  $("#chatMsgs").appendChild(d);
  scrollChat();
}
function addBot(text, code, meta){
  const d = document.createElement("div");
  d.className = "msg bot";
  d.textContent = "";
  const p = document.createElement("span");
  p.textContent = text;
  d.appendChild(p);

  if(code){
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
  if(meta && meta.prompt){
    const rp = document.createElement("div");
    rp.className = "reveal-prompt";
    rp.textContent = meta.prompt;
    d.appendChild(rp);
    const btns = document.createElement("div");
    btns.className = "msg-btns";
    const cp = document.createElement("button");
    cp.className = "btn sm ghost"; cp.type = "button";
    cp.textContent = "📋 Скопировать";
    cp.onclick = () => copyText(meta.prompt).then(ok => toast(ok ? "Промпт скопирован" : "Скопируй вручную"));
    const go = document.createElement("button");
    go.className = "btn sm"; go.type = "button";
    go.textContent = "📨 Отправить этот промпт нейронке";
    go.onclick = () => sendChat(meta.prompt);
    btns.appendChild(cp); btns.appendChild(go);
    d.appendChild(btns);
  }
  $("#chatMsgs").appendChild(d);
  scrollChat();
  return d;
}
function scrollChat(){ const c = $("#chatMsgs"); c.scrollTop = c.scrollHeight; }

function copyText(s){
  if(navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(s).then(() => true).catch(() => fallbackCopy(s));
  }
  return Promise.resolve(fallbackCopy(s));
}
function fallbackCopy(s){
  const ta = document.createElement("textarea");
  ta.value = s; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand("copy"); } catch(e){}
  ta.remove();
  return ok;
}

async function sendChat(text){
  text = String(text || "").trim();
  if(!text) return;
  if(!myTask) return;
  addUser(text);
  $("#chatInput").value = "";
  $("#chatSend").disabled = true;
  $("#typing").hidden = false;
  try{
    const res = await botSend(myGroup, text, false);
    $("#typing").hidden = true;
    if(res.kind === "api" || res.kind === "off"){
      $("#aiState").textContent = res.kind === "api" ? "🟢 нейронка онлайн" : "🟡 нейронка перезагружается";
    }
    addBot(res.text, res.code || null, res);
  } catch(e){
    $("#typing").hidden = true;
    addBot("У меня сбой: " + (e.message || e), null, null);
  }
  $("#chatSend").disabled = false;
  $("#chatInput").focus();
}
$("#chatSend").onclick = () => sendChat($("#chatInput").value);
$("#chatInput").addEventListener("keydown", e => { if(e.key === "Enter") sendChat($("#chatInput").value); });

// ---------- отправка на GitHub ----------
$("#submitBtn").onclick = async () => {
  const err = $("#submitErr");
  err.textContent = "";
  const full = assemble();
  if(full.length < 400){ err.textContent = "Код слишком короткий — вставь его у нейронки (кнопка «⚡ Вставить в редактор»)."; return; }
  if(!confirm("Проверили, что работает? Отправляем работу на GitHub?")) return;
  const btn = $("#submitBtn");
  btn.disabled = true; btn.textContent = "Отправляю…";
  try{
    if(!ghConfigured()) throw new Error("GITHUB_NOT_SET");
    const url = await ghSubmit(myGroup, full);
    lastHtml = full;
    lastSubmittedUrl = url;
    showDone(url);
  }catch(e){
    lastHtml = full;
    if(e.message === "GITHUB_NOT_SET"){
      err.textContent = "GitHub ещё не настроен (config.js → github). План Б: скачай работу файлом и передай преподавателю.";
      downloadWork();
    } else {
      err.textContent = "Не получилось отправить: " + e.message + " (попробуй ещё раз)";
    }
  }
  btn.disabled = false; btn.textContent = "📤 Проверили, работает — отправить работу";
};

function showDone(url){
  $("#scrWork").hidden = true;
  $("#scrDone").hidden = false;
  $("#doneUrl").textContent = url;
  $("#openWork").href = url;
  const box = $("#doneQr");
  box.innerHTML = "";
  try{
    if(window.QRCode){
      new QRCode(box, { text: url, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M });
    } else box.innerHTML = "<p style='color:#000'>QR-библиотека не загрузилась (нужен интернет)</p>";
  }catch(e){ box.innerHTML = "<p style='color:#000'>QR-ошибка</p>"; }
  confetti();
  window.scrollTo({ top: 0 });
}
$("#dlCopy").onclick = downloadWork;
function downloadWork(){
  if(!lastHtml) return;
  const blob = new Blob([lastHtml], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "work_team" + myGroup + ".html";
  document.body.appendChild(a); a.click(); a.remove();
  toast("Копия работы скачана");
}

// ---------- конфетти ----------
function confetti(){
  const c = document.createElement("canvas");
  c.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99";
  document.body.appendChild(c);
  c.width = innerWidth; c.height = innerHeight;
  const x = c.getContext("2d");
  const P = Array.from({ length: 160 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * .4,
    r: 4 + Math.random() * 5, c: "hsl(" + Math.random() * 360 + " 90% 60%)",
    vy: 2 + Math.random() * 3.5, vx: (Math.random() - .5) * 2.5
  }));
  let t = 0;
  (function loop(){
    x.clearRect(0, 0, c.width, c.height); t++;
    P.forEach(p => { p.y += p.vy; p.x += p.vx; x.fillStyle = p.c; x.fillRect(p.x, p.y, p.r, p.r); });
    if(t < 280) requestAnimationFrame(loop); else { x.clearRect(0, 0, c.width, c.height); c.remove(); }
  })();
}
