import * as moment from "moment";

const CswParser = Backbone.Model.extend({
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
    initialize: function () {
        var channel = Radio.channel("CswParser");

        channel.on({
            "getMetaData": this.getMetaData
        }, this);
    },
    getMetaData: function (cswObj) {
        this.fetch({
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
            success: function (model, xmlDoc) {
                this.parseData(xmlDoc, cswObj);
            }
        });
    },

    parseData: function (xmlDoc, cswObj) {
        var parsedData = {};

        _.each(cswObj.keyList, function (key) {
            switch (key) {
                case "datePublication": {
                    parsedData[key] = this.parseDate(xmlDoc, "publication");
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
                case "orga": {
                    parsedData[key] = this.parseOrga(xmlDoc);
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
    parseTitle: function (xmlDoc, cswObj) {
        var ci_Citation = $("gmd\\:CI_Citation,CI_Citation", xmlDoc)[0],
            gmdTitle = _.isUndefined(ci_Citation) === false ? $("gmd\\:title,title", ci_Citation) : undefined,
            title = _.isUndefined(gmdTitle) === false ? gmdTitle[0].textContent : cswObj.layerName;

        return title;
    },
    parseAddress: function (xmlDoc) {
        var contact = $("gmd\\:contact,contact", xmlDoc),
            addressField = $("gmd\\:CI_Address,CI_Address", contact),
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
    parseAbstractText: function (xmlDoc) {
        var abstractText = $("gmd\\:abstract,abstract", xmlDoc)[0].textContent;

        if (abstractText.length > 1000) {
            return abstractText.substring(0, 600) + "...";
        }

        return abstractText;
    },
    parseEmail: function (xmlDoc) {
        var contact = $("gmd\\:contact,contact", xmlDoc),
            emailField = $("gmd\\:electronicMailAddress,electronicMailAddress", contact),
            email = _.isUndefined($(emailField)[0]) ? "" : $(emailField)[0].textContent;

        return email;
    },
    parseTel: function (xmlDoc) {
        var contact = $("gmd\\:contact,contact", xmlDoc),
            phoneField = $("gmd\\:CI_Telephone,CI_Telephone", contact),
            phoneNr = $("gmd\\:voice,voice", phoneField),
            phone = _.isUndefined($(phoneNr)[0]) ? "" : $(phoneNr)[0].textContent;

        return phone;
    },
    parseOrga: function (xmlDoc) {
        var contact = $("gmd\\:contact,contact", xmlDoc),
            orgaField = $("gmd\\:organisationName,organisationName", contact),
            orga = _.isUndefined($(orgaField)[0]) ? "" : $(orgaField)[0].textContent;

        return orga;
    },

    parseDate: function (xmlDoc, status) {
        var citation = $("gmd\\:citation,citation", xmlDoc),
            dates = $("gmd\\:CI_Date,CI_Date", citation),
            datetype,
            revisionDateTime,
            publicationDateTime,
            dateTime;

        dates.each(function (index, element) {
            datetype = $("gmd\\:CI_DateTypeCode,CI_DateTypeCode", element);
            if ($(datetype).attr("codeListValue") === "revision") {
                revisionDateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
            }
            else if ($(datetype).attr("codeListValue") === "publication") {
                publicationDateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
            }
            else {
                publicationDateTime = _.isUndefined(publicationDateTime) ? $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent : publicationDateTime;
            }
        });

        if (!_.isUndefined(revisionDateTime) && status === "revision") {
            dateTime = revisionDateTime;
        }
        else if (!_.isUndefined(publicationDateTime) && status === "publication") {
            dateTime = publicationDateTime;
        }

        return !_.isUndefined(dateTime) ? moment(dateTime).format("DD.MM.YYYY") : null;
    },

    parsePeriodicity: function (xmlDoc) {
        var resourceMaintenance = $("gmd\\:resourceMaintenance,resourceMaintenance", xmlDoc),
            maintenanceInformation = $("gmd\\:MD_MaintenanceInformation,MD_MaintenanceInformation", resourceMaintenance),
            maintenanceAndUpdateFrequency = $("gmd\\:maintenanceAndUpdateFrequency,maintenanceAndUpdateFrequency", maintenanceInformation),
            maintenanceFrequencyCode = $("gmd\\:MD_MaintenanceFrequencyCode,MD_MaintenanceFrequencyCode", maintenanceAndUpdateFrequency),
            dateType = $(maintenanceFrequencyCode).attr("codeListValue"),
            periodicity;

        if (dateType === "continual") {
            periodicity = "kontinuierlich";
        }
        else if (dateType === "daily") {
            periodicity = "täglich";
        }
        else if (dateType === "weekly") {
            periodicity = "wöchentlich";
        }
        else if (dateType === "fortnightly") {
            periodicity = "zweimal wöchentlich";
        }
        else if (dateType === "monthly") {
            periodicity = "monatlich";
        }
        else if (dateType === "quarterly") {
            periodicity = "quartalsweise";
        }
        else if (dateType === "biannually") {
            periodicity = "zweimal jährlich";
        }
        else if (dateType === "annually") {
            periodicity = "jährlich";
        }
        else if (dateType === "asNeeded") {
            periodicity = "bei Bedarf";
        }
        else if (dateType === "irregular") {
            periodicity = "unregelmäßige Intervalle";
        }
        else if (dateType === "notPlanned") {
            periodicity = "nicht geplant";
        }
        else if (dateType === "unknown") {
            periodicity = "unbekannt";
        }
        else {
            periodicity = null;
        }

        return periodicity;
    }
});

export default CswParser;
