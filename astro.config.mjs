import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
	output: 'hybrid',
	adapter: vercel({
		maxDuration: 50,
		includeFiles: ['./pages/og/ogGenerate.json'],
	}),
});
