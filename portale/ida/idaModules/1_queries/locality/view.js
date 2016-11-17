define([
    "jquery",
    "backbone",
    "text!idaModules/1_queries/locality/template.html",
    "config",
    "idaModules/1_queries/locality/model",
    "modules/searchbar/view",
    "modules/tools/parcelSearch/view"
], function ($, Backbone, Template, Config, Model, Searchbar, ParcelSearch) {
    "use strict";
    var LocalityView = Backbone.View.extend({
        el: "#lage",
        model: Model,
        template: _.template(Template),
        events: {
            "change input[type=radio]": "switchLage", // 'click .toggleRoutingOptions': 'toggleRoutingOptions',
            "change #flurstueckstrassenliste": "setFlurstuecksstrasse"
        },
        initialize: function () {
            this.listenTo(this.model, "change:header", this.setHeader);
            this.listenTo(this.model, "change:flurstueckstrassenoptionen", this.updateFlurstueckstrassenoptionen);

            this.render();
            new Searchbar(Config.searchBar);
            $("#searchInput").focus();
            new ParcelSearch(Config.parcelSearch);
        },
        updateFlurstueckstrassenoptionen: function () {
            var flurstueckstrassenoptionen = this.model.get("flurstueckstrassenoptionen");

            $("#flurstueckstrassenliste").empty();
            if (flurstueckstrassenoptionen.length > 0) {
                $("#flurstueckstrassenliste").attr("disabled", false);
                $("#flurstueckstrassenliste").append("<option disabled class='pull-left' value='0'>bitte wählen</option>");
                _.each(flurstueckstrassenoptionen, function (floption) {
                    $("#flurstueckstrassenliste").append($(floption));
                });
                $("#flurstueckstrassenliste").val("0");
            }
            else {
                $("#flurstueckstrassenliste").attr("disabled", true);
                this.model.set("flurStrasse", "");
            }
        },
        switchLage: function (evt) {
            if (evt.target.value === "radio1") {
                this.model.set("searchmode", "adresse");
                $("#adresse").show();
                $("#gemarkung").hide();
            }
            else {
                this.model.set("searchmode", "parcel");
                $("#gemarkung").show();
                $("#adresse").hide();
            }
        },
        setHeader: function () {
            var header = this.model.get("header");

            $("#lageheaderSuffix").text(header);
        },
        setFlurstuecksstrasse: function (evt) {
            this.model.set("flurStrasse", evt.currentTarget.value);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return LocalityView;
});
