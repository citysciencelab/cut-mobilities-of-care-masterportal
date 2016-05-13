define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite3Model = Backbone.Model.extend({
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
                value = target.checked ? target.checked : target.value,
                attrObj = this.get("params"),
                newObj = _.extend(attrObj, _.object([id], [value]));

            this.set("params", newObj);
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

    return new Seite3Model();
});
