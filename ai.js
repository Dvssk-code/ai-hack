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

function aiConfigured() {
  const a = CONFIG.ai || {};
  return !!(a.apiKey && !String(a.apiKey).includes("ВСТАВЬ"));
}

// messages: [{role, content}]
async function askAI(messages) {
  const a = CONFIG.ai;
  if (!aiConfigured()) throw new Error("API_KEY_NOT_SET");

  if (a.provider === "yandex") {
    const folder = a.yandex.folderId;
    if (!folder || String(folder).includes("b1g...")) throw new Error("YANDEX_FOLDER_NOT_SET");
    const r = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + a.apiKey
      },
      body: JSON.stringify({
        modelUri: "gpt://ai/cloud/" + folder + "/" + a.yandex.model,
        completionOptions: { stream: false, temperature: 0.7 },
        messages: messages
      })
    });
    if (!r.ok) throw new Error("Yandex API " + r.status);
    const j = await r.json();
    return (j.result && j.result.alternatives && j.result.alternatives[0] && j.result.alternatives[0].content) || { text: "(пустой ответ)" }.text;
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
