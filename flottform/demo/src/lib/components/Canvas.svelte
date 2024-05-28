<script lang="ts">
	import { onMount } from 'svelte';
	export let canvasElement: HTMLCanvasElement;

	let isPainting = false;
	let lineWidth = 2;
	let startX = 0;
	let startY = 0;

	let context: CanvasRenderingContext2D | null;
	let ongoingTouches: {
		identifier: number;
		x: number;
		y: number;
	}[] = [];

	onMount(() => {
		context = canvasElement.getContext('2d');
		return context;
	});

	function getRelativeMousePos(e: MouseEvent) {
		const rect = canvasElement.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) * (canvasElement.width / rect.width),
			y: (e.clientY - rect.top) * (canvasElement.height / rect.height)
		};
	}

	function getRelativeTouchPos(touch: Touch) {
		const rect = canvasElement.getBoundingClientRect();
		return {
			x: (touch.clientX - rect.left) * (canvasElement.width / rect.width),
			y: (touch.clientY - rect.top) * (canvasElement.height / rect.height)
		};
	}

	function copyTouch(touch: Touch) {
		const { identifier } = touch;
		const { x, y } = getRelativeTouchPos(touch);
		return { identifier, x, y };
	}

	function ongoingTouchIndexById(idToFind: number) {
		for (let i = 0; i < ongoingTouches.length; i++) {
			const id = ongoingTouches[i].identifier;

			if (id === idToFind) {
				return i;
			}
		}
		return -1;
	}

	function handleMouseDown(e: MouseEvent) {
		const { x, y } = getRelativeMousePos(e);
		startX = x;
		startY = y;
		isPainting = true;
		if (!context) {
			return;
		}
		context.beginPath();
		context.arc(x, y, lineWidth, 0, 0, false);
		context.fill();
	}

	function handleMouseMove(e: MouseEvent) {
		const { x, y } = getRelativeMousePos(e);
		if (!isPainting) {
			return;
		}
		if (context) {
			context.lineWidth = lineWidth;
			context.lineCap = 'round';
			context.beginPath();
			context.moveTo(startX, startY);
			context.lineTo(x, y);
			context.stroke();
			startX = x;
			startY = y;
		}
	}
	function handleMouseUp() {
		if (!context) {
			return;
		}
		isPainting = false;
		context.stroke();
		context.beginPath();
	}
	function handleTouchStart(e: TouchEvent) {
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			if (!context) {
				return;
			}
			const touchPos = getRelativeTouchPos(touches[i]);
			ongoingTouches.push(copyTouch(touches[i]));
			context.beginPath();
			context.arc(touchPos.x, touchPos.y, 2, 0, 0, false);

			context.fill();
		}
	}
	function handleTouchMove(e: TouchEvent) {
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const index = ongoingTouchIndexById(touches[i].identifier);
			if (!context) {
				return;
			}
			if (index >= 0) {
				const newTouchPos = getRelativeTouchPos(touches[i]);
				context.beginPath();
				context.moveTo(ongoingTouches[index].x, ongoingTouches[index].y);
				context.lineTo(newTouchPos.x, newTouchPos.y);
				context.lineWidth = lineWidth;
				context.stroke();
				ongoingTouches.splice(index, 1, copyTouch(touches[i]));
			} else {
				console.log("Didn't find a touch to continue");
			}
		}
	}
	function handleTouchEnd(e: TouchEvent) {
		const touches = e.changedTouches;
		for (let i = 0; i < touches.length; i++) {
			const index = ongoingTouchIndexById(touches[i].identifier);
			if (!context) {
				return;
			}
			if (index >= 0) {
				const newTouchPos = getRelativeTouchPos(touches[i]);
				context.lineWidth = lineWidth;
				context.beginPath();
				context.moveTo(ongoingTouches[index].x, ongoingTouches[index].y);
				context.lineTo(newTouchPos.x, newTouchPos.y);
				context.fillRect(
					touches[i].pageX - canvasElement.offsetLeft - lineWidth,
					touches[i].pageY - canvasElement.offsetTop - lineWidth,
					0,
					0
				);
				ongoingTouches.splice(index, 1);
			} else {
				console.log("Didn't find a touch to end");
			}
		}
	}
	function handleTouchCancel(e: TouchEvent) {
		const touches = e.changedTouches;

		for (let i = 0; i < touches.length; i++) {
			let index = ongoingTouchIndexById(touches[i].identifier);
			ongoingTouches.splice(index, 1);
		}
	}
</script>

<canvas
	id="canvas"
	bind:this={canvasElement}
	class="border-primary-blue rounded border touch-none min-h-0 min-w-0 w-full"
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mousemove={handleMouseMove}
	on:touchstart={handleTouchStart}
	on:touchend={handleTouchEnd}
	on:touchmove={handleTouchMove}
	on:touchcancel={handleTouchCancel}
></canvas>
