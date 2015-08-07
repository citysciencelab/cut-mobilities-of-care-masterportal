// run this in the console of http://geoportal.metropolregion.hamburg.de/mrhportal/index.html
// to write services-mrh.json to console

var mrhServicesGenerator = {

layers: [],
preServicesJson: [],

run: function () {
	// iterate global treeConfig
	for (var i = 0; i < treeConfig.length; i++) {
		var treeConfigRecord = treeConfig[i],
			layerStore = treeConfigRecord.layerStore,
			isBaseLayerStore = (treeConfigRecord.nodeType === "gx_baselayercontainer"),
			category;

		category = treeConfigRecord.text;

		// console.log(treeConfigRecord);
		if (layerStore)	{
			// console.log("  no children");
			this.addLayers(layerStore, isBaseLayerStore, category);
		}
		else {
			for (var k = 0; k < treeConfigRecord.children.length; k++) {

				var childLayerStore = treeConfigRecord.children[k].layerStore,
					layer = treeConfigRecord.children[k].layer,
					md = {};

				md.name = treeConfigRecord.children[k].text;
				md.id = md.name + k;

				if (childLayerStore) {
					// console.log("  " + md.name);
					this.addLayers(childLayerStore, isBaseLayerStore, category, md);

				}
				else if (layer) {
					this.addLayer(layer, category, md);
				}
			}
		}
	}

	this.writeServicesJson();
	return "copy json from console.";
},

translateGfiProps: function (layer) {
	var gfiAttributes = {},
		gfiProps = layer.gfiProps,
		gfiStatic = layer.gfiStatic;

	if (gfiProps) {
		for (var i = 0; i < gfiProps.length; i++) {
			var key = gfiProps[i][0];
			gfiAttributes[key] = gfiProps[i][1];
		}
		return gfiAttributes;
	}
	else if (gfiStatic && gfiStatic.showAll) {
		return "showAll";
	}
	else {
		return "ignore";
	}
},

// adds a single layer to this.layers
addLayer: function (layer, category, md) {
	// console.log("    " +  layer.name);
	this.layers.push({
		layer: layer,
		category: category,
		md: md
	});
},

// read layers from layer store and call addLayers
addLayers: function (layerStore, isBaseLayerStore, category, md) {

	// iterate layerStore
	layerStore.each(function (rec) {
			if (isBaseLayerStore) {
				if(rec.data.layer.isBaseLayer) {
					this.addLayer(rec.data.layer, category, md);
				}
			}
			else {
				this.addLayer(rec.data.layer, category, md);
			}
	}, this);

	return true;
},

// write servicesJson array
writeServicesJson: function () {
	var servicesJson = [];

	for (var i = 0; i < this.layers.length; i++) {
		var layer = this.layers[i].layer,
			category = this.layers[i].category,
			md = this.layers[i].md;

		servicesJson.push({
			"id" : i.toString(),
		    "name" : layer.name,
		    "url" : layer.url,
		    "typ" : "WMS",
		    "layers" : layer.params.LAYERS,
		    "format" : layer.params.FORMAT,
		    "version" : layer.params.VERSION,
		    "singleTile" : layer.singleTile || false,
		    "transparent" : layer.params.TRANSPARENT ||false,
		    "tilesize" : layer.tileSize.h,
		    "gutter" : layer.options.gutter || 0,
		    "minScale" : layer.minScale,
		    "maxScale" : layer.maxScale,
		    "isbaselayer" : layer.isBaseLayer,
		    "gfiAttributes" : this.translateGfiProps(layer),
		    "layerAttribution" : layer.attribution || "nicht vorhanden",
		    "cache" : false,
		    "datasets" : [
		       {
		          "md_id" : md ? md.id : i.toString(),
		          "md_name" : md ? md.name : layer.name,
		          "bbox" : "nicht vorhanden",
		          "kategorie_opendata" : [category],
		          "kategorie_inspire": "Kein INSPIRE-Thema"
		       }
		    ]
		});
	}

	console.log(JSON.stringify(servicesJson));
}

};

mrhServicesGenerator.run();
