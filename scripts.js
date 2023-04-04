document.addEventListener('DOMContentLoaded', () => {


	// GLOBAL MAP DEFINITIONS
	// ArcGIS developer key — Free tier
	const apiKey = "AAPK7f7375fcf29f4a7281b7b4d3eadb12abevbloJc-GM_mROEEHDATdX95ri0jPxl3WAo5oszGdXUxUTZQx8BNLNOPGDyTYD4_";

	// Map Layers
	const TERRAIN = L.esri.Vector.vectorBasemapLayer('ArcGIS:Terrain', {
		apikey: apiKey
	})

	const TOPOGRAPHIC = L.esri.Vector.vectorBasemapLayer('ArcGIS:Topographic', {
		apikey: apiKey
	})

	const SATELLITE = L.esri.Vector.vectorBasemapLayer('ArcGIS:Imagery', {
		apikey: apiKey
	})

	// Create the map
	const map = L.map('map', {
		center: [44.0342182, -72.0556608],
		zoom: 9,
		layers: [TERRAIN]
	})

	// State of Vermont outline
	// L.geoJson(statesData, {
	// 	color: 'red',
	// 	opacity: 0.2,
	// 	fillColor: 'red',
	// 	fillOpacity: 0.02
	// }).addTo(map);

	// Used to map milemarker labels to trail labels
	const trail_map = {
		'VRL24': 'BBRT',
		'VRL23': 'MVRT',
		'VRL22': 'DHRT',
		'VRL13': 'LVRT',
	}

	// Definition for trail specific data - can be referenced globally by trail
	const trail_information = {
		'LVRT': {
			label: 'LVRT',
			name: 'Lamoille Valley Rail Trail',
			color: 'rgba(0, 169, 230, 1)',
		},
		'MVRT': {
			label: 'MVRT',
			name: 'Missisquoi Valley Rail Trail',
			color: 'rgba(182, 191, 11, 1)',
		},
		'DHRT': {
			label: 'DHRT',
			name: 'Delaware & Hudson Rail Trail',
			color: 'rgba(210, 73, 42, 1)',
		},
		'BBRT': {
			label: 'BBRT',
			name: 'Beebe Spur Rail Trail',
			color: 'rgba(205, 48, 252, 1)',
		}
	}

	function create_tooltip(feature, icon, address) {
		console.log(feature)

		let title = feature.properties.displayName
		const description = feature.properties.description
		const directions = feature.geometry.coordinates ? `https://www.google.com/maps/search/?api=1&query=${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}` : ''

		if (icon == 'crossing-triangle') {
			title = feature?.properties?.featureCrossed
		}

		let parking = null
		if (icon == 'parking-square') {
			parking = feature.properties.parkingSpaces ? `<p>${feature.properties.parkingSpaces} parking spaces</p>` : ''
		}

		let icons = [];
		const features = {
			'parking-square': feature?.properties?.hasParking,
			'hiking-square': feature?.properties?.hasTrailhead,
			'restroom-square': feature?.properties?.hasRestrooms,
			'crossing-triangle': feature?.properties?.symbolCategory == 'Ped Xing' ? 1:0
		}

		for (const [key, value] of Object.entries(features)) {
			if (value) {
				icons.push(`<img class="tooltip-image" alt="Parking Icon" src="assets/icons/${key}.svg"/>`)
			}
		}


		let addr = address ? `<address class="tooltip-address">
		<a href="https://google.com/maps?q=${encodeURIComponent(address.Match_addr)}" target="_blank">
			${address.Address}<br/>
			${address.City}, ${address.Region} ${address.Postal}
		</a>
		</address>` : ''

		let grid = []
		feature.properties.parkingSpaces ? grid.push(`<div class="grid-cell"><div class="grid-cell-label">Parking</div><div class="grid-cell-value">${feature.properties.parkingSpaces} spaces</div></div>`) : ''
		feature.properties.hasTrailhead ? grid.push(`<div class="grid-cell"><div class="grid-cell-label">Trails</div><div class="grid-cell-value">Yes</div></div>`) : ''
		feature.properties.hasRestrooms ? grid.push(`<div class="grid-cell"><div class="grid-cell-label">Restrooms</div><div class="grid-cell-value">Yes</div></div>`) : ''
		// feature.properties.symbolCategory == 'Ped Xing' ? grid.push(`<div class="grid-cell"><div class="grid-cell-label">Pedestrian Crossing</div><div class="grid-cell-value">Yes</div></div>`) : ''

		const template = `
		<div class="tooltip-icons">${icons.join('')}</div>
		<h3 class="title">${title ? title : description ? description : ''}</h3>
		<p class="description">${title ? description ? description : '' : ''}</p>
		${addr ? addr : ''}
		<div class="tooltip-grid" data-count="${grid.length}">${grid.join('')}</div>
		`

		return template
	}

	// All Rail Trail Data
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0

	// const TRAILS_OTHER = L.esri.featureLayer(
	// 	{
	// 		url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
	// 		where: "StateOwned LIKE 'Y' AND RailTrail LIKE 'Y'",
	// 		onEachFeature: (feature, layer) => {
	// 			layer.on('mouseover', () => {
	// 				console.log('---')
	// 				console.log(feature.properties.Division)
	// 				console.log('State Owned: ',feature.properties.StateOwned)
	// 				console.log('Rail Trail: ',feature.properties.RailTrail)
	// 				console.log(feature.properties)
	// 			})
	// 		},
	// 		style: (feature) => {
	// 			return {
	// 				color: 'pink',
	// 				weight: "3",
	// 				opacity: 0.65
	// 			  };
	// 		  }
	// 	}
	// )
	// .addTo(map);

	const TRAILS_LVRT = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
			where: "LINENAME = 'LVRT'",
			// simplifyFactor: 2,
			onEachFeature: (feature, layer) => {
				// layer.bindTooltip(
				// 	trail_information[feature.properties.LineName].name,
				// 	{
				// 		permanent: false,
				// 		direction: 'center',
				// 		className: 'tooltip_style',
				// 		interactive: true
				// 	}
				// )
				// layer.setText(trail_information[feature.properties.LineName].name, {
				// 	repeat: false,
				// 	offset: -5,
				// 	center: true,
				// 	attributes: {
				// 		fill: trail_information[feature.properties.LineName].color,
				// 		'font-weight': 'bold',
				// 		'font-size': '10',
				// 	}
				// });
				// layer.on('mouseover', () => {
				// 	layer.setText(trail_information[feature.properties.LineName].name, {
				// 		repeat: false,
				// 		offset: -5,
				// 		center: true,
				// 		attributes: {
				// 			fill: trail_information[feature.properties.LineName].color,
				// 			'font-weight': 'bold',
				// 			'font-size': '13',
				// 		}
				// 	});
				// })
				// layer.on('mouseout', () => {
				// 	layer.setText(null)
				// })
			},
			style: (feature) => {
				return {
					color: trail_information[feature.properties.LineName].color,
					// dashArray: "5",
					// dashOffset: "2",
					weight: "4"
				  };
			  }
		}
	)
	.addTo(map);

	const TRAILS_MVRT = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
			where: "LINENAME = 'MVRT'",
			style: (feature) => {
				return {
					color: trail_information[feature.properties.LineName].color,
					weight: "4"
				  };
			  }
		}
	)
	.addTo(map);

	const TRAILS_DHRT = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
			where: "LINENAME = 'DHRT'",
			style: (feature) => {
				return {
					color: trail_information[feature.properties.LineName].color,
					weight: "4"
				  };
			  }
		}
	)
	.addTo(map);

	const TRAILS_BBRT = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
			where: "LINENAME = 'BBRT'",
			style: (feature) => {
				return {
					color: trail_information[feature.properties.LineName].color,
					weight: "4"
				  };
			  }
		}
	)
	.addTo(map);

	// LVRT Milemarker data
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/lvrt_mile_markers/FeatureServer

	const LVRT_FEATURES_MILEMARKERS = L.esri.featureLayer(
		{
			url: "https://maps.vtrans.vermont.gov/arcgis/rest/services/Rail/Rail_MilePosts/MapServer/2",
			where: "VRLID = 'VRL24' OR VRLID = 'VRL23' OR VRLID = 'VRL22' OR VRLID = 'VRL13'",
			minZoom: 13,
			maxZoom: 16,
			pointToLayer: function(geojson, latlng) {
				const trail = trail_map?.[geojson?.properties?.VRLID]
				const color = trail_information[trail].color
				// console.log(color)
				return L.marker(latlng, {
					icon: L.divIcon({
						iconSize: [20, 20],
						iconAnchor: [10, 10],
						className: `milemarker milemarker-${geojson?.properties?.VRLID}`,
						html: `<span class="icon" aria-hidden="true"><svg fill="none" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="m254.4 14.1c-7.6-9-18.7-14.1-30.4-14.1s-22.8 5.1-30.4 14.1l-184 216c-12.8 14.9-12.8 36.9 0 51.8l184 216c7.6 8.9 18.7 14.1 30.4 14.1s22.8-5.1 30.4-14.1l184-216c12.7-14.9 12.7-36.9 0-51.9l-184-216v0.1z" fill="${color}"/></svg></span><span class="text">Mile<br/>${geojson.properties.MP}</span>`
					})
				})
			},

		}
	)
	.addTo(map);

	const LVRT_FEATURES_MILEMARKERS_01 = L.esri.featureLayer(
		{
			url: "https://maps.vtrans.vermont.gov/arcgis/rest/services/Rail/Rail_MilePosts/MapServer/1",
			where: "VRLID = 'VRL24' OR VRLID = 'VRL23' OR VRLID = 'VRL22' OR VRLID = 'VRL13'",
			minZoom: 16,
			pointToLayer: function(geojson, latlng) {
				const trail = trail_map?.[geojson?.properties?.VRLID]
				const color = trail_information[trail].color
				// console.log(color)
				return L.marker(latlng, {
					icon: L.divIcon({
						iconSize: [20, 20],
						iconAnchor: [10, 10],
						className: `milemarker milemarker-${geojson?.properties?.VRLID}`,
						html: `<span class="icon" aria-hidden="true"><svg fill="none" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="m254.4 14.1c-7.6-9-18.7-14.1-30.4-14.1s-22.8 5.1-30.4 14.1l-184 216c-12.8 14.9-12.8 36.9 0 51.8l184 216c7.6 8.9 18.7 14.1 30.4 14.1s22.8-5.1 30.4-14.1l184-216c12.7-14.9 12.7-36.9 0-51.9l-184-216v0.1z" fill="${color}"/></svg></span><span class="text">Mile<br/>${geojson.properties.MP}</span>`
					})
				})
			},
		}
	)
	.addTo(map);

	// All trailhead data for LVRT
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0

	// All parking data for LVRT
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public_Facilities/FeatureServer/0

	var LVRT_FEATURES_PARKING = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			minZoom: 10,
			where: "hasParking = 1 AND isPublic = 1 AND isActive = 1",
			onEachFeature: function(feature, layer) {

				let address = null
				// L.esri.Geocoding
				// 	.reverseGeocode({
				// 		apikey: apiKey
				// 	})
				// 	.latlng([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
				// 	.run(function (error, result) {
				// 		if (error) {
				// 			false
				// 		}
				// 		address = result.address
				// 	});

				layer.bindPopup(function() {
					return L.Util.template(create_tooltip(feature, 'parking-square', address), layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					riseOnHover: true,
					zIndexOffset: 300,
					icon: L.icon({
						iconUrl: "./assets/icons/parking-square.svg",
						iconSize: [18, 18],
						iconAnchor: [9, 9],
						className: 'test-2'
					})
				})
			}
		}
	)
	.addTo(map);

	var LVRT_FEATURES_TRAILHEADS = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			minZoom: 10,
			where: "HASTRAILHEAD = 1 AND isPublic = 1 AND isActive = 1",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					return L.Util.template(create_tooltip(feature, 'hiking-square', null), layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					riseOnHover: true,
					zIndexOffset: 200,
					icon: L.icon({
						iconUrl: "./assets/icons/hiking-square.svg",
						iconSize: [18, 18],
						iconAnchor: [9-2, 9-2],
						className: 'test-1'
					})
				})
			},

		}
	)
	.addTo(map);

	var LVRT_FEATURES_RESTROOMS = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			minZoom: 10,
			where: "hasRestrooms = 1 AND isPublic = 1 AND isActive = 1",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					return L.Util.template(create_tooltip(feature, 'restroom-square', null), layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					riseOnHover: true,
					zIndexOffset: 100,
					icon: L.icon({
						iconUrl: "./assets/icons/restroom-square.svg",
						iconSize: [18, 18],
						iconAnchor: [9-4, 9-4],
						className: 'test-1'
					})
				})
			},

		}
	)
	.addTo(map);

	var LVRT_FEATURES_CROSSING = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			minZoom: 10,
			where: "symbolCategory LIKE 'Ped Xing' AND isPublic = 1 AND isActive = 1",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					return L.Util.template(create_tooltip(feature, 'crossing-triangle', null), layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					// riseOnHover: true,
					zIndexOffset: 99,
					icon: L.icon({
						iconUrl: "./assets/icons/crossing-triangle.svg",
						iconSize: [18, 18],
						iconAnchor: [9, 9],
						className: 'test-1'
					})
				})
			},

		}
	)
	.addTo(map);

	// Map Base Layers
	const baseLayers = {
		"Terrain": TERRAIN,
		"Topographic": TOPOGRAPHIC,
		"Satellite": SATELLITE
	}

	// Map Overlays
	const overlays = {
		"<img src='assets/icons/trail-square.svg'/><span>LVRT</span>": TRAILS_LVRT,
		"<img src='assets/icons/trail-square.svg'/><span>MVRT</span>": TRAILS_MVRT,
		"<img src='assets/icons/trail-square.svg'/><span>DHRT</span>": TRAILS_DHRT,
		"<img src='assets/icons/trail-square.svg'/><span>BBRT</span>": TRAILS_BBRT,
		// "<img src='assets/icons/trail-square.svg'/><span>OTHER</span>": TRAILS_OTHER,
		// "<img src='assets/icons/milemarker-square.svg'/><span>Mileposts</span>": LVRT_FEATURES_MILEMARKERS,
		"<img src='assets/icons/hiking-square.svg'/><span>Trailheads</span>": LVRT_FEATURES_TRAILHEADS,
		"<img src='assets/icons/parking-square.svg'/><span>Parking</span>": LVRT_FEATURES_PARKING,
		"<img src='assets/icons/restroom-square.svg'/><span>Restrooms</span>": LVRT_FEATURES_RESTROOMS,
		"<img src='assets/icons/crossing-triangle.svg'/><span>Crossing</span>": LVRT_FEATURES_CROSSING
	}

	// Map Controls
	const legend = L.control.layers(baseLayers, overlays, {
		'collapsed': false,
		'position': 'bottomright'
	}).addTo(map)

	const scale = L.control.scale().addTo(map)

	map.on('zoomend', function() {
		console.log("Current Zoom Level = " + map.getZoom());
		var currentZoom = map.getZoom()

		// let x = 50, y = 50

		// let LeafIcon = L.Icon.extend({
		// 	options: {
		// 		iconSize: [x, y]
		// 	}
		// })
		// layer.setIcon(LeafIcon)

		// LVRT_FEATURES_PARKING.eachFeature(function(layer) {

		// 	console.log(layer)

		// 	var my_icon = L.icon({
		// 		iconSize: [50, 50],
		// 	})

		// 	layer.setIcon(my_icon)

		// 	console.log('zoom set')

		// 	// layer.options.icon.iconSize = [50, 50]
		// 	// console.log(layer.options.icon.iconSize)
		// });

		// var LeafIcon = L.Icon.extend({
		// 	options: {
		// 		iconSize: [50, 50]
		// 	}
		// })

		// if (map.getZoom() > 11 && !map.hasLayer(LVRT_FEATURES_MILEMARKERS))  {
		// 	map.addLayer(LVRT_FEATURES_MILEMARKERS)
		// }
		// if (map.getZoom() <= 11 && map.hasLayer(LVRT_FEATURES_MILEMARKERS))  {
		// 	map.removeLayer(LVRT_FEATURES_MILEMARKERS)
		// }

		// if (map.getZoom() > 9 && !map.hasLayer(LVRT_FEATURES_PARKING))  {
		// 	map.addLayer(LVRT_FEATURES_PARKING)
		// }
		// if (map.getZoom() <= 9 && map.hasLayer(LVRT_FEATURES_PARKING))  {
		// 	map.removeLayer(LVRT_FEATURES_PARKING)
		// }

		// if (map.getZoom() > 9 && !map.hasLayer(LVRT_FEATURES_TRAILHEADS))  {
		// 	map.addLayer(LVRT_FEATURES_TRAILHEADS)
		// }
		// if (map.getZoom() <= 9 && map.hasLayer(LVRT_FEATURES_TRAILHEADS))  {
		// 	map.removeLayer(LVRT_FEATURES_TRAILHEADS)
		// }
	})

})
