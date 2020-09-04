import * as moment from "moment";

const CswParserModel = Backbone.Model.extend(/** @lends CswParserModel.prototype */{
    defaults: {
        cswId: "3"
    },
    url: function () {
        const cswService = Radio.request("RestReader", "getServiceById", this.get("cswId"));
        let url;

        if (typeof cswService !== "undefined") {
            url = Radio.request("Util", "getProxyURL", cswService.get("url"));
        }
        return url;
    },
    /**
     * @class CswParserModel
     * @extends Backbone.Model
     * @memberof CswParser
     * @constructs
     * @property {String} cswId="" Id of csw service, corresponding to rest-services.json
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires CswParser#RadioTriggerCswParserFetchedMetaData
     * @listens CswParser#RadioTriggerCswParserGetMetaData
     */
    initialize: function () {
        const channel = Radio.channel("CswParser");

        channel.on({
            "getMetaData": this.getMetaData
        }, this);
    },
    /**
     * Requests the meta data from the corresponding service.
     * @param {Object} cswObj Object of CSW request information.
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    getMetaData: function (cswObj) {
        $.ajax({
            url: this.url(),
            data: {id: cswObj.metaId},
            dataType: "xml",
            async: false,
            context: this,
            error: function () {
                this.parseData({}, cswObj);
            },
            success: function (xmlDoc) {
                this.parseData(xmlDoc, cswObj);
            }
        });
    },
    /**
     * Parses the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @param {Object} cswObj Object of CSW request information.
     * @fires CswParser#RadioTriggerCswParserFetchedMetaData
     * @returns {void}
     */
    parseData: function (xmlDoc, cswObj) {
        const parsedData = {};

        cswObj.keyList.forEach(key => {
            switch (key) {
                case "date": {
                    parsedData[key] = this.parseDate(xmlDoc);
                    break;
                }
                case "datePublication": {
                    parsedData[key] = this.parseDate(xmlDoc, "publication", "creation");
                    break;
                }
                case "dateRevision": {
                    parsedData[key] = this.parseDate(xmlDoc, "revision");
                    break;
                }
                case "periodicity": {
                    parsedData[key] = this.parsePeriodicity(xmlDoc);
                    break;
                }
                case "orgaOwner": {
                    parsedData[key] = this.parseOrgaOwner(xmlDoc);
                    break;
                }
                case "email": {
                    parsedData[key] = this.parseEmail(xmlDoc);
                    break;
                }
                case "tel": {
                    parsedData[key] = this.parseTel(xmlDoc);
                    break;
                }
                case "address": {
                    parsedData[key] = this.parseAddress(xmlDoc);
                    break;
                }
                case "url": {
                    parsedData[key] = this.parseUrl(xmlDoc);
                    break;
                }
                case "abstractText": {
                    parsedData[key] = this.parseAbstractText(xmlDoc);
                    break;
                }
                case "title": {
                    parsedData[key] = this.parseTitle(xmlDoc, cswObj);
                    break;
                }
                case "downloadLinks": {
                    parsedData[key] = this.parseDownloadLinks(xmlDoc);
                    break;
                }
                default: {
                    break;
                }
            }
        });
        cswObj.parsedData = parsedData;
        Radio.trigger("CswParser", "fetchedMetaData", cswObj);
    },
    /**
     * Parses the download link part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {Array} downloadLinks array of download links
     */
    parseDownloadLinks: function (xmlDoc) {
        const transferOptions = $("gmd\\:MD_DigitalTransferOptions,MD_DigitalTransferOptions", xmlDoc),
            downloadLinks = [];
        let linkName,
            link,
            datetype;

        transferOptions.each(function (index, element) {
            datetype = $("gmd\\:CI_OnLineFunctionCode,CI_OnLineFunctionCode", element);
            if ($(datetype).attr("codeListValue") === "download") {
                linkName = $("gmd\\:name,name", element)[0].textContent;
                if (linkName.indexOf("Download") !== -1) {
                    linkName = linkName.replace("Download ", "");
                }
                link = $("gmd\\:URL,URL", element)[0].textContent;
                downloadLinks.push({linkName, link});
            }
        });

        return downloadLinks.length > 0 ? Radio.request("Util", "sortBy", downloadLinks, "linkName") : null;
    },

    /**
     * Parses the title part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @param {Object} cswObj Object of CSW request information.
     * @returns {String} title Title of the meta data entry
     */
    parseTitle: function (xmlDoc, cswObj) {
        const ci_Citation = $("gmd\\:CI_Citation,CI_Citation", xmlDoc)[0],
            gmdTitle = typeof ci_Citation !== "undefined" ? $("gmd\\:title,title", ci_Citation) : undefined,
            title = typeof gmdTitle !== "undefined" ? gmdTitle[0].textContent : cswObj.layerName;

        return title;
    },
    /**
     * Parses the address part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {Object} address Address of the meta data entry's owner
     */
    parseAddress: function (xmlDoc) {
        const orga = this.parseOrga(xmlDoc, "owner"),
            addressField = $("gmd\\:CI_Address,CI_Address", orga),
            streetNameField = $("gmd\\:deliveryPoint,deliveryPoint", addressField),
            streetName = typeof $(streetNameField)[0] === "undefined" ? "" : $(streetNameField)[0].textContent,
            cityField = $("gmd\\:city,city", addressField),
            city = typeof $(cityField)[0] === "undefined" ? "" : $(cityField)[0].textContent,
            postalCodeField = $("gmd\\:postalCode,postalCode", addressField),
            postalCode = typeof $(postalCodeField)[0] === "undefined" ? "" : $(postalCodeField)[0].textContent,

            address = {
                street: streetName,
                housenr: "",
                postalCode: postalCode,
                city: city
            };

        return address;
    },
    /**
     * Parses the abstract text part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} abstractText Abstract text of the meta data entry
     */
    parseAbstractText: function (xmlDoc) {
        const abstractText = $("gmd\\:abstract,abstract", xmlDoc)[0];
        let abstractTextContent;

        if (abstractText !== undefined && typeof abstractText.textContent === "string") {
            abstractTextContent = abstractText.textContent;
        }
        else {
            abstractTextContent = i18next.t("common:modules.cswParser.noMetadataMessage");
        }

        if (abstractTextContent.length > 1000) {
            return abstractTextContent.substring(0, 600) + "...";
        }

        return abstractTextContent;
    },
    /**
     * Parses the URL part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} url URL of the meta data entry's owner
     */
    parseUrl: function (xmlDoc) {
        const orga = this.parseOrga(xmlDoc, "owner"),
            urlField = $("gmd\\:CI_OnlineResource,CI_OnlineResource", orga),
            linkage = $("gmd\\:linkage,linkage", urlField),
            url = typeof $(linkage)[0] === "undefined" ? "n.N." : $(linkage)[0].textContent;

        return url;
    },
    /**
     * Parses the e-mail part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} email e-mail of the meta data entry's owner
     */
    parseEmail: function (xmlDoc) {
        const orga = this.parseOrga(xmlDoc, "owner"),
            emailField = $("gmd\\:electronicMailAddress,electronicMailAddress", orga),
            email = typeof $(emailField)[0] === "undefined" ? "n.N." : $(emailField)[0].textContent;

        return email;
    },
    /**
     * Parses the phone number part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} phone phone number of the meta data entry's owner
     */
    parseTel: function (xmlDoc) {
        const orga = this.parseOrga(xmlDoc, "owner"),
            phoneField = $("gmd\\:CI_Telephone,CI_Telephone", orga),
            phoneNr = $("gmd\\:voice,voice", phoneField),
            phone = typeof $(phoneNr)[0] === "undefined" ? "n.N." : $(phoneNr)[0].textContent;

        return phone;

    },
    /**
     * Parses the organisation name of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} orgaName name of the organisation of the meta data entry's owner
     */
    parseOrgaOwner: function (xmlDoc) {
        const orga = this.parseOrga(xmlDoc, "owner"),
            orgaField = $("gmd\\:organisationName,organisationName", orga),
            orgaName = typeof $(orgaField)[0] === "undefined" ? "n.N." : $(orgaField)[0].textContent;

        return orgaName;
    },
    /**
     * Parses the organisation part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @param {String} roleType Type of role which shall be parsed ("owner", "pointOfContact").
     * @returns {String} orga details of organisation of the meta data entry's owner
     */
    parseOrga: function (xmlDoc, roleType) {
        const identificationInfo = $("gmd\\:identificationInfo,identificationInfo", xmlDoc),
            pointOfContact = $("gmd\\:pointOfContact,pointOfContact", identificationInfo);

        let orga = "";

        $(pointOfContact).each(function (index, contact) {
            const roleObject = $("gmd\\:role,role", contact),
                children = $(roleObject).children();

            let role;

            $(children)[0].attributes.forEach(function (attribute) {
                if ($(attribute)[0].name === "codeListValue") {
                    role = $(attribute)[0].textContent;
                }
            });
            // possible values for roleType "owner", "pointOfContact"
            if (role === roleType) {
                orga = contact;
            }

        });

        return orga;
    },
    /**
     * Parses the XML Document and returns the formatted date defined in status.
     * If no status is defined there is a given logic to search for the latest date
     * @param  {XML} xmlDoc The returned XML Document from the requested CSW-Interface containing possibly multiple dates.
     * @param  {String} status The defined date status to be extracted.
     * @param  {String} fallbackStatus If date with given status returns undefined the fallback status is parsed.
     * @return {String} Parsed date in Format (DD.MM.YYYY).
     */
    parseDate: function (xmlDoc, status, fallbackStatus) {
        const citation = $("gmd\\:citation,citation", xmlDoc),
            dates = $("gmd\\:CI_Date,CI_Date", citation);

        let dateTime;

        if (typeof status === "undefined") {
            dateTime = this.getNormalDateTimeString(dates);
        }
        else {
            dateTime = this.getDateTimeStringByStatus(dates, status, fallbackStatus);
        }
        return typeof dateTime !== "undefined" ? moment(dateTime).format("DD.MM.YYYY") : null;
    },
    /**
     * Parses the given XML and returns a date string using the following logic.
     * First look for revision date.
     * If there is no revision date look for publication date.
     * If no publication date fallback to creation date.
     * @param  {XML} dates Preparsed dates as XML.
     * @return {String} The raw date String extractec from XML.
     */
    getNormalDateTimeString: function (dates) {
        let dateTimeString;

        dateTimeString = this.getDateTimeStringByStatus(dates, "revision");
        if (typeof dateTimeString === "undefined") {
            dateTimeString = this.getDateTimeStringByStatus(dates, "publication", "creation");
        }
        return dateTimeString;
    },
    /**
     * Parses the given XML and returns the date with given status.
     * If no date is found and fallback status is defined it recursionly calls itsef with fallback status as new status.
     * @param  {XML} dates Preparsed dates as XML.
     * @param  {String} status Status of the date Object to be used
     * @param  {String} fallbackStatus Fallback if no date with given status is found
     * @return {String} The raw date String extractec from XML.
     */
    getDateTimeStringByStatus: function (dates, status, fallbackStatus) {
        let dateTimeString,
            datetype,
            codeListValue;

        if (typeof dates !== "undefined") {
            dates.each(function (index, element) {
                datetype = $("gmd\\:CI_DateTypeCode,CI_DateTypeCode", element);
                codeListValue = $(datetype).attr("codeListValue");

                if (codeListValue === status) {
                    dateTimeString = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
            });
        }
        if (typeof fallbackStatus !== "undefined" && typeof dateTimeString === "undefined") {
            dateTimeString = this.getDateTimeStringByStatus(dates, fallbackStatus);
        }
        return dateTimeString;
    },
    /**
     * Parses the periodicity part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} dateType type of date for this frequency
     */
    parsePeriodicity: function (xmlDoc) {
        const resourceMaintenance = $("gmd\\:resourceMaintenance,resourceMaintenance", xmlDoc),
            maintenanceInformation = $("gmd\\:MD_MaintenanceInformation,MD_MaintenanceInformation", resourceMaintenance),
            maintenanceAndUpdateFrequency = $("gmd\\:maintenanceAndUpdateFrequency,maintenanceAndUpdateFrequency", maintenanceInformation),
            maintenanceFrequencyCode = $("gmd\\:MD_MaintenanceFrequencyCode,MD_MaintenanceFrequencyCode", maintenanceAndUpdateFrequency),
            dateType = $(maintenanceFrequencyCode).attr("codeListValue"),
            dateTypes = {
                continual: "kontinuierlich",
                daily: "täglich",
                weekly: "wöchentlich",
                fortnightly: "zweimal wöchentlich",
                monthly: "monatlich",
                quarterly: "quartalsweise",
                biannually: "zweimal jährlich",
                annually: "jährlich",
                asNeeded: "bei Bedarf",
                irregular: "unregelmäßige Intervalle",
                notPlanned: "nicht geplant",
                unknown: "unbekannt"
            };

        return typeof dateTypes[dateType] === "undefined" ? null : dateTypes[dateType];
    }
});

export default CswParserModel;
