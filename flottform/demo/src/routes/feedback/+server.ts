import { CREATE_ISSUE_TOKEN, CREATE_ISSUE_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

const REPO_URL = `${CREATE_ISSUE_URL}/issues`;
const accessToken = CREATE_ISSUE_TOKEN || '';

export const POST = async ({ request }) => {
	const { userName, contact, feedbackPositive, feedbackImprovements, contactChoice } =
		await request.json();
	const issueBody = `**Name**: ${userName}
**${contactChoice === 'email' ? '📧 Email' : contactChoice === 'linkedin' ? '📟 LinkedIn' : '🐦 X / Twitter'}**: ${contact || '-'}
	
**🚀 That's how cool Flottform is:** 
${feedbackPositive}

**⚙️ That's how we can improve it:**
${feedbackImprovements}`;

	const data = {
		title: `Feedback from ${userName}`,
		body: issueBody,
		labels: [':nerd_face: feedback']
	};

	const response = await fetch(REPO_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify(data)
	});

	if (response.ok) {
		return json({ message: 'success' });
	} else {
		const errorMessage = await response.text();
		console.error(`GitHub API error: ${errorMessage}`);
		return json({ message: 'failed' });
	}
};
