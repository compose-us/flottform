import { CREATE_ISSUE_TOKEN, CREATE_ISSUE_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

const REPO_URL = `${CREATE_ISSUE_URL}/issues`;
const accessToken = CREATE_ISSUE_TOKEN || '';

const sanitizeUserInput = (text: string): string => {
	return text
		.replace(/([\\_*[\](){}\-#`])/g, '\\$1')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
};

export const POST = async ({ fetch, request }) => {
	const {
		userName,
		email,
		linkedin,
		twitter,
		feedbackPositive,
		feedbackImprovements,
		contactChoice
	} = await request.json();
	const issueBody = `**Name**: ${sanitizeUserInput(userName)}
**📧 E-Mail**: ${sanitizeUserInput(email) || '-'}
**📟 LinkedIn**: ${sanitizeUserInput(linkedin) || '-'}
**🐦 X / Twitter**: ${sanitizeUserInput(twitter) || '-'}
**Preferred way of contact**: ${sanitizeUserInput(contactChoice)}

**🚀 What they like about Flottform:**
${sanitizeUserInput(feedbackPositive)}

**⚙️ What they think we can improve:**
${sanitizeUserInput(feedbackImprovements)}`;

	const data = {
		title: `Feedback from ${sanitizeUserInput(userName)}`,
		body: issueBody,
		labels: [':nerd_face: Feedback - Demo']
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
