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
    parseAbstractText: function (xmlDoc) {
        var abstractText = $("gmd\\:abstract,abstract", xmlDoc)[0].textContent;

        if (abstractText.length > 1000) {
            return abstractText.substring(0, 600) + "...";
        }

        return abstractText;
    },
    parseUrl: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            urlField = $("gmd\\:CI_OnlineResource,CI_OnlineResource", orga),
            linkage = $("gmd\\:linkage,linkage", urlField),
            url = _.isUndefined($(linkage)[0]) ? "n.N." : $(linkage)[0].textContent;

        return url;
    },
    parseEmail: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            emailField = $("gmd\\:electronicMailAddress,electronicMailAddress", orga),
            email = _.isUndefined($(emailField)[0]) ? "n.N." : $(emailField)[0].textContent;

        return email;
    },
    parseTel: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            phoneField = $("gmd\\:CI_Telephone,CI_Telephone", orga),
            phoneNr = $("gmd\\:voice,voice", phoneField),
            phone = _.isUndefined($(phoneNr)[0]) ? "n.N." : $(phoneNr)[0].textContent;


        return phone;

    },
    parseOrgaOwner: function (xmlDoc) {
        var orga = this.parseOrga(xmlDoc, "owner"),
            orgaField = $("gmd\\:organisationName,organisationName", orga),
            orgaName = _.isUndefined($(orgaField)[0]) ? "n.N." : $(orgaField)[0].textContent;

        return orgaName;
    },
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
