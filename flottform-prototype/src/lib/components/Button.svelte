<script lang="ts">
	export let label: string;
	export let type: 'button' | 'submit' = 'button';
</script>

<button {type}>{label}</button>

<style>
	button {
		background: linear-gradient(40deg, var(--cus-color-blue), var(--cus-color-green));
		padding: 0.75rem 1rem;
		color: #fff;
		font-weight: 700;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		display: inline-block;
	}
</style>
