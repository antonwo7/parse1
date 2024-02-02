var phantomjs = require('phantomjs-prebuilt')
var webdriverio = require('webdriverio')
var wdOpts = {
    desiredCapabilities: { browserName: 'phantomjs' },
    capabilities: [{
        // maxInstances can get overwritten per capability. So if you have an in-house Selenium
        // grid with only 5 firefox instances available you can make sure that not more than
        // 5 instances get started at a time.
        // maxInstances: 5,
        //
        hostname: 'localhost',
        port: 4444,
        path: '/',
        browserName: 'chrome',
        'goog:chromeOptions': {
            // to run chrome headless the following flags are required
            // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
            args: ['--disable-gpu'],
        },
        // If outputDir is provided WebdriverIO can capture driver session logs
        // it is possible to configure which logTypes to include/exclude.
        excludeDriverLogs: ['*'], // pass '*' to exclude all driver session logs
    }],
}

phantomjs.run('--webdriver=4444').then(program => {
    webdriverio.remote(wdOpts).init()
        .url('https://developer.mozilla.org/en-US/')
        .getTitle().then(title => {
        console.log(title) // 'Mozilla Developer Network'
        program.kill() // quits PhantomJS
    })
})