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
        paramChanged: function (target) {
            var id = target.id,
                value = "",
                attrObj = this.get("params");

            if (target.type === "checkbox") {
                value = target.checked ? true : false;
            }
            else {
                var mincheck = true,
                    maxcheck = true;

                if (target.min && target.value < target.min) {
                    mincheck = false;
                }
                if (target.max && target.value > target.max) {
                    maxcheck = false;
                }
                if (mincheck === true && maxcheck === true) {
                    value = target.value;
                    this.trigger("switchToValid", target);
                }
                else {
                    this.trigger("switchToInvalid", target);
                }
            }
            this.set("params", _.extend(attrObj, _.object([id], [value])));
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
