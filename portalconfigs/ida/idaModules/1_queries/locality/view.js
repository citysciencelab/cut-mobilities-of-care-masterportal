define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Template = require("text!idaModules/1_queries/locality/template.html"),
        Config = require("config"),
        Model = require("idaModules/1_queries/locality/model"),
        Searchbar = require("modules/searchbar/view"),
        ParcelSearch = require("modules/tools/parcelSearch/view"),
        LocalityView;

    LocalityView = Backbone.View.extend({
        el: "#lage",
        model: new Model(),
        template: _.template(Template),
        events: {
            "click .btn": "switchLage", // 'click .toggleRoutingOptions': 'toggleRoutingOptions',
            "change #flurstueckstrassenliste": "setFlurstuecksstrasse",
            "change #districtField": "hideFlurstuecksstraßen"
        },
        initialize: function () {
            this.listenTo(this.model, "change:header", this.setHeader);
            this.listenTo(this.model, "change:flurstueckstrassenoptionen", this.updateFlurstueckstrassenoptionen);
            this.listenTo(Radio.channel("ParcelSearch"), "noParcelFound", this.hideFlurstuecksstraßen);

            this.render();
            new Searchbar(Config.searchBar);
            $("#searchInput").focus();
            new ParcelSearch(Config.parcelSearch);
        },
        hideFlurstuecksstraßen: function () {
            $("#flurstuecksstrassen").hide();
        },
        updateFlurstueckstrassenoptionen: function () {
            var flurstueckstrassenoptionen = this.model.get("flurstueckstrassenoptionen");

            $("#flurstueckstrassenliste").empty();
            if (flurstueckstrassenoptionen.length > 0) {
                $("#flurstuecksstrassen").show();
                $("#flurstueckstrassenliste").append("<option class='pull-left' value='0'>bitte wählen</option>");
                _.each(flurstueckstrassenoptionen, function (floption) {
                    $("#flurstueckstrassenliste").append($(floption));
                });
                $("#flurstueckstrassenliste").val("0");
            }
            else {
                this.hideFlurstuecksstraßen();
                this.model.setParcelStreet("", "");
            }
        },
        switchLage: function (evt) {
            var id = evt.target.id,
                button = evt.target,
                group = $("#lagebtngroup");

            $(group).find(".btn").each(function (index, btn) {
                $(btn).removeClass("active");
            });

            $(button).addClass("active");

            if (id === "address") {
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
            var streetkey = evt.currentTarget.value,
                streetname = $(evt.currentTarget).find("option:selected").text();

            this.model.setParcelStreet(streetkey, streetname);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return LocalityView;
});
