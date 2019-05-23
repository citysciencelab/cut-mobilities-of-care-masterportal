var xmlserializer = require("xmlserializer"),
    XMLSerializer = function XMLSerializer() {};

XMLSerializer.prototype.serializeToString = function(node) {
    return xmlserializer.serializeToString(node);
};

module.exports = XMLSerializer;
