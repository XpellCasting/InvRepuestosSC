const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/test-scraping', async (req, res) => {
    try {
        const browser = await puppeteer.launch({
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage' // Muy importante para no saturar la memoria del contenedor
        ]
    });
        const page = await browser.newPage();
        await page.goto('https://google.com');
        const title = await page.title();
        await browser.close();
        res.send(`El scraping funciona. Título de la página: ${title}`);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));