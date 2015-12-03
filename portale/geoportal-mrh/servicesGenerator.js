// run this in the console of http://geoportal.metropolregion.hamburg.de/mrhportal/index.html
// to write services-mrh.json to console

var servicesGenerator = {

layers: [],
mrhTreeConfig: {},
lgvTreeConfig: [],

run: function () {

    // iterate global treeConfig
    for (var i = 0; i < treeConfig.length; i++) {
		var treeConfigRecord = treeConfig[i],
			layerStore = treeConfigRecord.layerStore,
			isBaseLayerStore = (treeConfigRecord.nodeType === "gx_baselayercontainer"),
			parentFolder = treeConfigRecord.text,
			firstLevel = {};

		// console.log(parentFolder);
        if (!isBaseLayerStore) {
            firstLevel = {node: parentFolder, childnodes: [], layerIDs: []};
        }
        else {
            firstLevel = {layerIDs: []};
        }


		// no childFolders
        if (layerStore)	{
			firstLevel = this.addLayers(layerStore, isBaseLayerStore, firstLevel);
		}
		// has childFolders
		else {
			for (var k = 0; k < treeConfigRecord.children.length; k++) {

				var childLayerStore = treeConfigRecord.children[k].layerStore,
					layer = treeConfigRecord.children[k].layer,
					childFolder = treeConfigRecord.children[k].text,
                    secondLevel = {};

				if (childLayerStore) {
					secondLevel = {node: childFolder, layerIDs: []};
					secondLevel = this.addLayers(childLayerStore, isBaseLayerStore, secondLevel);
				}
				// Freizeit & Tourismus
				else if (layer) {
					layer.id = this.getId(layer.id);
                    this.layers.push(layer);
                    firstLevel.layerIDs.push({id: layer.id, visible:false});
				}
                // Freizeit Cuxhaven
                else {
                    var cuxhavenConfig = treeConfigRecord.children[k];

                    for (var j = 0; j < cuxhavenConfig.children.length; j++) {
                        var childFolder = cuxhavenConfig.children[j].text,
                            childLayerStore = cuxhavenConfig.children[j].layerStore;

                        secondLevel = {node: "Cuxhaven: " + childFolder, layerIDs: []};
                        secondLevel = this.addLayers(childLayerStore, false, secondLevel);

                        firstLevel.childnodes.push(secondLevel);
                    }
                }

                // check for empty secondLevel object - happens with Freizeit & Tourismus
				if (Object.keys(secondLevel).length !== 0) {
					firstLevel.childnodes.push(secondLevel);
				}
			}
		}

        this.lgvTreeConfig.push(firstLevel);

	}

    this.writeLgvTreeConfig();
    console.log("###");
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

getId: function (str) {
	var index = str.lastIndexOf("_") + 1;

	return str.substring(index);
},

// read layers from layer store and adds to this.layers
addLayers: function (layerStore, isBaseLayerStore, level) {
    var id;

    layerStore.each(function (rec, index) {
        id = rec.data.layer.id = this.getId(rec.data.layer.id);
		if (isBaseLayerStore) {
            if (rec.data.layer.isBaseLayer) {
                this.layers.push(rec.data.layer);
				level.layerIDs.push({id: id, visible: (rec.data.layer.name === "WebatlasDE")});
			}
		}
		else {
			this.layers.push(rec.data.layer);
            level.layerIDs.push({id: id, visible: false});
		}
	}, this);

	return level;
},

// write servicesJson array from this.layers
writeServicesJson: function () {
	var servicesJson = [];
    // console.log(this.layers);
	for (var i = 0; i < this.layers.length; i++) {

		var layer = this.layers[i];

        servicesJson.push({
            "id": layer.id,
            "name": layer.name,
            "url": layer.url,
            "typ": "WMS",
            "layers": layer.params.LAYERS,
            "format": layer.params.FORMAT,
            "version": layer.params.VERSION,
            "singleTile": layer.singleTile || false,
            "transparent": layer.params.TRANSPARENT || false,
            "tilesize": layer.tileSize.h,
            "gutter": layer.options.gutter || 0,
            "minScale": 0,
            "maxScale": 1000000,
            "gfiAttributes": this.translateGfiProps(layer),
            "layerAttribution": layer.attribution || "nicht vorhanden",
            "legendURL": layer.legendURL || "",
            "cache": false,
            "datasets": []
		});

	}
	console.log(JSON.stringify(servicesJson));
},

writeLgvTreeConfig: function () {
	console.log(JSON.stringify(this.lgvTreeConfig));
}

};

servicesGenerator.run();
