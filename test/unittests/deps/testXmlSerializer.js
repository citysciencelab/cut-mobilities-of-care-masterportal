var xmlserializer = require("xmlserializer"),
    XMLSerializer;

XMLSerializer = function () {
    return true;
};

XMLSerializer.prototype.serializeToString = function (node) {
    return xmlserializer.serializeToString(node);
};

module.exports = XMLSerializer;
