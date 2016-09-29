define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var ParameterModel = Backbone.Model.extend({
        defaults: {
            brwList: [],
            requestedParams: {},
            params: {},
            nutzung: "",
            produkt: "",
            lage: ""
        },
        initialize: function () {
        },
        paramChanged: function (obj) {
            if (obj.type === "number") {
                var waehrungsfaktor = obj.waehrung && obj.waehrung === "DM" ? 1.95583 : 1,
                    eurValue = obj.value / waehrungsfaktor,
                    mincheck = obj.minCheck && Number(eurValue) < Number(obj.minCheck) ? false : true,
                    maxcheck = obj.maxCheck && Number(eurValue) > Number(obj.maxCheck) ? false : true;

                if (mincheck === true && maxcheck == true) {
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
                defaultFlae = aktBRW && aktBRW.flae ? aktBRW.flae : 1000,
                defaultBauw = aktBRW && aktBRW.bauw ? aktBRW.bauw : "eh",
                defaultWGFZ = aktBRW && aktBRW.wgfz ? aktBRW.wgfz : 1.0;

            this.set("defaultFlae", defaultFlae);
            this.set("defaultBauw", defaultBauw);
            this.set("defaultWGFZ", defaultWGFZ);
        },
        setInitialParams: function (liste) {
            var params = {};

            liste.find("div[class=btn-group]").each(function (num, input) {
                $(input).find("button").each(function (num2, button) {
                    if ($(button).hasClass("active") === true) {
                        var id = input.id,
                            val = button.value;

                        params = _.extend(params, _.object([id], [val]));
                    }
                });
            });
            liste.find("input[type=number]").each(function (num, input) {
                var id = input.id,
                    val = input.value;

                params = _.extend(params, _.object([id], [val]));
            });
            liste.find("input[type=checkbox]").each(function (num, input) {
                var id = input.id,
                    val = input.checked;

                params = _.extend(params, _.object([id], [val]));
            });
            liste.find(":selected").each(function (num, selected, bla) {
                var parent = $(selected).parent()[0],
                    id = parent.id,
                    val = selected.value;

                params = _.extend(params, _.object([id], [val]));
            });
            this.set("params", params);
        }
    });

    return new ParameterModel();
});
