<script lang="ts">
	import { onMount } from 'svelte';

	export let progress: number = 0;
	$: console.log(progress);

	let circle: SVGCircleElement;
	let circumference: number;
	onMount(() => {
		const circleRadius = circle.r.baseVal.value;
		circumference = circleRadius * 2 * Math.PI;
		circle.style.strokeDasharray = `${circumference} ${circumference}`;
		circle.style.strokeDashoffset = `${circumference}`;
	});
	function updateProgress(progress: number) {
		if (circumference && circle) {
			const offset = circumference - (Math.round(progress * 100) / 100) * circumference;
			circle.style.strokeDashoffset = `${offset}`;
		}
	}
	$: updateProgress(progress);
</script>

<svg class="progress-ring" height="60" width="60">
	<circle
		bind:this={circle}
		class="progress-ring__circle"
		stroke-width="4"
		stroke="deeppink"
		fill="transparent"
		r="22"
		cx="30"
		cy="30"
	/>
</svg>

<style>
	.progress-ring__circle {
		stroke-dasharray: 5 10;
		transition: stroke-dashoffset 0.5s;
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
	}
</style>
