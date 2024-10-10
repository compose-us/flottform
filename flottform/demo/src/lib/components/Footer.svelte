<script lang="ts">
	import { base } from '$app/paths';
	const howPossibilities = [
		'by converting coffee directly into code',
		'during a virtual hackathon',
		'during an intense pair programming marathon',
		'during sleepless nights',
		'in a caffeine-induced coding spree',
		'remotely',
		'under the influence of a rubber duck',
		'while juggling multiple browser tabs',
		'while pair programming',
		'with a large amount of coffee',
		'with one hand on the keyboard and the other on a pizza slice'
	];
	const adjectives = [
		'cool',
		'CSS-loving',
		'funny',
		'good-looking',
		'good',
		'open-source loving',
		'properly caffeeinated',
		'well-behaved'
	];
	const byPossibilities = [
		'code enthusiasts',
		'coffee lovers',
		'computer scientists',
		'cookie munchers',
		'developers',
		'folks',
		'nerds',
		'people',
		'programmers',
		'staff engineers'
	];

	const randomArrayElement = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

	let how = $state(randomArrayElement(howPossibilities));
	let whom = $state(`${randomArrayElement(adjectives)} ${randomArrayElement(byPossibilities)}`);
</script>

<footer class="w-full px-4 py-0 bg-gray-200 bg-opacity-50 mt-auto">
	<div
		class="text-center pt-4"
		onmouseleave={() => {
			how = randomArrayElement(howPossibilities);
			whom = `${randomArrayElement(adjectives)} ${randomArrayElement(byPossibilities)}`;
		}}
		role="presentation"
	>
		Made {how} by {whom} at
		<a class="underline" href="https://www.compose.us" rel="external">compose.us</a>
		{#if how.includes('coffee')}☕️{/if}
		{#if whom.includes('love')}❤️{/if}
		{#if whom.includes('cookie')}🍪{/if}
	</div>
	<div class="py-4">
		<ul class="max-w-screen-xl mx-auto flex justify-center gap-8">
			<li>
				<a href="{base}/">Home</a>
			</li>
			<li>
				<a href="{base}/feedback">Feedback</a>
			</li>
			<li>
				<a href="https://flottform.io/" target="_blank" rel="external noopener noreferrer"
					>Learn more</a
				>
			</li>
		</ul>
	</div>
</footer>
