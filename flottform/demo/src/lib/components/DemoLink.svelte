<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		href,
		title,
		description,
		linkClass,
		...rest
	}: {
		href: string;
		title: string;
		description: string;
		linkClass?: string;
	} & HTMLAttributes<HTMLLinkElement | HTMLAnchorElement> = $props();
</script>

<a {href} class="contents {linkClass}" {...rest}>
	<div class="perspective">
		<h2 class="text-2xl">{title}</h2>
		<p class="italic text-lg">
			{description}
		</p>
	</div>
</a>

<style lang="postcss">
	.perspective {
		@apply relative text-black p-8 grid gap-8 rounded-lg bg-white m-[2px];
	}
	.perspective::before {
		@apply absolute rounded-lg shadow-lg hover:shadow-2xl bg-gradient-to-br from-secondary-blue to-secondary-green -inset-[2px] -z-10;
		content: '';
	}
</style>
