<script lang="ts">
	import { onMount } from 'svelte';
	export let canvasElement: HTMLCanvasElement;

	let isPainting = false;
	let lineWidth = 4;
	let startX = 0;
	let startY = 0;

	let context: CanvasRenderingContext2D | null;
	let ongoingTouches: {
		identifier: number;
		pageX: number;
		pageY: number;
	}[] = [];

	onMount(() => {
		context = canvasElement.getContext('2d');
		return context;
	});

	function copyTouch({
		identifier,
		pageX,
		pageY
	}: {
		identifier: number;
		pageX: number;
		pageY: number;
	}) {
		return { identifier, pageX, pageY };
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
		isPainting = true;
		if (!context) {
			return;
		}
		startX = e.pageX - canvasElement.offsetLeft;
		startY = e.pageY - canvasElement.offsetTop;
		context.beginPath();
		context.arc(
			e.pageX - canvasElement.offsetLeft,
			e.pageY - canvasElement.offsetTop,
			lineWidth,
			0,
			0,
			false
		);
		context.fill();
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isPainting) {
			return;
		}

		if (context) {
			context.lineWidth = lineWidth;
			context.lineCap = 'round';
			const x = e.pageX - canvasElement.offsetLeft;
			const y = e.pageY - canvasElement.offsetTop;
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
			ongoingTouches.push(copyTouch(touches[i]));
			context.beginPath();
			context.arc(
				touches[i].pageX - canvasElement.offsetLeft,
				touches[i].pageY - canvasElement.offsetTop,
				lineWidth,
				0,
				0,
				false
			);
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
				context.beginPath();
				context.moveTo(
					ongoingTouches[index].pageX - canvasElement.offsetLeft,
					ongoingTouches[index].pageY - canvasElement.offsetTop
				);
				context.lineTo(
					touches[i].pageX - canvasElement.offsetLeft,
					touches[i].pageY - canvasElement.offsetTop
				);
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
				context.lineWidth = lineWidth;
				context.beginPath();
				context.moveTo(
					ongoingTouches[index].pageX - canvasElement.offsetLeft,
					ongoingTouches[index].pageY - canvasElement.offsetTop
				);
				context.lineTo(
					touches[i].pageX - canvasElement.offsetLeft,
					touches[i].pageY - canvasElement.offsetTop
				);
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
	bind:this={canvasElement}
	class="border-primary-blue rounded border touch-none min-h-0 min-w-0 w-96"
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mousemove={handleMouseMove}
	on:touchstart={handleTouchStart}
	on:touchend={handleTouchEnd}
	on:touchmove={handleTouchMove}
	on:touchcancel={handleTouchCancel}
></canvas>
