class BatchTable {
    constructor (properties) {
        this.properties = properties;
        this.color = new Cesium.Color();
        this.show = true;
    }

    getPropertyNames () {
        return Object.keys(this.properties);
    }

    getProperty (id, prop) {
        return this.properties[prop];
    }

    getShow () {
        return this.show;
    }

    setShow (id, show) {
        this.show = show;
    }
}

class Cesium3DTileContent {
    constructor (feature) {
        this.feature = feature;
        this.featuresLength = 1;
    }

    getFeature () {
        return this.feature;
    }
}

/**
 * @param {Object} properties -
 * @param {Object=} tileset -
 * @return {Cesium.Cesium3DTileFeature} -
 */
export function createDummyCesium3DTileFeature (properties = {}, tileset) {
    const dummy = new Cesium.Cesium3DTileFeature(),
        content = {batchTable: new BatchTable(properties)};

    if (tileset) {
        content.tileset = tileset;
    }

    // eslint-disable-next-line no-underscore-dangle
    dummy._content = content;
    return dummy;
}

/**
 * @param {Object} properties -
 * @param {Object=} tileset -
 * @return {Cesium.Cesium3DTileFeature} -
 */
export function createDummyCesium3DTileContent (properties = {}, tileset) {
    const feature = createDummyCesium3DTileFeature(properties, tileset),
        content = new Cesium3DTileContent(feature);

    return content;
}
