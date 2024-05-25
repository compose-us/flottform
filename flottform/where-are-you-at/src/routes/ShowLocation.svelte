<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';

	const { latitude, longitude } = $props<{ latitude: number; longitude: number }>();

	export const tileProvider = 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png';

	export const tileProviderAttribution = {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	};

	let mapInstance: L.Map | null;
	let markerInstance: L.Marker | null;
	const mapId = 'leaflet-map';

	onMount(async () => {
		const leaflet = await import('leaflet');

		mapInstance = leaflet.map(mapId).setView([latitude, longitude], 13);

		leaflet.tileLayer(tileProvider, tileProviderAttribution).addTo(mapInstance);
		markerInstance = leaflet.marker([latitude, longitude]).addTo(mapInstance);
	});

	$effect(() => {
		if (browser) {
			const run = async () => {
				const leaflet = await import('leaflet');

				if (markerInstance) {
					mapInstance?.removeLayer(markerInstance);
				}
				if (mapInstance) {
					markerInstance = leaflet.marker([latitude, longitude]).addTo(mapInstance);

					mapInstance.setView([latitude, longitude]);
				}
			};
			run();
		}
	});

	onDestroy(() => {
		if (browser) {
			markerInstance?.remove();
			markerInstance = null;

			mapInstance?.remove();
			mapInstance = null;
		}
	});

	const resizeMap = () => {
		if (mapInstance) mapInstance.invalidateSize();
	};
</script>

<svelte:window on:resize={resizeMap} />
<div id={mapId}>&nbsp;</div>
