<script lang="ts">
	import { base } from '$app/paths';
</script>

<h1>Flottform prototype</h1>
<p>This is a generic form that allows uploading of a file</p>

<form action="{base}/upload" method="POST" enctype="multipart/form-data">
	<label for="message">A custom message</label>
	<input id="message" type="text" name="message" />
	<label for="document">Upload your document</label>
	<input id="document" type="file" name="document" required />
	<button type="submit">Send</button>
</form>
