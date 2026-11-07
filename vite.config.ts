import adapter from "@sveltejs/adapter-static";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";
import {sveltekit} from "@sveltejs/kit/vite";
import {defineConfig} from "vite";
import * as process from "node:process";

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess({script: true}),
			adapter: adapter({}),
			//fallback: "404.html",
			paths: {
				// @ts-expect-error
				base: process.argv.includes("dev")
					? ""
					: process.env.BASE_PATH,
			},
			prerender: {handleMissingId: "ignore"},
		}),
	],
	build: {
		assetsInlineLimit: (filePath, content) => {
			return filePath.includes("src/assets/")
				? false
				: content.length >= 4096;
		},
	},
});
