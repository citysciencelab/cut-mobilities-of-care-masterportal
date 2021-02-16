import {parse} from "ol/xml";
import axios from "axios";

export default {
    /**
     * @desc sends POST request to wps
     * @param {string} url url
     * @param {string} xmlString XML to be sent as String
     * @param {function} responseFunction function to be called
     * @param {number} timeout if set used as timeout in milliseconds, else timeout of 10.000 msecs is used
     * @returns {void}
     */
    sendRequest: function (url, xmlString, responseFunction, timeout) {
        axios({
            method: "post",
            url: url,
            data: xmlString,
            headers: {"Content-Type": "text/xml"},
            timeout: timeout
        }).then(response => {
            return this.handleResponse(response, responseFunction);
        });
    },
    /**
     * @desc handles wps response
     * @param {string} response XML to be sent as String
     * @param {function} responseFunction function to be called
     * @returns {void}
     */
    handleResponse: function (response, responseFunction) {
        let obj;

        if (response.status === 200) {
            obj = this.parseDataString(response.data);
        }
        responseFunction(obj, response.status);
    },
    /**
     * Parse xml from string and turn xml into object
     * @param {string} dataString the xml to be parsed as String
     * @returns {object} xml parsed as object
     */
    parseDataString: function (dataString) {
        const xml = parse(dataString),
            obj = this.parseXmlToObject(xml);

        return obj;
    },
    /**
     * @desc parses an xml document to js
     * @param  {xml} xml the response xml from the WPS
     * @returns {object} parsed xml as js object
     */
    parseXmlToObject: function (xml) {
        let children = xml?.children,
            obj = {};

        if (children && typeof children.forEach !== "function") {
            children = xml?.documentElement?.childNodes;
        }
        if (children?.length === 0 || !children) {
            obj = xml?.textContent ? xml?.textContent : xml?.innerHTML;
        }
        else if (children) {
            children.forEach(child => {
                const localName = child?.localName || child.innerHTML;
                let old;

                if (!obj.hasOwnProperty(localName) && localName !== undefined) {
                    obj[localName] = this.parseXmlToObject(child);
                }
                else {
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
    wpsRequest: function (wpsID, identifier, data, responseFunction, timeout) {
        const xmlTemplate = "<wps:Execute xmlns:wps=\"http://www.opengis.net/wps/1.0.0\"" +
            " xmlns:xlink=\"http://www.w3.org/1999/xlink\"" +
            " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" +
            " xmlns:ows=\"http://www.opengis.net/ows/1.1\"" +
            " service=\"WPS\"" +
            " version=\"1.0.0\"" +
            " xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">" +
            "<ows:Identifier></ows:Identifier>" +
            "<wps:DataInputs></wps:DataInputs>" +
            "</wps:Execute>",
            dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>",
            xmlString = this.buildXML(identifier, data, xmlTemplate, dataInputXmlTemplate),
            url = this.buildUrl(Radio.request("RestReader", "getServiceById", wpsID));

        this.sendRequest(url, xmlString, responseFunction, timeout);
    }
};
