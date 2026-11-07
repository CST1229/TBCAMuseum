<script lang="ts">
	import {browser} from '$app/env';
	import {onMount, onDestroy} from "svelte";
	import buildpath from "#lib/buildpath.ts";
	
	interface Props {
		path?: string;
	}

	let { path = "" }: Props = $props();

	let interval: any = null;

	if (browser) {
		window.RufflePlayer = window.RufflePlayer || {};

		window.RufflePlayer.config = {
			...window.RufflePlayer.config,

			publicPath: "https://unpkg.com/@ruffle-rs/ruffle/",
			autoplay: "on",
			unmuteOverlay: "hidden",
			allowScriptAccess: true,
		};
		// @ts-expect-error
		window.JSeditorIsEmbedded = function() {
			return true;
		};
		interval = setInterval(() => {
			const embed: any = document.getElementById("flash-embed");
			if (embed.ASsetEditMode) {
				clearInterval(interval);
				embed.ASsetEditMode(true);
			}
		}, 100);
	}

	onMount(() => {
		document.body.classList.add("nomargin");
	})
	onDestroy(() => {
		document.body.classList.remove("nomargin");
		if (interval != null) {
			clearInterval(interval);
		}
	});
</script>

<object class="player-container" aria-label="Flash Player">
	<embed class="player" src="{buildpath + path}?" id="flash-embed" />
</object>

<style>
	.player {
		width: 100vw;
		height: 100vh;
		--logo-display: none;
	}

	:global(body.nomargin) {
		margin: 0;
		overflow: hidden;
	}
</style>
