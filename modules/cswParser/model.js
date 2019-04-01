import * as moment from "moment";

const CswParser = Backbone.Model.extend(/** @lends CswParser.prototype */{
    defaults: {
        cswId: "3"
    },
    url: function () {
        var cswService = Radio.request("RestReader", "getServiceById", this.get("cswId")),
            url;

        if (_.isUndefined(cswService) === false) {
            url = Radio.request("Util", "getProxyURL", cswService.get("url"));
        }
        return url;
    },
    /**
     * @class CswParser
     * @extends Backbone.Model
     * @memberof CswParser
     * @constructs
     * @property {String} cswId="" Id of csw service, corresponding to rest-services.json
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires CswParser#RadioTriggerFetchedMetaData
     * @listens CswParser#RadioTriggerGetMetaData
     */
    initialize: function () {
        var channel = Radio.channel("CswParser");

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
                Radio.trigger("Alert", "alert", {
                    text: "<b>Entschuldigung</b><br>" +
                        "Zurzeit können leider keine Metadaten abgefragt werden.<br>" +
                        "Eventuell ist die Metadaten-Schnittstelle nicht erreichbar.<br>" +
                        "Versuchen Sie es bitte später erneut",
                    kategorie: "alert-warning"
                });
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
     * @fires CswParser#RadioTriggerFetchedMetaData
     * @returns {void}
     */
    parseData: function (xmlDoc, cswObj) {
        var parsedData = {};

        _.each(cswObj.keyList, function (key) {
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
        }, this);
        cswObj.parsedData = parsedData;
        Radio.trigger("CswParser", "fetchedMetaData", cswObj);
    },
    /**
     * Parses the download link part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {Array} downloadLinks array of download links
     */
    parseDownloadLinks: function (xmlDoc) {
        var transferOptions = $("gmd\\:MD_DigitalTransferOptions,MD_DigitalTransferOptions", xmlDoc),
            downloadLinks = [],
            linkName,
            link,
            datetype;

        transferOptions.each(function (index, element) {
            datetype = $("gmd\\:CI_OnLineFunctionCode,CI_OnLineFunctionCode", element);
            if ($(datetype).attr("codeListValue") === "download") {
                linkName = $("gmd\\:name,name", element)[0].textContent;
                if (linkName.indexOf("Download") !== -1) {
                    linkName = linkName.replace("Download", "");
                }
                link = $("gmd\\:URL,URL", element)[0].textContent;
                downloadLinks.push([linkName, link]);
            }
        });
        return downloadLinks.length > 0 ? downloadLinks : null;
    },
    /**
     * Parses the title part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @param {Object} cswObj Object of CSW request information.
     * @returns {String} title Title of the meta data entry
     */
    parseTitle: function (xmlDoc, cswObj) {
        var ci_Citation = $("gmd\\:CI_Citation,CI_Citation", xmlDoc)[0],
            gmdTitle = _.isUndefined(ci_Citation) === false ? $("gmd\\:title,title", ci_Citation) : undefined,
            title = _.isUndefined(gmdTitle) === false ? gmdTitle[0].textContent : cswObj.layerName;

        return title;
    },
    /**
     * Parses the address part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {Object} address Address of the meta data entry's owner
     */
    parseAddress: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            addressField = $("gmd\\:CI_Address,CI_Address", orga),
            streetNameField = $("gmd\\:deliveryPoint,deliveryPoint", addressField),
            streetName = _.isUndefined($(streetNameField)[0]) ? "" : $(streetNameField)[0].textContent,
            cityField = $("gmd\\:city,city", addressField),
            city = _.isUndefined($(cityField)[0]) ? "" : $(cityField)[0].textContent,
            postalCodeField = $("gmd\\:postalCode,postalCode", addressField),
            postalCode = _.isUndefined($(postalCodeField)[0]) ? "" : $(postalCodeField)[0].textContent,
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
        var abstractText = $("gmd\\:abstract,abstract", xmlDoc)[0].textContent;

        if (abstractText.length > 1000) {
            return abstractText.substring(0, 600) + "...";
        }

        return abstractText;
    },
    /**
     * Parses the URL part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} url URL of the meta data entry's owner
     */
    parseUrl: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            urlField = $("gmd\\:CI_OnlineResource,CI_OnlineResource", orga),
            linkage = $("gmd\\:linkage,linkage", urlField),
            url = _.isUndefined($(linkage)[0]) ? "n.N." : $(linkage)[0].textContent;

        return url;
    },
    /**
     * Parses the e-mail part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} email e-mail of the meta data entry's owner
     */
    parseEmail: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            emailField = $("gmd\\:electronicMailAddress,electronicMailAddress", orga),
            email = _.isUndefined($(emailField)[0]) ? "n.N." : $(emailField)[0].textContent;

        return email;
    },
    /**
     * Parses the phone number part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} phone phone number of the meta data entry's owner
     */
    parseTel: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            phoneField = $("gmd\\:CI_Telephone,CI_Telephone", orga),
            phoneNr = $("gmd\\:voice,voice", phoneField),
            phone = _.isUndefined($(phoneNr)[0]) ? "n.N." : $(phoneNr)[0].textContent;


        return phone;

    },
    /**
     * Parses the organisation name of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @returns {String} orgaName name of the organisation of the meta data entry's owner
     */
    parseOrgaOwner: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            orgaField = $("gmd\\:organisationName,organisationName", orga),
            orgaName = _.isUndefined($(orgaField)[0]) ? "n.N." : $(orgaField)[0].textContent;

        return orgaName;
    },
    /**
     * Parses the organisation part of the data returned by the meta data request.
     * @param {Object} xmlDoc Result of the meta data request.
     * @param {String} roleType Type of role which shall be parsed ("owner", "pointOfContact").
     * @returns {String} orga details of organisation of the meta data entry's owner
     */
    parseOrga: function (xmlDoc, roleType) {
        var identificationInfo = $("gmd\\:identificationInfo,identificationInfo", xmlDoc),
            pointOfContact = $("gmd\\:pointOfContact,pointOfContact", identificationInfo),
            orga = "";

        _.each($(pointOfContact), function (contact) {
            var roleObject = $("gmd\\:role,role", contact),
                children = $(roleObject).children(),
                role;

            _.each($(children)[0].attributes, function (attribute) {
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
        var citation = $("gmd\\:citation,citation", xmlDoc),
            dates = $("gmd\\:CI_Date,CI_Date", citation),
            dateTime;

        if (_.isUndefined(status)) {
            dateTime = this.getNormalDateTimeString(dates);
        }
        else {
            dateTime = this.getDateTimeStringByStatus(dates, status, fallbackStatus);
        }
        return !_.isUndefined(dateTime) ? moment(dateTime).format("DD.MM.YYYY") : null;
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
        var dateTimeString;

        dateTimeString = this.getDateTimeStringByStatus(dates, "revision");
        if (_.isUndefined(dateTimeString)) {
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
        var dateTimeString,
            datetype,
            codeListValue;

        if (!_.isUndefined(dates)) {
            dates.each(function (index, element) {
                datetype = $("gmd\\:CI_DateTypeCode,CI_DateTypeCode", element);
                codeListValue = $(datetype).attr("codeListValue");

                if (codeListValue === status) {
                    dateTimeString = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
            });
        }
        if (!_.isUndefined(fallbackStatus) && _.isUndefined(dateTimeString)) {
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
        var resourceMaintenance = $("gmd\\:resourceMaintenance,resourceMaintenance", xmlDoc),
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

        return _.isUndefined(dateTypes[dateType]) ? null : dateTypes[dateType];
    }
});

export default CswParser;
