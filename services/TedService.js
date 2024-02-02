const puppeteer = require('puppeteer')

class TedService
{
    url = 'https://ted.europa.eu/TED/browse/browseByMap.do'

    parse = async (query) => {
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

        await page.waitForSelector('#quick-search .ui-autocomplete-input')
        await page.type('#quickSearchCriteria', query)
        await page.click('#quick-search .quicksearch .quick-search-border button')
        await page.waitForSelector('#notice')

        const links = await page.evaluate(resultsSelector => {
            const blocks = Array.from(document.querySelectorAll('table#notice tbody tr'));
            return blocks.map(block => {
                const link = block.querySelector('a')
                const summary = block.querySelectorAll('td')[2]

                return {
                    url: 'https://ted.europa.eu' + link.getAttribute('href'),
                    title: summary.querySelector('span.bold').innerHTML,
                    number: link.innerHTML
                };
            });
        }, 'table#notice tbody tr');


        return links
    }
}

module.exports = new TedService()