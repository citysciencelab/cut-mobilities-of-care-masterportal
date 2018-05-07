define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        WPS;

     WPS = Backbone.Model.extend({
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
         * @param wpsID String The service id, defined in rest-services.json
         * @param requestId  String unique Identifier for this request
         * @param identifier String The functionality to be invoked by the wps
         * @param data Object Contains the Attributes to be sent
         */
        request: function (wpsID, requestID, identifier, data) {
            var xmlString = this.buildXML(identifier, data, this.get("xmlTemplate"), this.get("dataInputXmlTemplate")),
                url = this.buildUrl(identifier, Radio.request("RestReader", "getServiceById", wpsID));

            this.sendRequest(url, xmlString, requestID);
        },
        /**
         * @desc sends POST request to wps
         * @param url String url
         * @param xmlString String XML to be sent as String
         * @param requestId  String unique Identifier for this request
         */
        sendRequest: function (url, xmlString, requestID) {
            var xhr = new XMLHttpRequest(),
                context = this;
                xhr.open("POST", url);
                xhr.timeout = 10000;
            xhr.onload = function (event) {
                context.handleResponse(event.currentTarget.responseText, requestID, xhr.status);
            };
            xhr.ontimeout = function () {
                context.handleResponse({}, requestID, "timeout");
            };
            xhr.onabort = function () {
                context.handleResponse({}, requestID, "abort");
            };
            xhr.send(xmlString);
        },
        /**
         * @desc handles wps response
         * @param responseText String XML to be sent as String
         * @param requestId  String unique Identifier for this request
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
         * Parse xml from string
         * @param dataString [string] the xml to be parsed as String
         */
        parseDataString: function (dataString) {
            var xml = $.parseXML(dataString),
                data = $(xml).find("wps\\:Data"),
                obj = this.buildObj(data, {});

                return obj;
        },
        /**
         * @desc Recursively parse xml and collect leaf elements
         * @param xml the xml to be parsed
         * @param obj [object] the Object containing the leaf elements
         */
        buildObj: function (xml, obj) {
            var that = this,
                children = $(xml).children();

            if (_.isUndefined(xml) === false && _.isUndefined(children) === false && children.length === 0) {
                obj[$(xml)[0].nodeName.toLowerCase()] = xml.textContent;
            }
            children.each(function (index, val) {
                that.buildObj(val, obj);
            });
            return obj;
        },
        /**
         * @desc build xml for WPS request
         * @param identifier String The functionality to be invoked by the wps
         * @param data Object Contains the Attributes to be sent
         * @param xmlTemplate String  XML frame template that is filled
         * @param dataInputXmlTemplate String Inner XML used to generate attributes
         */
        buildXML: function (identifier, data, xmlTemplate, dataInputXmlTemplate) {
            var dataString = this.setXMLElement(xmlTemplate, "</ows:Identifier>", identifier);

            _.each(data, function (val, key) {
                var attributeString = "",
                    val = JSON.stringify(val);

                attributeString = this.setXMLElement(dataInputXmlTemplate, "</ows:Identifier>", key);
                attributeString = this.setXMLElement(attributeString, "</wps:LiteralData>", val);
                dataString = this.setXMLElement(dataString, "</wps:DataInputs>", attributeString);
            }, this);

            return dataString;
        },
        /**
         * @desc insert Value into tag
         * @param closingTagName String the closing tag of the attribute to be set
         * @param value Object the Value to be set, JSON.Stringify is used to obtain string
         */
        setXMLElement: function (dataString, closingTagName, value) {
            var newDataString = "";

            if (_.isUndefined(dataString) === false && _.isUndefined(closingTagName) === false && _.isUndefined(value) === false) {
                newDataString = dataString.toString().replace(closingTagName.toString(), value.toString() + closingTagName.toString());
            }
            return newDataString;
        },
        /**
         * @desc creates URL using model from rest-service
         * @param identifier String The functionality to be invoked by the wps
         * @param restModel Object Model retrieved from rest-services.json
         */
        buildUrl: function (identifier, restModel) {
            var url = "",
                version = (_.isUndefined(restModel) === false && _.isUndefined(restModel.get("version")) === false) ? restModel.get("version") : "1.1.0";

            if (identifier && restModel && restModel.get("url")) {
                url = restModel.get("url") + "?service=WPS&version=" + version + "&request=execute&identifier=" + identifier;
            }
            return url;
        }
    });

    return WPS;
});
