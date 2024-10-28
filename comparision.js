import fs from 'fs';
import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
const css1 = `
    body {
        background-color: white;
    }
    .test-element {
        width: 100px;
        height: 100px;
        background-color: blue;
        color: white;
        text-align: center;
        line-height: 100px;
        font-family: Arial, sans-serif;
    }
`;
const css2 = `
    * {
        background-color: white;
    }
    .test-element {
        width: 100px;
        height: 100px;
        color: white;
        text-align: center;
        line-height: 100px;
        font-family: Arial, sans-serif;
        background-color: blue;
    }
`;

export async function takeScreenshot(element,css, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(`
        <html>
        <head>
            <style>${css}</style>
        </head>
        <body>
            ${element}
        </body>
        </html>
    `);
    await page.screenshot({ path: outputPath });
    await browser.close();
}

export function compareImages(img1Path, img2Path, diffPath) {
    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    return numDiffPixels;
}
export async function verdictChecker(params) {
    await takeScreenshot(params.element,params.css1, 'output1.png');
    await takeScreenshot(params.element,params.css2, 'output2.png');
    const diffPixels = compareImages('output1.png', 'output2.png', 'diff.png');
    fs.unlinkSync('output1.png');
    fs.unlinkSync('output2.png');
    fs.unlinkSync('diff.png');
    if(diffPixels===0){return true;}
    return false;
}

export async function questionImageCapture(params) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(`
        <html>
        <head>
            <style>${params.css}</style>
        </head>
        <body>
            ${params.element}
        </body>
        </html>
    `);
    var s= (await page.screenshot({type:PNG,encoding:"base64"}));
    await browser.close();
    return s.toString('base64');
}