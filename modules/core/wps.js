const WPS = Backbone.Model.extend({
    defaults: {
        xmlTemplate: "<wps:Execute xmlns:wps=\"http://www.opengis.net/wps/1.0.0\"" +
                    " xmlns:xlink=\"http://www.w3.org/1999/xlink\"" +
                    " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" +
                    " xmlns:ows=\"http://www.opengis.net/ows/1.1\"" +
                    " service=\"WPS\"" +
                    " version=\"1.0.0\"" +
                    " xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">" +
                    "<ows:Identifier></ows:Identifier>" +
                    "<wps:DataInputs></wps:DataInputs>" +
                    "</wps:Execute>",
        dataInputXmlTemplate: "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>"
    },
    initialize: function () {
        var channel = Radio.channel("WPS");

        this.listenTo(channel, {
            "request": this.request
        }, this);
    },

    /**
     * @desc request to be built and sent to WPS
     * @param {string} wpsID The service id, defined in rest-services.json
     * @param {string} requestID unique Identifier for this request
     * @param {string} identifier The functionality to be invoked by the wps
     * @param {object} data Contains the Attributes to be sent
     * @returns {void}
     */
    request: function (wpsID, requestID, identifier, data) {
        var xmlString = this.buildXML(identifier, data, this.get("xmlTemplate"), this.get("dataInputXmlTemplate")),
            url = this.buildUrl(identifier, Radio.request("RestReader", "getServiceById", wpsID));

        this.sendRequest(url, xmlString, requestID);
    },
    /**
     * @desc sends POST request to wps
     * @param {string} url url
     * @param {string} xmlString XML to be sent as String
     * @param {string} requestID unique Identifier for this request
     * @returns {void}
     */
    sendRequest: function (url, xmlString, requestID) {
        var xhr = new XMLHttpRequest(),
            that = this;

        xhr.open("POST", url);
        xhr.timeout = 10000;

        xhr.onload = function (event) {
            that.handleResponse(event.currentTarget.responseText, requestID, xhr.status);
        };
        xhr.ontimeout = function () {
            that.handleResponse({}, requestID, "timeout");
        };
        xhr.onabort = function () {
            that.handleResponse({}, requestID, "abort");
        };
        xhr.send(xmlString);
    },
    /**
     * @desc handles wps response
     * @param {string} responseText XML to be sent as String
     * @param {string} requestID unique Identifier for this request
     * @param {integer} status status of xhr-request
     * @returns {void}
     */
    handleResponse: function (responseText, requestID, status) {
        var obj;

        if (status === 200) {
            obj = this.parseDataString(responseText);
        }
        else {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status);
        }
        Radio.trigger("WPS", "response", requestID, obj, status);
    },
    /**
     * Parse xml from string and turn xml into object
     * @param {string} dataString the xml to be parsed as String
     * @returns {object} xml parsed as object
     */
    parseDataString: function (dataString) {
        var xml = $.parseXML(dataString),
            obj = this.parseXmlToObject(xml);

        return obj;
    },
    /**
     * @desc parses an xml document to js
     * @param  {xml} xml the response xml from the WPS
     * @returns {object} parsed xml as js object
     */
    parseXmlToObject: function (xml) {
        var obj = {},
            children = $(xml).children();

        // if  element does not have any children --> leaf
        if (children.length === 0) {
            obj = _.isUndefined($(xml)[0]) ? undefined : $(xml)[0].textContent;
        }
        else {
            _.each(children, function (child) {
                var localName = $(child)[0].localName,
                    old;

                // if object does not have key create it
                if (!_.has(obj, localName)) {
                    obj[localName] = this.parseXmlToObject(child);
                }
                // key already exists.
                else {
                    // if value is not an array, create array, push old value and then push new value
                    if (!_.isArray(obj[localName])) {
                        old = obj[localName];
                        obj[localName] = [];
                        obj[localName].push(old);
                    }
                    obj[localName].push(this.parseXmlToObject(child));
                }
            }, this);
        }
        return obj;
    },
    /**
     * @desc build xml for WPS request
     * @param {string} identifier String The functionality to be invoked by the wps
     * @param {obj} data Object Contains the Attributes to be sent
     * @param {string} xmlTemplate String  XML frame template that is filled
     * @param {string} dataInputXmlTemplate String Inner XML used to generate attributes
     * @return {string} dataString
     */
    buildXML: function (identifier, data, xmlTemplate, dataInputXmlTemplate) {
        var dataString = this.setXMLElement(xmlTemplate, "</ows:Identifier>", identifier);

        _.each(data, function (obj, key) {
            var attributeString = "",
                dataType = _.has(obj, "dataType") ? obj.dataType : undefined,
                value = _.has(obj, "value") ? obj.value : obj;

            attributeString = this.setXMLElement(dataInputXmlTemplate, "</ows:Identifier>", key);
            attributeString = this.setXMLElement(attributeString, "</wps:LiteralData>", value, dataType);
            dataString = this.setXMLElement(dataString, "</wps:DataInputs>", attributeString);
        }, this);
        return dataString;
    },
    /**
     * @desc insert Value into tag
     * @param {string} dataString dataString which gets enriched with data
     * @param {string} closingTagName the closing tag of the attribute to be set
     * @param {string} value Object the Value to be set, toString() is used to obtain string
     * @param {string} dataType datatype which is uses for tag attribute
     * @returns {string} newdataString with added dada
     */
    setXMLElement: function (dataString, closingTagName, value, dataType) {
        var newDataString = _.isUndefined(dataString) ? "" : dataString;

        if (!_.isUndefined(dataType)) {
            newDataString = newDataString.toString().replace("<wps:LiteralData>", "<wps:LiteralData dataType='" + dataType + "'>");
        }

        if (_.isUndefined(dataString) === false && _.isUndefined(closingTagName) === false && _.isUndefined(value) === false) {
            newDataString = newDataString.toString().replace(closingTagName.toString(), value.toString() + closingTagName.toString());
        }
        return newDataString;
    },
    /**
     * @desc creates URL using model from rest-service
     * @param {string} identifier The functionality to be invoked by the wps
     * @param {object} restModel Model retrieved from rest-services.json
     * @returns {string} url to wps request
     */
    buildUrl: function (identifier, restModel) {
        var url = "",
            version = _.isUndefined(restModel) === false && _.isUndefined(restModel.get("version")) === false ? restModel.get("version") : "1.1.0";

        if (identifier && restModel && restModel.get("url")) {
            url = restModel.get("url") + "?service=WPS&version=" + version + "&request=execute&identifier=" + identifier;
        }
        return url;
    }
});

export default WPS;
