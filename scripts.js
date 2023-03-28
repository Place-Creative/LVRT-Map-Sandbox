let cursor = {
	x: 0,
	y: 0
}

window.addEventListener('mousemove', () => {

})

document.addEventListener('DOMContentLoaded', () => {


	// GLOBAL MAP DEFINITIONS
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
	L.geoJson(statesData, {
		color: 'red',
		opacity: 0.2,
		fillColor: 'red',
		fillOpacity: 0.02
	}).addTo(map);

	// GLOBAL TRAIL DEFINITIONS

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

	function create_tooltip(feature, icon) {
		console.log(feature)
		const title = feature.properties.displayName
		const description = feature.properties.description
		const directions = feature.geometry.coordinates ? `https://www.google.com/maps/search/?api=1&query=${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}` : ''

		let parking = null
		if (icon == 'parking') {
			parking = feature.properties.parkingSpaces ? `<p>${feature.properties.parkingSpaces} parking spaces</p>` : ''
		}

		const template = `
		<img class="tooltip-image" alt="${icon} Icon" src="assets/icons/${icon}-square.svg"/>
		<p><b>${title ? title : description ? description : ''}</b><br/></p>
		<p>${title ? description ? description : '' : ''}</p>
		${parking ? parking : ''}
		<p><a href="${directions}" target="_blank" rel="norefer nofollow">Get Directions</a></p>
		`

		return template
	}

	// All Rail Trail Data
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0

	var TRAILS = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
			where: "LINENAME = 'LVRT' OR LINENAME = 'MVRT' OR LINENAME = 'DHRT' OR LINENAME = 'BBRT'",
			simplifyFactor: 6,
			onEachFeature: (feature, layer) => {
				// layer.bindTooltip(
				// 	feature.properties.LineName,
				// 	{
				// 		permanent: false,
				// 		direction: 'center',
				// 		className: 'tooltip_style',
				// 		interactive: true
				// 	}
				// )
				layer.setText(trail_information[feature.properties.LineName].name, {
					repeat: false,
					offset: -5,
					center: true,
					attributes: {
						fill: trail_information[feature.properties.LineName].color,
						'font-weight': 'bold',
						'font-size': '10',
					}
				});
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
					dashArray: "5",
					dashOffset: "2",
					weight: "3"
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
			onEachFeature: function(feature, layer) {
				layer.bindTooltip(function() {
					console.log(layer)
					console.log(feature)
					return L.Util.template(`<b>Mile Marker: {MP}</b>`, layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					// icon: L.icon({
					// 	iconUrl: "./assets/icons/milemarker-square.svg",
					// 	iconSize: [9, 9],
					// 	iconAnchor: [4, 4],
					// 	className: 'milemarker'
					// })
					icon: L.divIcon({
						className: 'milemarker',
						html: `<span class="icon" aria-hidden="true"></span><span class="text">${geojson.properties.MP}</span>`
					})
				})
			},

		}
	)
	.addTo(map);

	// All trailhead data for LVRT
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0

	var LVRT_FEATURES_TRAILHEADS = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			minZoom: 10,
			where: "HASTRAILHEAD = 1 AND isPublic = 1 AND isActive = 1",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					return L.Util.template(create_tooltip(feature, 'hiking'), layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					icon: L.icon({
						iconUrl: "./assets/icons/hiking-square.svg",
						iconSize: [18, 18],
						iconAnchor: [9, 9],
						className: 'test-1'
					})
				})
			},

		}
	)
	.addTo(map);

	// All parking data for LVRT
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public_Facilities/FeatureServer/0

	var LVRT_FEATURES_PARKING = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			minZoom: 10,
			where: "hasParking = 1 AND isPublic = 1 AND isActive = 1",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					// console.log(layer)
					return L.Util.template(create_tooltip(feature, 'parking'), layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
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

	var LVRT_FEATURES_RESTROOMS = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			minZoom: 10,
			where: "hasRestrooms = 1 AND isPublic = 1 AND isActive = 1",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					return L.Util.template(create_tooltip(feature, 'restroom'), layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					icon: L.icon({
						iconUrl: "./assets/icons/restroom-square.svg",
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
		"<img src='assets/icons/trail-square.svg'/><span>Trails</span>": TRAILS,
		"<img src='assets/icons/milemarker-square.svg'/><span>Milemarkers</span>": LVRT_FEATURES_MILEMARKERS,
		"<img src='assets/icons/hiking-square.svg'/><span>Trailheads</span>": LVRT_FEATURES_TRAILHEADS,
		"<img src='assets/icons/parking-square.svg'/><span>Parking</span>": LVRT_FEATURES_PARKING,
		"<img src='assets/icons/restroom-square.svg'/><span>Restrooms</span>": LVRT_FEATURES_RESTROOMS
	}

	// Map Controls
	L.control.layers(baseLayers, overlays, {
		'collapsed': false,
		'position': 'bottomright'
	}).addTo(map)

	map.on('zoomend', function() {
		console.log("Current Zoom Level = " + map.getZoom());

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
