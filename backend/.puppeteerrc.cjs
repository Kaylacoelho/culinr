/**
 * Puppeteer cache configuration.
 * This file is read by both `npx puppeteer browsers install chrome` (install)
 * and `puppeteer.launch()` (runtime), ensuring they always use the same path.
 *
 * On Render: set PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer in env vars.
 * Locally:   falls back to ~/.cache/puppeteer (puppeteer's default).
 */
const { join } = require('path')
const { homedir } = require('os')

module.exports = {
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR ?? join(homedir(), '.cache', 'puppeteer'),
}
