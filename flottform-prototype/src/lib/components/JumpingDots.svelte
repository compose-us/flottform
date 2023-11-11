<div class="loadingWrapper">
	<span class="dots" />
	<span class="dots" />
	<span class="dots" />
</div>

<style>
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
		background-color: deeppink;
	}
	.dots:nth-child(3) {
		animation-delay: -0.8s;
	}
	.dots:nth-child(2) {
		animation-delay: -1.2s;
	}
	@keyframes jumpingDots {
		0%,
		60%,
		100% {
			transform: initial;
		}

		30% {
			transform: translateY(-10px);
			background-color: #ff6ec4;
		}
	}
</style>
