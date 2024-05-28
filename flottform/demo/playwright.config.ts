import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: [
		{
			command: 'pnpm run -r dev --host',
			url: 'https://192.168.178.23:5173',
			reuseExistingServer: true,
			ignoreHTTPSErrors: true
		}
	],
	use: {
		ignoreHTTPSErrors: true,
		baseURL: 'https://192.168.178.23:5173'
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
