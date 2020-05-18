const xmlserializer = require("xmlserializer");

/**
 * XMLSerializer return boolean
 * @return {boolean} true
 * @constructor
 */
function XMLSerializer () {
    return true;
}

XMLSerializer.prototype.serializeToString = function (node) {
    return xmlserializer.serializeToString(node);
};

module.exports = XMLSerializer;
