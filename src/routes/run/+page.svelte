<script lang="ts">
	import {settled} from "svelte";
	import {browser} from "$app/env";
	import RunnerFlash from "./RunnerFlash.svelte";
	import RunnerScratch3 from "./RunnerScratch3.svelte";
	import RunnerScratch3Picker from "./RunnerScratch3Picker.svelte";
	import RunnerSqueak from "./RunnerSqueak.svelte";

	let imports: Promise<any> = $state(Promise.resolve());
	let file: string = $state("");
	let title: string = $state("");

	const RunType = {
		NONE: "NONE",
		NONEXISTENT: "NONEXISTENT",
		SQUEAK: "SQUEAK",
		FLASH: "FLASH",
		SCRATCH3: "SCRATCH3",
		// Scratch 3.0 commit picker
		SCRATCH3PICKER: "SCRATCH3PICKER",
	}
	let runType: string = $state(RunType.NONE);

	if (browser) {
		reload();
	}

	async function reload() {
		runType = RunType.NONE;

		await settled();

		file = location.hash.substring(1);
		const isZip = file.endsWith(".zip") || file.endsWith(".xo");

		title = decodeURIComponent(file.split("/").at(-1) || "");

		if (file.startsWith("scratch1/") && (isZip || file.endsWith(".image")) || file.startsWith("/") && file.endsWith(".image")) {
			runType = RunType.SQUEAK;
			imports = Promise.all([
				isZip ? import("@turbowarp/jszip") : null,
				import("#lib/external/squeak_bundle.js"),
			]);
		} else if (file.startsWith("scratch2/") && file.endsWith(".swf")) {
			runType = RunType.FLASH;
			// @ts-ignore untyped
			imports = import("https://unpkg.com/@ruffle-rs/ruffle");
		} else if (file.startsWith("scratch3/")) {
			runType = RunType.SCRATCH3PICKER;
			title = "Scratch 3.0";
			imports = Promise.resolve();
		} else {
			runType = RunType.NONEXISTENT;
		}
	}
</script>

<svelte:window
	onhashchange={() => {
		if (location.hash) reload();
	}}
></svelte:window>

<svelte:head>
	{#if title}
		<title>TBCA Museum: {title}</title>
	{:else}
		<title>TBCA Museum</title>
	{/if}
</svelte:head>

{#if runType == RunType.NONE}
	<noscript>The Run page requires JavaScript.</noscript>
{:else if runType == RunType.NONEXISTENT}
	<p>File not found: {file}</p>
{:else}
	{#await imports}
		<p>Loading libraries...</p>
	{:then imported}
		{#if runType == RunType.SQUEAK}
			<RunnerSqueak jszip={imported[0]} path={file} />
		{:else if runType == RunType.FLASH}
			<RunnerFlash path={file} />
		{:else if runType == RunType.SCRATCH3PICKER}
			<RunnerScratch3Picker
				file={file}
				onProceed={() => runType = RunType.SCRATCH3}
			/>
		{:else if runType == RunType.SCRATCH3}
			<RunnerScratch3 file={file} />
		{/if}
	{:catch error}
		<p>Something went wrong: {error.message}</p>
	{/await}
{/if}
