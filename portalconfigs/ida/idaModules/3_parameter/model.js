define(function (require) {
    var Backbone = require("backbone"),
        ParameterModel;

    ParameterModel = Backbone.Model.extend({
        defaults: {
            brwList: [],
            requestedParams: {},
            params: {},
            nutzung: "",
            produkt: "",
            lage: "",
            jahr: ""
        },

        paramChanged: function (obj) {
            var waehrungsfaktor, eurValue, mincheck, maxcheck;

            if (obj.type === "number") {
                waehrungsfaktor = obj.waehrung && obj.waehrung === "DM" ? 1.95583 : 1;
                eurValue = obj.value / waehrungsfaktor;
                mincheck = obj.minCheck && Number(eurValue) < Number(obj.minCheck) ? false : true;
                maxcheck = obj.maxCheck && Number(eurValue) > Number(obj.maxCheck) ? false : true;

                if (mincheck === true && maxcheck === true) {
                    this.trigger("switchToValid", obj.id);
                    _.extend(this.get("params"), _.object([obj.id], [eurValue.toString()]));
                }
                else {
                    this.trigger("switchToInvalid", obj.id);
                }
            }
            else {
                _.extend(this.get("params"), _.object([obj.id], [obj.value]));
            }
        },

        calcDefaultsForTemplate: function () {
            var brwList = this.get("brwList"),
                aktBRW = _.filter(brwList, {art: "Akt.BRW"})[0],
                defaultFlae = aktBRW && aktBRW.brwValues.flae ? aktBRW.brwValues.flae : 1000,
                defaultBauw = aktBRW && aktBRW.brwValues.bauw ? aktBRW.brwValues.bauw : "",
                defaultWGFZ = aktBRW && aktBRW.brwValues.wgfz ? aktBRW.brwValues.wgfz : 1.0,
                defaultStadtteil = this.get("brwList").length > 0 ? this.get("brwList")[0].brwLage.stadtteil : "",
                defaultWofl = 0,
                defaultEgfl = 0,
                defaultOgfl = 0,
                minWofl = 0;

            if (this.get("nutzung") === "MFH") {
                defaultFlae = 1000;
                defaultWofl = defaultFlae * defaultWGFZ * 0.78;
                minWofl = 1;
            }
            else if (this.get("nutzung") === "BH" || this.get("nutzung") === "GH" || this.get("nutzung") === "BGH" || this.get("nutzung") === "PL") {
                defaultFlae = 1000;
                if (defaultWGFZ < 4) {
                    defaultEgfl = defaultFlae * defaultWGFZ * 0.78 * 0.25;
                    defaultOgfl = defaultFlae * defaultWGFZ * 0.78 * 0.75;
                }
                else {
                    defaultEgfl = defaultFlae * 0.78;
                    defaultOgfl = defaultFlae * (defaultWGFZ - 1) * 0.78;
                }
            }
            else if (this.get("nutzung") === "WGH") {
                defaultFlae = 1000;
                defaultWofl = defaultFlae * defaultWGFZ * 0.78 * 0.75;
                defaultEgfl = defaultFlae * defaultWGFZ * 0.78 * 0.25;
                minWofl = 1;
            }
            else if (this.get("nutzung") === "WGB") {
                defaultFlae = 1000;
                defaultWofl = defaultFlae * defaultWGFZ * 0.78 * 0.5;
                defaultEgfl = defaultFlae * defaultWGFZ * 0.78 * 0.25;
                defaultOgfl = defaultFlae * defaultWGFZ * 0.78 * 0.25;
                minWofl = 1;
            }
            else if (this.get("nutzung") === "ETW" || this.get("nutzung") === "EFH") {
                minWofl = 1;
            }

            this.set("defaultWofl", defaultWofl);
            this.set("defaultEgfl", defaultEgfl);
            this.set("defaultOgfl", defaultOgfl);
            this.set("defaultFlae", defaultFlae);
            this.set("defaultStadtteil", defaultStadtteil);
            this.set("defaultBauw", defaultBauw);
            this.set("defaultWGFZ", defaultWGFZ);
            this.set("minWofl", minWofl);
        }
    });

    return ParameterModel;
});
