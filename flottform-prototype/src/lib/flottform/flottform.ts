export default function initFlottform() {
	console.log('initFlottForm()');
	const fileInputFields = document.querySelectorAll('input[type=file]');
	console.log('initFlottForm(): found fields', fileInputFields);

	for (const fileInputField of fileInputFields) {
		const createChannelElement = document.createElement('button');
		createChannelElement.setAttribute('type', 'button');
		createChannelElement.addEventListener('click', async () => {
			console.log('clicked create channel button for field', fileInputField.getAttribute('id'));
            // TODO init connection
		});
		createChannelElement.innerHTML = 'Create channel';
		console.log('initFlottForm(): created button', createChannelElement);
		fileInputField.after(createChannelElement);
		console.log('initFlottForm(): appended to fileInputField');
	}
}
