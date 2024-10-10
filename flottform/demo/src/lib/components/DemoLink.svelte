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

<a
	{href}
	class="p-6 rounded bg-slate-200 flex flex-col gap-2 md:max-w-80 hover:shadow-lg hover:scale-105 transform duration-150 {linkClass}"
	{...rest}
	><h2 class="text-2xl text-center">{title}</h2>
	<p class="italic">
		{description}
	</p>
</a>
