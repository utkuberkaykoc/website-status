const fetch = require('node-fetch');

/**
 * Checks if a website is available with detailed status.
 * @param {string} url - The website URL to check.
 * @param {Object} [options] - Check options.
 * @param {string} [options.webhookURL] - Discord Webhook URL for notifications.
 * @param {number} [options.interval] - Interval in seconds (min 30) for repeated checks.
 * @param {number} [options.loopCount] - Number of times to check (max 50).
 * @param {number} [options.timeout=10000] - Request timeout in ms.
 * @param {string} [options.method='GET'] - HTTP method.
 * @param {boolean} [options.json=false] - Return structured JSON result.
 * @returns {Promise<Object|void>}
 */
async function isSiteAvailable(url, options = {}) {
  // Backwards compatibility: support old positional args
  if (typeof options === 'string' || options === null) {
    const webhookURL = options;
    const intervalSeconds = arguments[2] || null;
    const loopCount = arguments[3] || null;
    options = { webhookURL, interval: intervalSeconds, loopCount };
  }

  const { webhookURL, interval, loopCount, json } = options;

  if (!interval && !loopCount) {
    return await checkOnce(url, options);
  }

  const actualInterval = interval ? Math.max(interval, 30) : 30;
  const actualLoopCount = loopCount ? Math.min(loopCount, 50) : 3;

  console.log(`🔄 Checking ${url} every ${actualInterval}s, repeating ${actualLoopCount} times.`);

  const results = [];
  let count = 0;

  return new Promise((resolve) => {
    const runCheck = async () => {
      const result = await checkOnce(url, options);
      results.push(result);
      count++;

      if (count >= actualLoopCount) {
        clearInterval(timer);
        const summary = {
          url,
          checks: results,
          totalChecks: results.length,
          upCount: results.filter(r => r.isUp).length,
          downCount: results.filter(r => !r.isUp).length,
          avgResponseTime: Math.round(results.filter(r => r.responseTime).reduce((a, b) => a + b.responseTime, 0) / results.filter(r => r.responseTime).length) || 0,
          uptime: `${Math.round((results.filter(r => r.isUp).length / results.length) * 100)}%`,
        };
        console.log(`\n📊 Summary: ${summary.upCount}/${summary.totalChecks} UP (${summary.uptime} uptime, avg ${summary.avgResponseTime}ms)`);
        resolve(summary);
      }
    };

    runCheck();
    const timer = setInterval(runCheck, actualInterval * 1000);
  });
}

/**
 * Runs a single check on a website with detailed response.
 * @param {string} url - Website URL.
 * @param {Object} [options] - Options.
 * @returns {Promise<Object>} - Detailed status result.
 */
async function checkOnce(url, options = {}) {
  const { webhookURL, timeout = 10000, method = 'GET' } = options;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: { 'User-Agent': 'website-status/2.0' },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const isUp = response.ok;
    const statusCode = response.status;
    const statusText = response.statusText;

    const result = {
      url,
      isUp,
      statusCode,
      statusText,
      responseTime,
      responseTimeText: `${responseTime}ms`,
      checkedAt: new Date().toISOString(),
    };

    // Speed rating
    if (responseTime < 200) result.speed = "⚡ Fast";
    else if (responseTime < 500) result.speed = "✅ Good";
    else if (responseTime < 1000) result.speed = "🟡 Moderate";
    else result.speed = "🔴 Slow";

    console.log(isUp
      ? `✅ ${url} is UP! (${statusCode} ${statusText}, ${responseTime}ms ${result.speed})`
      : `❌ ${url} responded with ${statusCode} ${statusText} (${responseTime}ms)`
    );

    if (webhookURL) {
      await sendDiscordNotification(webhookURL,
        isUp ? `✅ Website is UP: ${url} (${responseTime}ms)` : `❌ Website returned ${statusCode}: ${url}`
      );
    }

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const isTimeout = error.name === 'AbortError';

    const result = {
      url,
      isUp: false,
      statusCode: null,
      statusText: isTimeout ? 'Timeout' : 'Connection Failed',
      responseTime,
      responseTimeText: `${responseTime}ms`,
      error: isTimeout ? `Timeout after ${timeout}ms` : error.message,
      checkedAt: new Date().toISOString(),
      speed: "💀 Unreachable",
    };

    console.log(`❌ ${url} is DOWN! (${result.statusText}${isTimeout ? ` - ${timeout}ms timeout` : ''})`);

    if (webhookURL) {
      await sendDiscordNotification(webhookURL, `@everyone ❌ Website is DOWN: ${url} (${result.statusText})`);
    }

    return result;
  }
}

/**
 * Checks multiple websites at once.
 * @param {string[]} urls - Array of URLs to check.
 * @param {Object} [options] - Options.
 * @returns {Promise<Object>} - Results with summary.
 */
async function checkMultipleUrls(urls, options = {}) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error("Please provide an array of URLs.");
  }

  const results = await Promise.all(
    urls.map((url) => checkOnce(url, options))
  );

  const summary = {
    results,
    total: results.length,
    up: results.filter(r => r.isUp).length,
    down: results.filter(r => !r.isUp).length,
    avgResponseTime: Math.round(results.filter(r => r.responseTime && r.isUp).reduce((a, b) => a + b.responseTime, 0) / (results.filter(r => r.isUp).length || 1)),
    fastest: results.filter(r => r.isUp).sort((a, b) => a.responseTime - b.responseTime)[0]?.url || null,
    slowest: results.filter(r => r.isUp).sort((a, b) => b.responseTime - a.responseTime)[0]?.url || null,
  };

  console.log(`\n📊 Batch Results: ${summary.up}/${summary.total} UP, avg ${summary.avgResponseTime}ms`);
  if (summary.fastest) console.log(`   ⚡ Fastest: ${summary.fastest}`);
  if (summary.slowest) console.log(`   🐌 Slowest: ${summary.slowest}`);

  return summary;
}

/**
 * Sends a notification to Discord.
 * @param {string} webhookURL - The Discord Webhook URL.
 * @param {string} message - The message to send.
 * @returns {Promise<void>}
 */
async function sendDiscordNotification(webhookURL, message) {
  try {
    const response = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });

    if (response.status === 204) {
      console.log('✅ Discord notification sent successfully!');
    } else {
      console.error('❌ Failed to send Discord notification:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error.message);
  }
}

module.exports = {
  isSiteAvailable,
  checkOnce,
  checkMultipleUrls,
};
