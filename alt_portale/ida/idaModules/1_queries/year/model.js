define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {
    "use strict";
    var YearModel = Backbone.Model.extend({
        defaults: {
            maxJahr: "",
            minJahr: "",
            jahr: "",
            jahreText: ""
        },
        initialize: function () {
        },
        setJahr: function (jahr) {
            jahr = parseInt(jahr);
            if (_.isNaN(jahr) === false && jahr >= this.get("minJahr") && jahr <= this.get("maxJahr")) {
                this.unset("jahr", {silent: true});
                this.set("jahr", jahr);
                EventBus.trigger("seite1_jahr:newJahr", jahr);
                this.set("header", jahr);
            }
            else {
                this.set("jahr", "");
                EventBus.trigger("seite1_jahr:newJahr", "");
                this.set("header", "");
            }
        }
    });

    return new YearModel();
});
