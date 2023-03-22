document.addEventListener('DOMContentLoaded', () => {

	const apiKey = "AAPK7f7375fcf29f4a7281b7b4d3eadb12abevbloJc-GM_mROEEHDATdX95ri0jPxl3WAo5oszGdXUxUTZQx8BNLNOPGDyTYD4_";

	const map = L.map('map').setView(
		[44.0342182, -72.0556608], //lat/lng
		9 //zoom
	);

	L.esri.Vector.vectorBasemapLayer(
		'ArcGIS:Terrain', {
			apikey: apiKey
		}
	).addTo(map);

	map.createPane("bikeTrails");

	L.geoJson(statesData, {
		color: 'red',
		opacity: 0.2,
		fillColor: 'red',
		fillOpacity: 0.02
	}).addTo(map);

	const trails_to_render = [
		'LVRT',
		'MVRT',
		'DHRT',
		'BBRT'
	];

	var trails = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0",
			pane: 'bikeTrails',
			fetchAllFeatures: true,
			onEachFeature: (feature) => {
				// console.log(feature)
			},
			style: (feature) => {

				let color = 'transparent';
				if (trails_to_render.includes(feature.properties.LineName)){
					color = 'red'

					if (feature.properties.LineName === 'LVRT') {
						color = 'green'
					}
					if (feature.properties.LineName === 'MVRT') {
						color = 'purple'
					}
					if (feature.properties.LineName === 'BBRT') {
						color = 'orange'
					}
					if (feature.properties.LineName === 'CLP' || feature.properties.LineName === 'DHRT') {
						color = 'blue'
					}
				}

				return {
				  color: color,
				//   dashArray: "5",
				//   dashOffset: "2",
				  weight: "3"
				};
			  }
		}
	)
	.addTo(map);

	trails.bindPopup(function (layer) {
		return L.Util.template("<b>{LineName}</b><br>Miles: {TotalMiles}</br>", layer.feature.properties);
	});

	var LVRT_FEATURES_TRAILHEADS = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
			where: "HASTRAILHEAD = 1 AND hasParking = 0",
			pointToLayer: function(geojson, latlng) {
				return L.marker(latlng, {
					icon: L.icon({
						iconUrl: "./assets/icons/hiking-square.svg",
						iconSize: [18, 18],
						iconAnchor: [9, 9],
						className: 'test-1'
					})
				})
			}
		}
	)
	.addTo(map);

	LVRT_FEATURES_TRAILHEADS.bindPopup(function (layer) {
		console.log('trailhead')
		console.log(layer.feature.properties)
		return L.Util.template(`<b>Title: {displayName}</b><br/>Description: {description}<br/>Town: {town}<br/>Type: Trailhead`, layer.feature.properties);
	});

	var LVRT_FEATURES_PARKING = L.esri.featureLayer(
		{
			url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public_Facilities/FeatureServer/0",
			where: "facilityType = 11 AND isPublic = 1 AND isActive = 1 AND status = 4",
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

	LVRT_FEATURES_PARKING.bindPopup(function (layer) {
		console.log('parking')
		console.log(layer.feature.properties)
		return L.Util.template(`<b>Title: {displayName}</b><br/>Description: {description}<br/>Town: {town}<br/>Type: Parking`, layer.feature.properties);
	});

	// L.esri.get("./data/VTrans_RailTrail_Map_Layers", {}, function (error, response) {
    //     if (error) {
    //       return;
    //     }

	// 	console.log(response)

    //     const arcGISFeatures = response.features;
    //     // const idField = response.operationalLayers[0].featureCollection.layers[0].layerDefinition.objectIdField;

    //     // empty geojson feature collection
    //     const geoJSONFeatureCollection = {
    //       type: "FeatureCollection",
    //       features: []
    //     };

    //     for (let i = arcGISFeatures.length - 1; i >= 0; i--) {
    //       // convert ArcGIS Feature to GeoJSON Feature
    //       const geoJSONFeature = L.esri.Util.arcgisToGeoJSON(arcGISFeatures[i], i);

	// 	  console.log(geoJSONFeature);

    //       // unproject the web mercator coordinates to lat/lng
    //       const latlng = L.Projection.Mercator.unproject(L.point(geoJSONFeature.geometry.coordinates));
    //       geoJSONFeature.geometry.coordinates = [latlng.lng, latlng.lat];

    //       geoJSONFeatureCollection.features.push(geoJSONFeature);
    //     }

    //     const geojsonLayer = L.geoJSON(geoJSONFeatureCollection).addTo(map);
    //     map.fitBounds(geojsonLayer.getBounds());
    //   });

})
