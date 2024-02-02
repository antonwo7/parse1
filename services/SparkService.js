const puppeteer = require('puppeteer')

class LinkedinService
{
    url = 'https://spark-interfax.ru/'

    parse = async (query) => {
        query = query.replace('www.', '')
        const browser = await puppeteer.launch({
            defaultViewport: {
                width: 1920,
                height: 1780
            },
            executablePath: process.env.NODE_ENV === 'production'
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
                '--proxy-server=http://a7fc0f21c2899ddee9dac40a1d3c5fc904186b1b:device=desktop@proxy.zenrows.com:8001'
            ]
        })
        const page = await browser.newPage()
        await page.goto(this.url)

        await page.waitForSelector('.login-form__input[name="username"]')
        await page.waitForSelector('.login-form__input[name="password"]')
        await page.type('.login-form__input[name="username"]', 'EP2401T_1')
        await page.type('.login-form__input[name="password"]', 'U4fWuTV')
        await page.click('form.js-login-form button[type="submit"]')

        await page.waitForSelector('input.search-global-typeahead__input')
        await page.goto(`https://www.linkedin.com/search/results/companies/?keywords=${query}`)
        await page.waitForSelector('main.scaffold-layout__main')
        await page.waitForSelector('.search-results-container')

        const data = await page.evaluate(resultsSelector => {
            const blocks = Array.from(document.querySelectorAll('ul.reusable-search__entity-result-list li'));
            if (!blocks.length) return null;

            const block = blocks[0]

            return {
                logo_url: block.querySelector('.ivm-image-view-model img').getAttribute('src'),
                url: block.querySelector('.app-aware-link').getAttribute('href'),
            }
        }, 'ul.reusable-search__entity-result-list li');

        return data || {
            logo_url: '',
            url: ''
        }
    }
}

module.exports = new LinkedinService()