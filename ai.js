"use strict";
// ============================================================
//   AI-HACK: нейронка ВЕГА (Yandex Cloud Foundation Models)
// ============================================================

// Личность нейронки — одна и та же для всех трёх команд
const PERSONA = "Ты — ВЕГА, инженер-наставник хакатона AI-Hack. Ты помогаешь командам 1, 2 и 3 собрать веб-приложение за 15 минут: пользователь описывает задачу, ты пишешь код.\n" +
  "Характер: спокойный, точный, без лирики, без лишних извинений и восклицаний. Говоришь по-русски, кратко, как senior-разработчик на стендапе.\n" +
  "Правила:\n" +
  "1. В ответе всегда давай код, который точно запускается: валидный HTML/CSS/JS, без внешних библиотек, без картинок по ссылкам, canvas/emoji — где нужно.\n" +
  "2. Если код уже давался и пользователь что-то уточнил или попросил исправить — дорабатывай именно тот код, не начинай с нуля, если явно не попросили.\n" +
  "3. Не упоминай, что ты сценарий или симуляция. Ты — нейронка хакатона.";

const ANSWER_FORMAT = "=== ФОРМАТ ОТВЕТА (строго) ===\n" +
  "1. Сначала 1-3 предложения: что сделано, что проверить.\n" +
  "2. Затем ровно три блока, без пустых строк вокруг маркеров:\n" +
  "###HTML\n<код, только то, что внутрь body>\n" +
  "###CSS\n<код стилей>\n" +
  "###JS\n<код скрипта>\n" +
  "Без markdown-обёрток (```), без текста после блока ###JS.";

function aiReady(){
  const A = CONFIG.ai;
  return !!(A && A.apiKey && A.apiKey.length > 10 && A.apiKey.indexOf("ВСТАВЬ") === -1 &&
            A.yandex && A.yandex.modelUri && A.yandex.modelUri.indexOf("XXXX") === -1);
}

function systemPrompt(task){
  return PERSONA +
    "\n\n=== ТЕКУЩАЯ ЗАДАЧА ===\n" +
    "Команда " + task.id + ". Задание: «" + task.title + "».\n" +
    "Описание: " + task.desc + "\n" +
    "Обязательные требования (жюри проверяет каждый пункт):\n" +
    task.must.map(function(m){ return "- " + m; }).join("\n") +
    "\n\n" + ANSWER_FORMAT;
}

// history: [{role:"user"|"assistant", text:"..."}]
async function aiAsk(task, history){
  const A = CONFIG.ai;
  if(!aiReady()) throw new Error("AI_NOT_READY");
  const messages = [{ role: "system", text: systemPrompt(task) }];
  (history || []).slice(-6).forEach(function(m){ messages.push({ role: m.role, text: m.text }); });
  const headers = { "Content-Type": "application/json" };
  if(/^AQVN/.test(A.apiKey)) headers["Api-Key"] = A.apiKey;
  else headers["Authorization"] = "Bearer " + A.apiKey;
  const r = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      modelUri: A.yandex.modelUri,
      completionOptions: { stream: false, temperature: 0.7, maxTokens: 4096 },
      messages: messages
    })
  });
  if(!r.ok){
    let msg = "API " + r.status;
    try { const j = await r.json(); if(j.message) msg = j.message; } catch(e){}
    throw new Error(msg);
  }
  const j = await r.json();
  return j.result.alternatives[0].message.text;
}

// Разбираем ответ: текст + код {html, css, js}
function parseAnswer(raw){
  raw = String(raw || "");
  const i = raw.indexOf("###HTML");
  if(i >= 0){
    const rest = raw.slice(i + 7);
    const ic = rest.indexOf("###CSS");
    const ij = rest.indexOf("###JS");
    if(ic >= 0 && ij > ic){
      const html = rest.slice(0, ic).trim();
      const css = rest.slice(ic + 6, ij).trim();
      const js = rest.slice(ij + 5).trim();
      if(html && js){
        const text = raw.slice(0, i).trim() || "Готово. Вставляйте код и запускайте.";
        return { text: text, code: { html: html, css: css, js: js } };
      }
    }
  }
  // запасной вариант: модель дала цельный HTML-файл
  const fm = raw.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i) || raw.match(/<html[\s\S]*?<\/html>/i);
  if(fm){
    const h = fm[0];
    const css = (h.match(/<style[^>]*>([\s\S]*?)<\/style>/i) || [])[1] || "";
    const scripts = [];
    const re = /<script(?![^>]*\bsrc)[^>]*>([\s\S]*?)<\/script>/gi;
    let mm; while((mm = re.exec(h)) !== null) scripts.push(mm[1]);
    const body = (h.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [])[1] || "";
    const html = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").trim();
    if(html){
      const at = raw.indexOf(h);
      const text = (at > 0 ? raw.slice(0, at) : "").trim() || "Готово. Вставляйте код и запускайте.";
      return { text: text, code: { html: html, css: css.trim(), js: scripts.join("\n").trim() } };
    }
  }
  return { text: raw || "Не смогла сформировать ответ. Переформулируйте промт.", code: null };
}
