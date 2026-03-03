#!/usr/bin/env node
const { isSiteAvailable, checkMultipleUrls } = require('./index');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
  website-status v2.0.0

  Usage:
    website-status <url> [webhook] [interval] [loops]
    website-status --multi <url1> <url2> ...
    website-status --help

  Options:
    --multi       Check multiple URLs at once
    --timeout <ms> Custom timeout in milliseconds (default: 10000)
    --help        Show this help message

  Examples:
    website-status https://google.com
    website-status https://google.com https://hooks.slack.com/... 30 5
    website-status --multi https://google.com https://github.com https://npmjs.com
    website-status --timeout 5000 https://example.com
  `);
}

if (args.length === 0 || args.includes('--help')) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

(async () => {
  try {
    // Parse --timeout flag
    let timeout = 10000;
    const timeoutIdx = args.indexOf('--timeout');
    if (timeoutIdx !== -1) {
      timeout = parseInt(args[timeoutIdx + 1], 10) || 10000;
      args.splice(timeoutIdx, 2);
    }

    // Multi-URL mode
    if (args.includes('--multi')) {
      const urls = args.filter(a => a !== '--multi' && !a.startsWith('--'));
      if (urls.length === 0) {
        console.error('Please provide at least one URL after --multi.');
        process.exit(1);
      }
      const results = await checkMultipleUrls(urls, { timeout });
      
      console.log('\n  URL Status Report');
      console.log('  ' + '-'.repeat(60));
      results.results.forEach(r => {
        const speed = r.speed || (r.error ? 'Unreachable' : 'Unknown');
        const time = r.responseTime ? `${r.responseTime}ms` : 'N/A';
        console.log(`  ${speed} ${r.url} - ${r.statusCode || 'ERR'} (${time})`);
      });
      console.log('  ' + '-'.repeat(60));
      if (results.fastest) console.log(`  Fastest: ${results.fastest.url} (${results.fastest.responseTime}ms)`);
      if (results.slowest) console.log(`  Slowest: ${results.slowest.url} (${results.slowest.responseTime}ms)`);
      console.log();
      return;
    }

    // Single URL mode
    const url = args[0];
    const webhookURL = args[1] || null;
    const intervalSeconds = args[2] ? parseInt(args[2], 10) : null;
    const loopCount = args[3] ? parseInt(args[3], 10) : null;

    await isSiteAvailable(url, webhookURL, intervalSeconds, loopCount, { timeout });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
