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

	// All Rail Trail Data
	// https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0

	var TRAILS = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
			where: "LINENAME = 'LVRT' OR LINENAME = 'MVRT' OR LINENAME = 'DHRT' OR LINENAME = 'BBRT'",
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
				layer.on('mouseover', () => {
					layer.setText(trail_information[feature.properties.LineName].name, {
						repeat: false,
						offset: -5,
						center: true,
						attributes: {
							fill: trail_information[feature.properties.LineName].color,
							'font-weight': 'bold',
							'font-size': '13',
						}
					});
				})
				layer.on('mouseout', () => {
					layer.setText(null)
				})
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
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/lvrt_mile_markers/FeatureServer/0",
			// where: "HASTRAILHEAD = 1 AND hasParking = 0",
			onEachFeature: function(feature, layer) {
				layer.bindTooltip(function() {
					return L.Util.template(`<b>Mile Marker: {number}</b>`, layer.feature.properties);
				})
			},
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					icon: L.icon({
						iconUrl: "./assets/icons/milemarker-square.svg",
						iconSize: [6, 6],
						iconAnchor: [3, 3],
						className: 'milemarker'
					})
					// icon: L.divIcon({
					// 	className: 'milemarker',
					// 	html: `<span>${geojson.properties.number}</span>`
					// })
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
			where: "HASTRAILHEAD = 1 AND hasParking = 0",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					return L.Util.template(`<b>Title: {displayName}</b><br/>Description: {description}<br/>Town: {town}<br/>Type: Trailhead`, layer.feature.properties);
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
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public_Facilities/FeatureServer/0",
			where: "facilityType = 11 AND isPublic = 1 AND isActive = 1 AND status = 4",
			onEachFeature: function(feature, layer) {
				layer.bindPopup(function() {
					return L.Util.template(`<b>Title: {displayName}</b><br/>Description: {description}<br/>Town: {town}<br/>Type: Parking`, layer.feature.properties);
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

	// Map Base Layers
	const baseLayers = {
		"Terrain": TERRAIN
	}

	// Map Overlays
	const overlays = {
		"<img src='assets/icons/trail-square.svg'/><span>Trails</span>": TRAILS,
		"<img src='assets/icons/milemarker-square.svg'/><span>Milemarkers</span>": LVRT_FEATURES_MILEMARKERS,
		"<img src='assets/icons/hiking-square.svg'/><span>Trailheads</span>": LVRT_FEATURES_TRAILHEADS,
		"<img src='assets/icons/parking-square.svg'/><span>Parking</span>": LVRT_FEATURES_PARKING,
		"<img src='assets/icons/restroom-square.svg'/><span>Restrooms</span>": LVRT_FEATURES_PARKING
	}

	// Map Controls
	L.control.layers(baseLayers, overlays, {
		'collapsed': false,
		'position': 'bottomright'
	}).addTo(map)

	map.on('zoomend', function() {
		console.log("Current Zoom Level = " + map.getZoom());

		if (map.getZoom() > 10 && !map.hasLayer(LVRT_FEATURES_MILEMARKERS))  {
			map.addLayer(LVRT_FEATURES_MILEMARKERS)
		}
		if (map.getZoom() <= 10 && map.hasLayer(LVRT_FEATURES_MILEMARKERS))  {
			map.removeLayer(LVRT_FEATURES_MILEMARKERS)
		}

		if (map.getZoom() > 9 && !map.hasLayer(LVRT_FEATURES_PARKING))  {
			map.addLayer(LVRT_FEATURES_PARKING)
		}
		if (map.getZoom() <= 9 && map.hasLayer(LVRT_FEATURES_PARKING))  {
			map.removeLayer(LVRT_FEATURES_PARKING)
		}

		if (map.getZoom() > 9 && !map.hasLayer(LVRT_FEATURES_TRAILHEADS))  {
			map.addLayer(LVRT_FEATURES_TRAILHEADS)
		}
		if (map.getZoom() <= 9 && map.hasLayer(LVRT_FEATURES_TRAILHEADS))  {
			map.removeLayer(LVRT_FEATURES_TRAILHEADS)
		}
	})

})
