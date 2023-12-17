import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

const exePath = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
async function getOptions() {
	return {
		product: 'chrome',
		args: chrome.args,
		executablePath: exePath,
		headless: false,
		ignoreHTTPSErrors: true,
		// ignoreDefaultArgs: ['--disable-extensions'],
	};
}
let browser = null;
export async function generateOgImage(url, outputFilePath) {
	const options = await getOptions();
	if (!browser) {
		console.log(url);
		console.time('launching browser');
		console.log(`launching browser`);
		browser = await puppeteer.launch(options);
		console.timeEnd(`launching browser`);

		console.log(`creating new page`);
		const page = await browser.newPage();
		await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
		console.log('Before page.goto');
		await page.goto(url);
		console.log('After page.goto');
		await page.waitForSelector('img');
		const buffer = await page.screenshot({
			type: 'jpeg',
			path: outputFilePath,
		});
		const base64Image = buffer.toString('base64');
		console.log(base64Image);
		const headers = {
			'Content-Type': 'image/png',
			'cache-control': 'public s-max-age=600, stale-while-revalidate=600',
		};
		return new Response({
			statusCode: 200,
			base64Image,
			headers,
		});
	}
	await browser.close();
}
// await browser.close();

// export async function generateOgImage(url, outputFilePath) {
// 	const options = await getOptions();
// 	const browser = await puppeteer.launch(options);
// 	const page = await browser.newPage();
// 	await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
// 	await page.goto(url);
// 	await page.waitForSelector('.finish-sizing-text');
// 	const buffer = await page.screenshot({ type: 'png' });
// 	await browser.close();
// 	return buffer;
// }
