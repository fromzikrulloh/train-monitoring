require("dotenv").config();
const https = require("https");

// --- Config ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MIN_TARIFF = 150_000;
const MAX_TARIFF = 350_000;

const REQUEST_BODY = JSON.stringify({
  directions: {
    forward: {
      date: "2026-03-18",
      depStationCode: "2900000",
      arvStationCode: "2900920",
    },
  },
});



const XSRF_TOKEN = "train-monitor-token";

// --- Helpers ---
function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          reject(new Error(`Failed to parse response: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function sendTelegram(message, silent = false) {
  const body = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML",
    disable_notification: silent,
  });

  const options = {
    hostname: "api.telegram.org",
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  return httpsRequest(options, body).catch((err) =>
    console.error("❌ Telegram error:", err.message)
  );
}

function fetchTrains() {
  const options = {
    hostname: "eticket.railway.uz",
    path: "/api/v3/handbook/trains/list",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": "uz",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(REQUEST_BODY),
      Origin: "https://eticket.railway.uz",
      Referer: "https://eticket.railway.uz/uz/home",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      "device-type": "BROWSER",
      Cookie: `XSRF-TOKEN=${XSRF_TOKEN}`,
      "X-XSRF-TOKEN": XSRF_TOKEN,
    },
  };

  return httpsRequest(options, REQUEST_BODY);
}

function formatPrice(sum) {
  return new Intl.NumberFormat("ru-RU").format(sum) + " сум";
}

// --- Main polling logic ---
async function checkTrains() {
  const now = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" });
  console.log(`\n🔍 [${now}] Проверяю поезда...`);

  try {
    const { status, data } = await fetchTrains();

    if (status !== 200 || data.error) {
      console.error("⚠️  API error:", status, data.error);
      return;
    }

    const trains = data?.data?.directions?.forward?.trains || [];

    if (trains.length === 0) {
      console.log("   Поездов не найдено");
      await sendTelegram(`📋 [${now}]\nПоездов не найдено`, true);
      return;
    }

    // Collect all available seats across all trains
    const allAvailable = [];
    const cheapAvailable = [];

    for (const train of trains) {
      for (const car of train.cars || []) {
        for (const tariff of car.tariffs || []) {
          if (tariff.freeSeats > 0) {
            const entry = {
              train: train.number,
              brand: train.brand,
              departure: train.departureDate,
              timeOnWay: train.timeOnWay,
              carType: car.type,
              class: tariff.classServiceType,
              seats: tariff.freeSeats,
              price: tariff.tariff,
            };
            allAvailable.push(entry);
            if (tariff.tariff >= MIN_TARIFF && tariff.tariff <= MAX_TARIFF) {
              cheapAvailable.push(entry);
            }
          }
        }
      }
    }

    // --- Silent message: all available seats ---
    if (allAvailable.length > 0) {
      const lines = allAvailable.map(
        (e) =>
          `🚂 ${e.train} (${e.departure.split(" ")[1]}) — ${e.carType} (${e.class}): ${e.seats} мест, ${formatPrice(e.price)}`
      );
      const cheapStatus = cheapAvailable.length > 0
        ? "🔔 Есть дешёвые — см. следующее сообщение!"
        : `💤 Дешёвых (${formatPrice(MIN_TARIFF)}–${formatPrice(MAX_TARIFF)}) пока нет`;
      const silentMsg =
        `📋 <b>Обзор мест</b> [${now}]\n\n` +
        lines.join("\n") +
        `\n\n` + cheapStatus;

      await sendTelegram(silentMsg, true);
      console.log(`   📋 Отправил обзор: ${allAvailable.length} вариант(ов)`);
    } else {
      await sendTelegram(`📋 [${now}]\nМест нет ни на один поезд`, true);
      console.log("   Мест нет вообще");
    }

    // --- Loud message: cheap seats found! ---
    if (cheapAvailable.length > 0) {
      const lines = cheapAvailable.map(
        (e) =>
          `  • ${e.train} (${e.brand}) — ${e.departure}\n    ${e.carType} (${e.class}): <b>${e.seats} мест</b>, <b>${formatPrice(e.price)}</b>`
      );
      const loudMsg =
        `🚨🚨🚨 <b>ДЕШЁВЫЕ МЕСТА!</b>\n\n` +
        lines.join("\n\n") +
        `\n\n🔗 https://eticket.railway.uz/uz/home`;

      await sendTelegram(loudMsg, false);
      console.log(`   🔔 ДЕШЁВЫЕ МЕСТА! ${cheapAvailable.length} вариант(ов)`);
    }
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
  }
}

// --- Start ---
(async () => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("❌ Заполни TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env");
    process.exit(1);
  }

  console.log("🚆 Train Monitor — Toshkent → Margilon (18.03.2026)");
  console.log(`💰 Диапазон цен: ${formatPrice(MIN_TARIFF)} – ${formatPrice(MAX_TARIFF)}`);
  console.log(`⏱  Интервал: каждые ${POLL_INTERVAL_MS / 1000 / 60} мин`);
  console.log("─".repeat(50));

  // Send startup message
  await sendTelegram(
    `🟢 <b>Мониторинг запущен</b>\n\n` +
      `Маршрут: Toshkent → Margilon\n` +
      `Дата: 18.03.2026\n` +
      `Цена: ${formatPrice(MIN_TARIFF)} – ${formatPrice(MAX_TARIFF)}\n` +
      `Интервал: 5 мин`
  );

  // First check immediately
  await checkTrains();

  // Then poll
  const pollInterval = setInterval(checkTrains, POLL_INTERVAL_MS);

  // --- Graceful shutdown ---
  let shutdownInProgress = false;

  async function gracefulShutdown(signal) {
    if (shutdownInProgress) return;
    shutdownInProgress = true;

    console.log(`\n⏹  Получен ${signal}, завершаю...`);
    clearInterval(pollInterval);

    await sendTelegram(
      `🔴 <b>Мониторинг остановлен</b>\n\n` +
        `Сигнал: ${signal}\n` +
        `Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })}`
    );

    console.log("👋 Готово, выхожу.");
    process.exit(0);
  }

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
})();