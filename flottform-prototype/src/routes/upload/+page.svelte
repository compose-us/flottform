<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div>Done uploading.</div>
<pre>{JSON.stringify(form, null, 2)}</pre>
