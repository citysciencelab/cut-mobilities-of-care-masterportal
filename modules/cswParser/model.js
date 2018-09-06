define(function (require) {
    var moment = require("moment"),
        $ = require("jquery"),
        CswParser;

    CswParser = Backbone.Model.extend({
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
                    case "date": {
                        parsedData[key] = this.parseDate(xmlDoc);
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
                    default: {
                        break;
                    }

                }
            }, this);
            cswObj.parsedData = parsedData;
            Radio.trigger("CswParser", "fetchedMetaData", cswObj);
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
        parseUrl: function (xmlDoc) {
            // TODO
            return "";
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
        parseDate: function (xmlDoc) {
            var citation = $("gmd\\:citation,citation", xmlDoc),
                dates = $("gmd\\:CI_Date,CI_Date", citation),
                datetype, revisionDateTime, publicationDateTime, dateTime;

            dates.each(function (index, element) {
                datetype = $("gmd\\:CI_DateTypeCode,CI_DateTypeCode", element);
                if ($(datetype).attr("codeListValue") === "revision") {
                    revisionDateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
                else if ($(datetype).attr("codeListValue") === "publication") {
                    publicationDateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
                else {
                    dateTime = $("gco\\:DateTime,DateTime, gco\\:Date,Date", element)[0].textContent;
                }
            });
            if (revisionDateTime) {
                dateTime = revisionDateTime;
            }
            else if (publicationDateTime) {
                dateTime = publicationDateTime;
            }
            return moment(dateTime).format("DD.MM.YYYY");
        }
    });
    return CswParser;
})
