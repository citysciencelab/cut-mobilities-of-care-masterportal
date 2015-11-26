// run this in the console of http://geoportal.metropolregion.hamburg.de/mrhportal/index.html
// to write services-mrh.json to console

var servicesGenerator = {

layers: [],
mrhTreeConfig: {},
lgvTreeConfig: [],
lgvTreeConfigRecord: {},

run: function () {

    // iterate global treeConfig
    for (var i = 0; i < treeConfig.length; i++) {
		var treeConfigRecord = treeConfig[i],
			layerStore = treeConfigRecord.layerStore,
			isBaseLayerStore = (treeConfigRecord.nodeType === "gx_baselayercontainer"),
			parentFolder = treeConfigRecord.text;

		this.lgvTreeConfigRecord = {node: parentFolder, childnodes: []};

        if (layerStore)	{
			// console.log("  no children");
			this.addLayers(layerStore, isBaseLayerStore, parentFolder);
		}
		else {
			for (var k = 0; k < treeConfigRecord.children.length; k++) {

				var childLayerStore = treeConfigRecord.children[k].layerStore,
					layer = treeConfigRecord.children[k].layer,
					childFolder = {};

				childFolder.name = treeConfigRecord.children[k].text;
				childFolder.id = childFolder.name + k;

				if (childLayerStore) {
					// console.log("  " + md.name);
					this.addLayers(childLayerStore, isBaseLayerStore, parentFolder, childFolder);

				}
				else if (layer) {
					this.addLayer(layer, parentFolder, childFolder);
				}
			}
		}

        this.lgvTreeConfig.push(this.lgvTreeConfigRecord);

	}

    console.log(this.lgvTreeConfig);

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
addLayer: function (layer, parentFolder, childFolder) {

    this.layers.push({
		layer: layer,
		parentFolder: parentFolder,
		childFolder: childFolder
	});
},

// read layers from layer store and call addLayer
addLayers: function (layerStore, isBaseLayerStore, parentFolder, childFolder) {

    // build second Level folders
    if (childFolder){
        this.lgvTreeConfigRecord.childnodes.push({node: childFolder.name, layerIDs: []});
    }

    // console.log(parentFolder)
    if (childFolder) {
        console.log("   " + childFolder.name);
    }

	layerStore.each(function (rec, index) {
       // console.log(index);
        	if (isBaseLayerStore) {
				if (rec.data.layer.isBaseLayer) {
					this.addLayer(rec.data.layer, parentFolder, childFolder);
				}
			}
			else {
				this.addLayer(rec.data.layer, parentFolder, childFolder);
                if (parentFolder !== "Hintergrundkarten"){
                    if (childFolder){
         //               console.log(this.lgvTreeConfigRecord);
                        //this.lgvTreeConfigRecord.childnodes[index].layerIDs.push(rec.data.layer.id);
                    }
            }
			}
	}, this);

	return true;
},

// write servicesJson array from previously built this.layers
writeServicesJson: function () {
	var servicesJson = [];
    //console.log(this.layers);
	for (var i = 0; i < this.layers.length; i++) {

		var layer = this.layers[i].layer,
			parentFolder = this.layers[i].parentFolder,
			childFolder = this.layers[i].childFolder,
            secondLevel = childFolder ? childFolder.name : "layer" ;

        servicesJson.push({
            "id": i.toString(),
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
            "isbaselayer": layer.isBaseLayer,
            "gfiAttributes": this.translateGfiProps(layer),
            "layerAttribution": layer.attribution || "nicht vorhanden",
            "cache": false,
            "datasets": [
               /*{
                    "md_id": childFolder ? childFolder.id : i.toString(),
                    "md_name": childFolder ? childFolder.name : layer.name,
                    "bbox": "nicht vorhanden",
                    "kategorie_opendata": [parentFolder],
                    "kategorie_inspire": "Kein INSPIRE-Thema"
                }*/
            ]
		});

	}
	// console.log(JSON.stringify(servicesJson));
}

};

servicesGenerator.run();
