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

	map.pm.addControls({
        position:'topleft',
        // Customize the visible tools
        editControls:false,
        drawRectangle:false,
        drawCircle:false,
        drawCircleMarker:false,
        drawText:false
      });

      map.pm.setGlobalOptions({
        pathOptions: {
          weight: 2,
          color: "#4d4d4d",
          fillColor: "#808080",
          fillOpacity: 0.2,
          dashArray:[4, 4]}
      });


	// Grab the local json query data
	// L.esri.get('https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0', {}, (error, response) => {

	// 	if (error) {
	// 		return false
	// 	}

	// 	// console.log(response)

	// 	response.features.forEach(feature => {

	// 		if (feature.properties.displayName == null) {
	// 			return false
	// 		}

	// 		// console.log(feature)

	// 		var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
	// 			// Marker options
	// 		}).addTo(map);

	// 		// Marker popup
	// 		marker.bindPopup(`<p><strong>${feature.properties.displayName}</strong></p>`)
	// 	})

	// })

	// L.esri.get('https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_State_Rail_Lines_and_Trails/FeatureServer/0', {}, (error, response) => {

	// 	if (error) {
	// 		return false
	// 	}

	// 	console.log(response);
	// })

	map.createPane("bikeTrails");

	const trails_to_render = [
		'LVRT',
		'MVRT',
		'DHRT',
		// 'CLP',
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
				  dashArray: "5",
				  dashOffset: "2",
				  weight: "3"
				};
			  }
		}
	)
	.addTo(map);

	trails.bindPopup(function (layer) {
		return L.Util.template("<b>{LineName}</b><br>Miles: {TotalMiles}</br>", layer.feature.properties);
	});

	// var trail_lvrt_features = L.esri.featureLayer(
	// 	{
	// 		url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/0",
	// 		onEachFeature: (feature) => {

	// 		},
	// 	}
	// )
	// .addTo(map);

	// trail_lvrt_features.bindPopup(function (layer) {
	// 	return L.Util.template("<b>{displayName}</b><br/>{town}, Vermont", layer.feature.properties);
	// });

	// var trail_lvrt_area = L.esri.featureLayer(
	// 	{
	// 		url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/2",
	// 		simplifyFactor: 0.5,
	// 		precision: 4,
	// 	}
	// )
	// .addTo(map);

	// var trail_lvrt_carto = L.esri.featureLayer(
	// 	{
	// 		url: "https://services1.arcgis.com/NXmBVyW5TaiCXqFs/ArcGIS/rest/services/VT_Rail_Trails_Viewer_Public/FeatureServer/9",
	// 		simplifyFactor: 0.5,
	// 		precision: 4,
	// 	}
	// )
	// .addTo(map);





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
