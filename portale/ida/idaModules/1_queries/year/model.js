define([
    "underscore",
    "backbone",
    "eventbus",
    "config"
], function (_, Backbone, EventBus, Config) {
    "use strict";
    var YearModel = Backbone.Model.extend({
        defaults: {
            maxJahr: "",
            minJahr: "",
            jahr: "",
            jahreText: ""
        },
        initialize: function () {
            this.set("minJahr", Config.minJahr);
            this.set("maxJahr", Config.maxJahr);
            if ($("#validjahre")[0] && $("#validjahre")[0].textContent) {
                $("#validjahre").html("(" + Config.minJahr + " - " + Config.maxJahr + ")");
            }
            else {
                alert("Fehlendes Element in HTML: validjahre");
            }
            if ($("#jahreText")[0] && $("#jahreText")[0].textContent) {
                $("#jahreText").html(Config.jahreText);
            }
            else {
                alert("Fehlendes Element in HTML: jahreText");
            }
        },
        setJahr: function (jahr) {
            jahr = parseInt(jahr);
            if (_.isNaN(jahr) === false && jahr >= this.get("minJahr") && jahr <= this.get("maxJahr")) {
                this.unset("jahr", {silent: true});
                this.set("jahr", jahr);
                EventBus.trigger("seite1_jahr:newJahr", jahr);
            }
            else {
                this.set("jahr", "");
                EventBus.trigger("seite1_jahr:newJahr", "");
            }
        }
    });

    return new YearModel();
});
