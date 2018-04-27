define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        WPS;

     WPS = Backbone.Model.extend({
        defaults: {
            xmlTemplate: "<wps:Execute xmlns:wps=\"http://www.opengis.net/wps/1.0.0\""
                        + "xmlns:xlink=\"http://www.w3.org/1999/xlink\""
                        + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\""
                        + "xmlns:ows=\"http://www.opengis.net/ows/1.1\""
                        + "service=\"WPS\""
                        + "version=\"1.0.0\""
                        + "xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">"
                        + "<ows:Identifier></ows:Identifier>"
                        + "<wps:DataInputs>"
                        + "</wps:DataInput>"
                        + "</wps:Execute>",
            dataInputXmlTemplate: "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>"
        },
        initialize: function () {
            var channel = Radio.channel("WPS");
            this.request(
                "1001",
                123,
                "einwohner_ermitteln.fmw",
                {
                    "such_flaeche": {}
                }
            );
            this.listenTo(channel, {
                "request": this.request
            }, this);
        },
        request: function (wpsID, requestID, identifier, data) {
            var xml = this.buildXML(identifier, data, this.get("xmlTemplate"), this.get("dataInputXmlTemplate")),
                url = this.buildUrl(identifier, Radio.request("RestReader", "getServiceById", wpsID));
        },
        buildXML: function (identifier, data, xmlTemplate, dataInputXmlTemplate) {
            var xmlObj = $(xmlTemplate)[0],
                xmlInput = $(dataInputXmlTemplate)[0];
                this.setXMLElement(xmlObj, "ows:Identifier", identifier);
                debugger;
            _.each(data, function (val, key) {
                var newXmlInput = $(xmlInput).clone();
                this.setXMLElement(newXmlInput, "ows:Identifier", key);
                this.setXMLElement(newXmlInput, "wps:LiteralData", val);
                console.log(newXmlInput);
                console.log(xmlInput);

            }, this);

        },
        setXMLElement: function (xmlObj, tagName, value) {
            process = xmlObj.getElementsByTagName(tagName)[0];
            $(process).html(value);
        },
        buildUrl: function (identifier, restModel) {
            var url = "";
            if (identifier && restModel && restModel.get("url") && restModel.get("version")) {
                url = restModel.get("url") + "?service=WPS&version=" + restModel.get("version") + "&request=execute&identifier=" + identifier;
            }
            return url;
        }
    });

    return WPS;
});
