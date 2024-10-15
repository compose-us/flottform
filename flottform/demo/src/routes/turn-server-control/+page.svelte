<script lang="ts">
    import { base } from '$app/paths';
	import Logo from '$lib/components/Logo.svelte';

    let authKey = '';
    let useTurnServer = false;
    let message = '';
  
    const handleSubmit = async (e:Event) => {
      e.preventDefault()

      if (!authKey) {
        message = 'Please provide an authentication key.';
        return;
      }
  
      try {
        const response = await fetch('https://192.168.0.167:5177/flottform/turn-control', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authKey
          },
          body: JSON.stringify({ useTurnServer }) 
        });
        const result = await response.json();
  
        if (response.ok) {
          message = result.message || 'TURN server setting updated successfully!';
        } else {
          message = result.message || 'Failed to update TURN server setting.';
        }
      } catch (error) {
        message = 'An error occurred while updating TURN server settings.';
        console.error('Error:', error);
      }
    };
  </script>
  
<div
	class="bg-secondary-blue text-white pt-4 pb-4 sm:pt-4 sm:pb-4 grid place-items-center text-lg font-normal"
>
	<div
		class="flex flex-col sm:flex-row items-center gap-4 place-content-between w-full max-w-screen-lg mx-auto px-6"
	>
		<a href="{base}/"> <Logo /></a>
		<nav>
			<ul class="flex flex-col items-center sm:items-start sm:flex-row flex-wrap gap-2 sm:gap-4">
				<li>
					<a
						href="https://flottform.io/use-cases"
						target="_blank"
						rel="external noopener noreferrer">Flottform Use Cases</a
					>
				</li>
				<li>
					<a href="https://flottform.io/contact" target="_blank" rel="external noopener noreferrer"
						>Contact Us</a
					>
				</li>
				<li>
					<a href="{base}/"
						>Home</a
					>
				</li>
			</ul>
		</nav>
	</div>
</div>
<form on:submit={handleSubmit} class="mx-auto my-auto p-12 bg-[#f9f9f9] rounded-lg shadow-md">
    <div>
        <h2>TURN Server Control</h2>
    
        <!-- Input field for the authentication key -->
        <label for="auth-key" class="block mb-2">Authentication Key:</label>
        <input
        id="auth-key"
        class="w-full p-2 mb-4 border border-[#ccc] rounded"
        type="text"
        bind:value={authKey}
        placeholder="Enter authentication key"
        />
    
        <!-- Checkbox for enabling/disabling TURN servers -->
        <label for="turn-checkbox" class="block mb-2">
        <input
            id="turn-checkbox"
            class="mr-2"
            type="checkbox"
            bind:checked={useTurnServer}
        />
        Use TURN servers (costly)
        </label>
    
        <button type="submit" class="p-3 bg-[#160095] text-white border-none cursor-pointer text-xs rounded w-full hover:bg-[#00458f]">Save Settings</button>
    
        <!-- Feedback message -->
        {#if message}
        <p class="my-4 text-center">{message}</p>
        {/if}
    </div>
</form>