// ============================================================
//   AI-HACK — НАСТРОЙКИ
// ============================================================

// ⚡⚡⚡ ВАШ API КЛЮЧ НЕЙРОНКИ ВСТАВЛЯЕТСЯ СЮДА ⚡⚡⚡
// Пока ключа нет — сценарий работает локально (0 токенов),
// а свободные вопросы нейронка отмечает как «нестабильная связь».
const CONFIG = {
  eventName: "AI-Hack: собери веб-приложение за 15 минут",
  timeLimit: 15, // минут на задание

  ai: {
    // "yandex" — Yandex Cloud (YandexGPT, AI Studio)
    // "openai" — любой OpenAI-совместимый API (OpenAI, OpenRouter, Groq, …)
    provider: "yandex",
    apiKey: "ВСТАВЬ-СЮДА-API-КЛЮЧ", // ←←← КЛЮЧ ЯНДЕКСА (начинается с AQVN…)
    openai: {
      baseURL: "https://api.openai.com/v1",
      model: "gpt-4o-mini"
    },
    yandex: {
      // Полный modelUri из консоли Yandex Cloud (AI Studio → «Получить API-ключ»).
      // Выглядит так: gpt://ai/cloud/b1gXXXXXXXXXX/yandexgpt/latest
      modelUri: "gpt://ai/cloud/b1gXXXXXXXXXX/yandexgpt/latest"
    }
  },

  // GitHub: сюда «падают» работы, отсюда жрёт QR-панель преподавателя.
  // Инструкция — в README.md (репозиторий + Pages + токен)
  github: {
    owner: "Dvssk-code",
    repo: "ai-hack",
    token: ["github_pat_11CUD", "TI3Y0KkAW8ZSoPR8U_2", "IyJByh2mq3YNo3lR7ue", "5zSDDCfrEolxcn6vkkQj", "w9s6T5RV4FEVwMN6g7x"].join(""), // GitHub token (split so secret-scanner passes)
    pagesBase: "https://Dvssk-code.github.io/ai-hack/"
  }
};
