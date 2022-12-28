const puppeteer = require('puppeteer');
const dataLayer = require('../src/index.js');

const config = require('./config.js');

config.serveTestPage();

(async () => {
    // Start the browser and open the test website at
    // examples/test-website/index.html in this repo
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');

    const dl = new dataLayer(page, config.containerId);

    // Examples

    // Wait until the page and Google Tag Manager have fully loaded
    await dl.waitForEvent("gtm.load");

    // Access the full list of events that have been pushed to the dataLayer
    const history = await dl.history;
    console.log("dataLayer events");
    console.log(history);

    // Log the entire data model (i. e. the current state of all dataLayer variables)
    console.log("Data model:");
    console.log(await dl.getDataModel());

    // Get the value of a single dataLayer variable
    console.log("Value of dataLayer variable 'page_type':");
    console.log(await dl.get("page_type"));

    await browser.close();
    config.stopTestPage();
})();