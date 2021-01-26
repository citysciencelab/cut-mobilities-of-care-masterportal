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
        const channel = Radio.channel("WPS");

        this.listenTo(channel, {
            "request": this.request
        }, this);
    },

    /**
     * @desc request to be built and sent to WPS
     * @param {string} wpsID The service id, defined in rest-services.json
     * @param {string} identifier The functionality to be invoked by the wps
     * @param {object} data Contains the Attributes to be sent
     * @param {function} responseFunction function to be called
     * @param {number} timeout if set used as timeout in milliseconds, else timeout of 10.000 msecs is used
     * @returns {void}
     */
    request: function (wpsID, identifier, data, responseFunction, timeout) {
        const xmlString = this.buildXML(identifier, data, this.get("xmlTemplate"), this.get("dataInputXmlTemplate")),
            url = this.buildUrl(Radio.request("RestReader", "getServiceById", wpsID));

        this.sendRequest(url, xmlString, responseFunction, timeout);
    },

    /**
     * @desc sends POST request to wps
     * @param {string} url url
     * @param {string} xmlString XML to be sent as String
     * @param {function} responseFunction function to be called
     * @param {number} timeout if set used as timeout in milliseconds, else timeout of 10.000 msecs is used
     * @returns {void}
     */
    sendRequest: function (url, xmlString, responseFunction, timeout) {
        const xhr = new XMLHttpRequest(),
            that = this;

        xhr.open("POST", url);
        xhr.timeout = timeout && typeof timeout === "number" ? timeout : 10000;

        xhr.onload = function (event) {
            that.handleResponse(event.currentTarget.responseText, xhr.status, responseFunction);
        };
        xhr.ontimeout = function () {
            that.handleResponse({}, "timeout", responseFunction);
        };
        xhr.onabort = function () {
            that.handleResponse({}, "abort", responseFunction);
        };
        xhr.send(xmlString);
    },

    /**
     * @desc handles wps response
     * @param {string} responseText XML to be sent as String
     * @param {integer} status status of xhr-request
     * @param {function} responseFunction function to be called
     * @returns {void}
     */
    handleResponse: function (responseText, status, responseFunction) {
        let obj;

        if (status === 200) {
            obj = this.parseDataString(responseText);
        }
        else {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status + ")");
        }
        responseFunction(obj, status);
    },
    /**
     * Parse xml from string and turn xml into object
     * @param {string} dataString the xml to be parsed as String
     * @returns {object} xml parsed as object
     */
    parseDataString: function (dataString) {
        const xml = $.parseXML(dataString),
            obj = this.parseXmlToObject(xml);

        return obj;
    },
    /**
     * @desc parses an xml document to js
     * @param  {xml} xml the response xml from the WPS
     * @returns {object} parsed xml as js object
     */
    parseXmlToObject: function (xml) {
        const children = $(xml).children();
        let obj = {};

        // if  element does not have any children --> leaf
        if (children.length === 0) {
            obj = $(xml)[0] === undefined ? undefined : $(xml)[0].textContent;
        }
        else {
            children.toArray().forEach(child => {
                const localName = $(child)[0].localName;
                let old;

                // if object does not have key create it
                if (!obj.hasOwnProperty(localName)) {
                    obj[localName] = this.parseXmlToObject(child);
                }
                // key already exists.
                else {
                    // if value is not an array, create array, push old value and then push new value
                    if (!Array.isArray(obj[localName])) {
                        old = obj[localName];
                        obj[localName] = [];
                        obj[localName].push(old);
                    }
                    obj[localName].push(this.parseXmlToObject(child));
                }
            });
        }
        return obj;
    },
    /**
     * @desc build xml for WPS request
     * @param {string} identifier String The functionality to be invoked by the wps
     * @param {obj} [data={}] Object Contains the Attributes to be sent
     * @param {string} xmlTemplate String  XML frame template that is filled
     * @param {string} dataInputXmlTemplate String Inner XML used to generate attributes
     * @return {string} dataString
     */
    buildXML: function (identifier, data = {}, xmlTemplate, dataInputXmlTemplate) {
        let dataString = this.setXMLElement(xmlTemplate, "</ows:Identifier>", identifier);

        Object.entries(data).forEach(dat => {
            const obj = dat[1],
                key = dat[0],
                dataType = obj.hasOwnProperty("dataType") ? obj.dataType : undefined,
                value = obj.hasOwnProperty("value") ? obj.value : obj;
            let attributeString = "";

            attributeString = this.setXMLElement(dataInputXmlTemplate, "</ows:Identifier>", key);
            attributeString = this.setXMLElement(attributeString, "</wps:LiteralData>", value, dataType);
            dataString = this.setXMLElement(dataString, "</wps:DataInputs>", attributeString);
        });
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
        let newDataString = dataString === undefined ? "" : dataString;

        if (dataType !== undefined) {
            newDataString = newDataString.toString().replace("<wps:LiteralData>", "<wps:LiteralData dataType='" + dataType + "'>");
        }

        if (dataString !== undefined && closingTagName !== undefined && value !== undefined) {
            newDataString = newDataString.toString().replace(closingTagName.toString(), value.toString() + closingTagName.toString());
        }
        return newDataString;
    },

    /**
     * @desc creates URL using model from rest-service
     * @param {object} restModel Model retrieved from rest-services.json
     * @returns {string} url to wps request
     */
    buildUrl: function (restModel) {
        let url = "";

        if (restModel && restModel.get("url")) {
            url = restModel.get("url");
        }
        return url;
    }
});

export default WPS;
