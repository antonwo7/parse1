const puppeteer = require('puppeteer')

class DataGovService
{
    url = 'https://datos.gob.es/es'

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

        await page.waitForSelector('ul.menu li.leaf:nth-child(9)')
        await page.click('ul.menu li.leaf:nth-child(9)')
        await page.waitForSelector('.block-dge-search.block-search.is-visible')
        await page.type('#edit-search-block-form', query)
        await page.click('#edit-submit--3')

        await page.waitForSelector('.dge-list.dge-list--dataset')

        const data = await page.evaluate(resultsSelector => {
            const blocks = Array.from(document.querySelectorAll('.dge-list.dge-list--dataset ul li.dataset-item'));
            return blocks.map(block => {
                const link = block.querySelector('.dataset-content .dge-list__title a')
                return {
                    url: 'https://datos.gob.es' + link.getAttribute('href'),
                    title: link.innerHTML,
                    resource: block.querySelector('.publisher-title a').innerHTML,
                    description: block.querySelector('.dge-list__desc').innerHTML
                };
            });
        }, '.dge-list.dge-list--dataset ul li');


        return data
    }
}

module.exports = new DataGovService()