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


	// Grab the local json query data
	L.esri.get('./data/query.json', {}, (error, response) => {

		if (error) {
			return false
		}

		// console.log(response)

		response.features.forEach(feature => {

			// if (feature.properties.displayName == null) {
			// 	return false
			// }

			// console.log(feature)

			var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
				// Marker options
			}).addTo(map);

			// Marker popup
			marker.bindPopup(`<p><strong>${feature.properties.displayName}</strong></p>`)
		})

	})

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
