import puppeteer, { Browser, type PuppeteerLaunchOptions } from 'puppeteer-core';
import chrome from '@sparticuz/chromium';
import { LRUCache } from 'lru-cache';

export const prerender = false;
const Dev = import.meta.env.DEV

const exePath = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

const cache = new LRUCache({ max: 20 });

const headers = {
	'Content-Type': 'image/jpeg',
	'cache-control': 'public s-max-age=600, stale-while-revalidate=600',
};

async function getOptions(): Promise<PuppeteerLaunchOptions> {
	if (Dev) {
		return {
			product: 'chrome',
			args: chrome.args,
			executablePath: exePath,
			headless: true,
			ignoreHTTPSErrors: true,
		};
	}
	return {
		product: 'chrome',
		args: chrome.args,
		executablePath: await chrome.executablePath(),
		headless: chrome.headless,
	};
}

let browser: Browser | null = null;

export async function generateOgImage(url: string) {
	const options: PuppeteerLaunchOptions = await getOptions();

	const urlWithoutOg = url.replace('/og', '');
	// Check if the image is already in the cache
	if (cache.has(urlWithoutOg)) {
		const cachedImage = cache.get(urlWithoutOg);
		return {
			base64Image: cachedImage,
			headers,
		};
	}

	console.time('launching browser');
	if (!browser) {

		console.log(`launching browser`);
		browser = await puppeteer.launch(options);

		console.timeEnd(`launching browser`);

		console.log(`creating new page`);
		const page = await browser.newPage();
		await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
		console.log('Before page.goto');
		await page.goto(url);
		await page.waitForSelector('.img');
		console.log(url)
		console.log('After page.goto');
		const buffer = await page.screenshot({ type: 'jpeg' });
		await browser.close()


		const base64Image = buffer.toString('base64');
		console.log(base64Image);

		// Store the image in the cache
		cache.set(urlWithoutOg, base64Image);
		//Set Browser to Null, to run in every call
		browser = null;

		return new Response(base64Image, {
			headers,
		});
	}
}
