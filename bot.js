"use strict";
// ============================================================
//   «Нейронка» — сценарий-издевательница (0 API токенов)
//   Попытка 1 → кривой код
//   Попытка 2 → почти готовый
//   Попытка 3 → «я другая нейронка, вот промпт»
//   Попытка 4 → рабочее приложение
//   Дальше — реальный API (если ключ подключён)
// ============================================================

const botState = {}; // group -> {step, hist, done}

function st(group) {
  return botState[group] || (botState[group] = { step: 0, hist: [] });
}

function resetBot(group) {
  botState[group] = { step: 0, hist: [] };
}

// «Умный промпт с первого раза» → быстрые аплодисменты (для смеха)
function isStrongPrompt(s) {
  s = String(s).toLowerCase();
  if (s.length < 80) return false;
  const kw = ["сделай", "создай", "игра", "html", "css", "javascript", "canvas", "кнопк", "счёт", "счет", "таймер", "массив", "функция", "задач", "файл", "обработчик", "сохраня"];
  const hit = kw.filter(w => s.includes(w)).length;
  return hit >= 4;
}

const FAST_TEXT = "Ой. Стоп. Ты... сразу написал идеальный промпт? 😳 Респект, вы реально умеете. Тогда без вступлений — держите готовое приложение, аплодисменты: 👏";
const OFF_TEXT = "Ой, у меня сейчас нестабильная связь с сервером — не получается дописать ответ 😔 Попробуй написать ещё раз. А пока: вставь последний полученный код, жми «▶ Запустить», проверяй пункты задания и «📤 Отправляй» работу! 🚀";

// Вернуть скриптованный ответ (или null, если пора звать реальный API)
function scriptedReply(group, userMsg) {
  const t = TASKS[group - 1];
  const s = st(group);
  if (!t) return null;

  if (s.step === 0 && isStrongPrompt(userMsg)) {
    s.step = 4;
    return { kind: "fast", text: FAST_TEXT, code: t.final };
  }
  switch (s.step) {
    case 0: s.step = 1; return { kind: "v1", text: t.tease1, code: t.v1, teacherNote: t.note1 };
    case 1: s.step = 2; return { kind: "v2", text: t.tease2, code: t.v2, teacherNote: t.note2 };
    case 2: s.step = 3; return { kind: "reveal", text: t.revealText, prompt: t.revealPrompt, teacherNote: t.note3 };
    case 3: s.step = 4; return { kind: "final", text: t.finalText, code: t.final, teacherNote: t.note4 };
    default: return null;
  }
}

// Главный вызов: сначала сценарий, потом (если нужен) реальный API.
// forceScript — режим преподавателя: API никогда не вызывается.
async function botSend(group, userMsg, forceScript) {
  const scripted = scriptedReply(group, userMsg);
  if (scripted) return scripted;

  if (forceScript) {
    return { kind: "demo-end", text: "Демо-сценарий завершён! 🎓 (У учеников здесь начался бы режим свободного общения с нейронкой через API.)" };
  }

  const t = TASKS[group - 1];
  const s = st(group);
  s.hist.push({ role: "user", content: userMsg });
  try {
    const sys = { role: "system", content: AI_SYSTEM_PROMPT(t) };
    const answer = await askAI([sys].concat(s.hist.slice(-6)));
    s.hist.push({ role: "assistant", content: answer });
    return { kind: "api", text: answer };
  } catch (e) {
    const extra = e.message === "API_KEY_NOT_SET" ? "" : " (" + e.message + ")";
    return { kind: "off", text: OFF_TEXT + extra };
  }
}

function greeting(task) {
  return "👋 Привет! Я нейронка этого курса. Твоё задание — «" + task.title + "». " +
    "Опиши, что нужно (например: «Сделай игру со счётом и кнопкой рестарта»), и я начну писать код в твой редактор. Погнали! 🚀";
}
