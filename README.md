# website-status 🌐

Website uptime monitor with response time tracking, speed ratings, multi-URL checking, and webhook notifications.

## 🚀 What's New in v2.0.0

- **Response time tracking** — Precise millisecond measurement for every check
- **Speed ratings** — Visual indicators: ⚡Fast / ✅Good / 🟡Moderate / 🔴Slow / 💀Unreachable
- **`checkMultipleUrls()`** — Batch check multiple URLs at once
- **Status codes** — Full HTTP status code and status text in results
- **Uptime statistics** — Summary with total checks, online count, uptime percentage
- **Structured JSON** — All functions return clean, parseable objects
- **Custom timeout** — Configurable timeout per request (default: 10s)
- **Fastest/Slowest** — Multi-URL results identify fastest and slowest sites
- **Better CLI** — New `--multi` and `--timeout` options

## 📦 Installation

```bash
npm install website-status
```

## 📋 Usage

### Single URL Check

```js
const { isSiteAvailable } = require("website-status");

const result = await isSiteAvailable("https://google.com");
console.log(result);
// {
//   url: "https://google.com",
//   results: [{ online: true, statusCode: 200, statusText: "OK", responseTime: 85, speed: "⚡ Fast" }],
//   summary: { total: 1, online: 1, offline: 0, uptime: "100.00%" }
// }
```

### Continuous Monitoring with Webhook

```js
const { isSiteAvailable } = require("website-status");

// Check every 30 seconds, 100 times, with Slack webhook
await isSiteAvailable(
  "https://mysite.com",
  "https://hooks.slack.com/services/xxx",
  30,  // interval in seconds
  100  // number of checks
);
```

### Check Multiple URLs

```js
const { checkMultipleUrls } = require("website-status");

const report = await checkMultipleUrls([
  "https://google.com",
  "https://github.com",
  "https://npmjs.com"
]);

report.results.forEach(site => {
  console.log(`${site.speed} ${site.url} - ${site.responseTime}ms`);
});

console.log(`Fastest: ${report.fastest.url}`);
console.log(`Slowest: ${report.slowest.url}`);
```

### Custom Timeout

```js
const { isSiteAvailable } = require("website-status");

// 5 second timeout
await isSiteAvailable("https://slow-site.com", null, null, null, { timeout: 5000 });
```

## 📟 CLI Usage

```bash
# Single URL
npx website-status https://google.com

# With webhook monitoring
npx website-status https://mysite.com https://hooks.slack.com/... 30 10

# Check multiple URLs
npx website-status --multi https://google.com https://github.com https://npmjs.com

# Custom timeout
npx website-status --timeout 5000 https://example.com
```

## 📡 API

| Function | Description |
|----------|-------------|
| `isSiteAvailable(url, webhook?, interval?, loops?, options?)` | Monitor a single URL |
| `checkMultipleUrls(urls[], options?)` | Batch check multiple URLs |

### Speed Ratings

| Rating | Response Time |
|--------|--------------|
| ⚡ Fast | < 200ms |
| ✅ Good | 200-500ms |
| 🟡 Moderate | 500-1000ms |
| 🔴 Slow | 1000-3000ms |
| 💀 Unreachable | > 3000ms or error |

## 📄 License

MIT © Utku Berkay Koç
