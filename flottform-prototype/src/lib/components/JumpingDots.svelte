<div class="connecting">Connecting to form</div>
<div class="loadingWrapper">
	<span class="dots" />
	<span class="dots" />
	<span class="dots" />
</div>

<style>
	.connecting {
		padding-top: 2rem;
	}
	.loadingWrapper {
		display: flex;
		gap: 1rem;
	}
	.dots {
		animation: jumpingDots 1.3s linear infinite;
		height: 1rem;
		width: 1rem;
		border-radius: 50%;
		display: flex;
		gap: 0.5rem;
	}
	.dots:nth-child(1) {
		background-color: var(--cus-color-blue);
	}
	.dots:nth-child(3) {
		animation-delay: -0.8s;
		background-color: var(--cus-color-red);
	}
	.dots:nth-child(2) {
		animation-delay: -1.2s;
		background-color: var(--cus-color-green);
	}
	@keyframes jumpingDots {
		0%,
		60%,
		100% {
			transform: initial;
		}

		30% {
			transform: translateY(-10px);
			opacity: 0.8;
		}
	}
</style>
