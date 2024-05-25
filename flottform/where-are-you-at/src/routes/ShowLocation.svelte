<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import markerShadow from 'leaflet/dist/images/marker-shadow.png';

	const { latitude, longitude } = $props<{ latitude: number; longitude: number }>();

	const tileProvider = 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png';

	const tileProviderAttribution = {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	};
	const customIcon = {
		iconUrl: markerIcon,
		iconRetinaUrl: markerIcon2x,
		shadowUrl: markerShadow,
		iconAnchor: [12.5, 41]
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

<style>
	div {
		height: 100%;
		width: 100%;
	}

	div :global(.marker-text) {
		width: 100%;
		text-align: center;
		font-weight: 600;
		background-color: #444;
		color: #eee;
		border-radius: 0.5rem;
	}

	div :global(.map-marker) {
		width: 30px;
		transform: translateX(-50%) translateY(-25%);
	}
</style>
