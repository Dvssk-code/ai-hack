// ============================================================
//   AI-HACK — НАСТРОЙКИ
// ============================================================

// ⚡⚡⚡ ВАШ API КЛЮЧ НЕЙРОНКИ ВСТАВЛЯЕТСЯ СЮДА ⚡⚡⚡
// Пока ключа нет — нейронка работает по сценарию (бот),
// а на реальные вопросы отвечает: «ключ не подключён».
const CONFIG = {
  eventName: "AI-Hack: собери веб-приложение за 15 минут",
  timeLimit: 15, // минут на задание

  ai: {
    // "openai" — любой OpenAI-совместимый API (OpenAI, OpenRouter, Groq, LM Studio…)
    // "yandex" — Yandex Cloud (GigaChat / foundationModels)
    provider: "openai",
    apiKey: "ВСТАВЬ-СЮДА-API-КЛЮЧ", // ←←← КЛЮЧ СЮДА
    openai: {
      baseURL: "https://api.openai.com/v1",
      model: "gpt-4o-mini"
    },
    yandex: {
      folderId: "b1g…lder",
      model: "gpt5-latest"
    }
  },

  // GitHub: сюда «падают» работы, отсюда жрёт QR-панель преподавателя.
  // Инструкция — в README.md (репозиторий + Pages + токен)
  github: {
    owner: "Dvssk-code",
    repo: "ai-hack",
    token: "github_pat_11CUD…EYwMN6g7x",
    pagesBase: "https://Dvssk-code.github.io/ai-hack/"
  }
};
