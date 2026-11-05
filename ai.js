"use strict";
// ============================================================
//   Реальный API нейронки (используется ТОЛЬКО после того,
//   как сценарий отыгран — тратится по минимуму).
//   Поддержка: OpenAI-совместимые API и Yandex Cloud.
// ============================================================

const AI_SYSTEM_PROMPT = (task) =>
  "Ты — ассистент на курсе веб-разработки. Команда делает задание: «" + task.title + "».\n" +
  "Обязательные пункты задания:\n" + task.must.map(m => "- " + m).join("\n") + "\n\n" +
  "Правила: отвечай кратко и по делу. Когда даёшь код — только в виде одного полного HTML-файла в блоке ```html ... ``` (весь CSS и JS внутри), без внешних библиотек. Помогай довести приложение до ума, но не делай за команду то, что она должна понять сама.";

function yandexModelUri() {
  const a = CONFIG.ai || {};
  return (a.yandex && String(a.yandex.modelUri || "")) || "";
}

function aiConfigured() {
  const a = CONFIG.ai || {};
  if (!a.apiKey || String(a.apiKey).includes("ВСТАВЬ")) return false;
  if (a.provider === "yandex" && yandexModelUri().includes("XXXX")) return false;
  return true;
}

// messages: [{role, content}]
async function askAI(messages) {
  const a = CONFIG.ai;
  if (!aiConfigured()) throw new Error("API_KEY_NOT_SET");

  if (a.provider === "yandex") {
    const modelUri = yandexModelUri();
    if (!modelUri || modelUri.includes("XXXX")) throw new Error("YANDEX_MODEL_NOT_SET");
    // API-ключ сервисного аккаунта (начинается с AQVN) — заголовок Api-Key;
    // IAM-токен — Bearer.
    const isApiKey = String(a.apiKey).trim().startsWith("AQVN");
    const r = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": (isApiKey ? "Api-Key " : "Bearer ") + a.apiKey
      },
      body: JSON.stringify({
        modelUri: modelUri,
        completionOptions: { stream: false, temperature: 0.7, maxTokens: 4096 },
        messages: messages.map(m => ({ role: m.role, text: m.content }))
      })
    });
    if (!r.ok) {
      let detail = "";
      try { const ej = await r.json(); detail = (ej.message || "") + " "; } catch (e) {}
      throw new Error("Yandex API " + r.status + " " + detail);
    }
    const j = await r.json();
    const alt = j.result && j.result.alternatives && j.result.alternatives[0];
    const text = alt && ((alt.message && alt.message.text) || (alt.content && alt.content.text));
    if (!text) throw new Error("Yandex API: пустой ответ");
    return text;
  }

  // OpenAI-совместимый
  const r = await fetch(a.openai.baseURL.replace(/\/$/, "") + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + a.apiKey
    },
    body: JSON.stringify({ model: a.openai.model, temperature: 0.7, messages: messages })
  });
  if (!r.ok) throw new Error("AI API " + r.status);
  const j = await r.json();
  if (!j.choices || !j.choices[0]) throw new Error("AI: странный ответ");
  return j.choices[0].message.content;
}
