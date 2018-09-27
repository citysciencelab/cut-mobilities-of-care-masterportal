define(function (require) {
    var RoutingWin = require("text!modules/tools/viomRouting/template.html"),
        $ = require("jquery"),
        RoutingView;

    RoutingView = Backbone.View.extend({
        events: {
            "click #calc": "routeBerechnen",
            "change .changedWochentag": "changedRoutingTime",
            "change .changedUhrzeit": "changedRoutingTime",
            "click .startAdressePosition": "startAdressePosition", // eigene Positionsbestimmung auf aktueller Standpunkt
            "keyup .adresse": "adresseKeyup",
            "click .addressLi": "addressSelected",
            "click .pagination": "paginationSwitcher"
        },
        initialize: function () {
            var channel = Radio.channel("ViomRouting");

            this.model.setParams();
            this.template = _.template(RoutingWin);
            this.listenTo(this.model, {
                "change:isActive": this.render,
                "change:fromCoord": this.toggleRoutingButton,
                "change:toCoord": this.toggleRoutingButton,
                "change:description": this.addDescription,
                "change:fromList": this.fromListChanged,
                "change:toList": this.toListChanged,
                "change:startAdresse": this.changeStartAdresse,
                "change:zielAdresse": this.changeZielAdresse,
                "change:isGeolocationPossible": this.changeGeolocationPossible
            }, this);
            channel.on({
                "setRoutingDestination": this.setRoutingDestination
            }, this);
            // Bestätige, dass das Modul geladen wurde
            Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
        },
        id: "routingWin",
        startAdressePosition: function () {
            Radio.trigger("geolocation", "sendPosition");
        },
        paginationSwitcher: function (evt) {
            if ($(evt.target).parent().hasClass("disabled") === false) {
                $(evt.currentTarget).find(".active").removeClass("active");
                $(evt.target).parent().addClass("active");
                switch (evt.target.id) {
                    case "options": {
                        this.$(".calc").hide();
                        this.$(".address").hide();
                        this.$(".options").show();
                        break;
                    }
                    case "calc": {
                        this.$(".options").hide();
                        this.$(".calc").show();
                        this.$(".address").hide();
                        break;
                    }
                    default: {
                        this.$(".options").hide();
                        this.$(".calc").hide();
                        this.$(".address").show();
                    }
                }
            }
        },
        changeStartAdresse: function () {
            this.$("#startAdresse").val(this.model.get("startAdresse"));
            this.$("#startAdresse").attr("title", this.model.get("startAdresse"));
            this.$("#startAdresse").focus();
        },
        changeZielAdresse: function () {
            this.$("#zielAdresse").val(this.model.get("zielAdresse"));
            this.$("#zielAdresse").attr("title", this.model.get("zielAdresse"));
            this.$("#zielAdresse").focus();
        },
        fromListChanged: function () {
            var fromList = this.model.get("fromList");

            if (fromList.length > 0) {
                this.$("#input-group-start ul").empty();
                _.each(fromList, function (value) {
                    this.$("#input-group-start ul").append("<li id='" + value[0] + "' class='list-group-item addressLi'><span>" + value[1] + "</span></li>");
                });
                this.$("#input-group-start ul").show();
                this.$("#startAdresse").focus();
            }
            else {
                this.$("#input-group-start ul").empty();
                this.$("#input-group-start ul").hide();
            }
        },
        toListChanged: function () {
            var toList = this.model.get("toList");

            if (toList.length > 0) {
                this.$("#input-group-ziel ul").empty();
                _.each(toList, function (value) {
                    this.$("#input-group-ziel ul").append("<li id='" + value[0] + "' class='list-group-item addressLi'><span>" + value[1] + "</span></li>");
                });
                this.$("#input-group-ziel ul").show();
                this.$("#zielAdresse").focus();
            }
            else {
                this.$("#input-group-ziel ul").empty();
                this.$("#input-group-ziel ul").hide();
            }
        },

        setRoutingDestination: function (coordinate) {
            Radio.trigger("GFIPopup", "closeGFIParams");
            Radio.trigger("Window", "showTool", Radio.request("ModelList", "getModelByAttributes", {id: "routing"}));
            this.model.set("toStrassenname", coordinate.toString());
            this.model.set("toCoord", coordinate);
            this.model.set("zielAdresse", "gewähltes Ziel");
        },
        addDescription: function () {
            if (!_.isNull(this.model.get("description"))) {
                this.renderWin(); // Template schreibt Ergebnisse in Div
            }
        },
        routeBerechnen: function () {
            if (this.$("#calc").parent().hasClass("disabled") === false) {
                this.model.deleteRouteFromMap();
                this.model.requestRoute();
            }
        },
        toggleRoutingButton: function () {
            if (this.model.get("fromCoord") !== "" && this.model.get("toCoord") !== "") {
                this.$("#calcLi").removeClass("disabled");
            }
            else {
                this.$("#calcLi").addClass("disabled");
            }
        },
        addressSelected: function (evt) {
            var value = evt.currentTarget.id,
                ref = $(evt.currentTarget).parent()[0].id;

            this.model.geosearchByBKG(value, ref);
        },
        toggleDown: function (target) {
            var ul = $("#" + target)[0],
                liList = $(ul).find("li"),
                selectedLi = _.filter(liList, function (li) {
                    return $(li).hasClass("active");
                });

            if (selectedLi.length === 0) { // nimm 1. li
                $(liList).first().addClass("active");
            }
            else {
                $(selectedLi).removeClass("active");
                $(selectedLi).next().addClass("active");
            }
        },
        toggleUp: function (target) {
            var ul = $("#" + target)[0],
                liList = $(ul).find("li"),
                selectedLi = _.filter(liList, function (li) {
                    return $(li).hasClass("active");
                });

            if (selectedLi.length === 0) { // nimm 1. li
                $(liList).last().addClass("active");
            }
            else {
                $(selectedLi).removeClass("active");
                $(selectedLi).prev().addClass("active");
            }
        },
        selectEnter: function (target) {
            var selectedLi = $("#" + target).find(".active");

            if (selectedLi.length === 1) {
                this.model.geosearchByBKG(selectedLi[0].id, target);
            }
            else if (selectedLi.length === 0) {
                this.model.set("fromList", "");
                this.model.set("toList", "");
            }
        },
        adresseKeyup: function (evt) {
            var value = evt.target.value,
                target = evt.target.id === "startAdresse" ? "start" : "ziel";

            if (evt.keyCode === 40) { // down
                this.toggleDown(target);
            }
            else if (evt.keyCode === 38) { // up
                this.toggleUp(target);
            }
            else if (evt.keyCode === 27) { // Esc
                this.model.set("fromList", "");
                this.model.set("toList", "");
            }
            else if (evt.keyCode === 13) { // Enter
                this.selectEnter(target);
            }
            else {
                if (target === "start") {
                    this.model.set("fromCoord", "");
                    this.model.set("startAdresse", value);
                }
                else {
                    this.model.set("toCoord", "");
                    this.model.set("zielAdresse", value);
                }
                if (value.length > 3) {
                    this.model.suggestByBKG(value, target);
                }
            }
        },
        changedRoutingTime: function () {
            var rt = this.$("#timeButton").val(),
                rd = this.$("#dayOfWeekButton").val();

            if (rt && rt !== "" && rd && rd !== "") {
                this.model.set("routingtime", rt);
                this.model.set("routingdate", rd);
            }
            else {
                this.model.set("routingtime", "");
                this.model.set("routingdate", "");
            }
        },
        render: function (model, value) {
            if (value) {
                this.renderWin();
                this.delegateEvents();
                this.$el.addClass("routingWin");
            }
            else {
                this.$el.removeClass("routingWin");
                this.model.deleteRouteFromMap();
                this.undelegateEvents();
            }
            return this;
        },
        renderWin: function () {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(this.model.toJSON()));
        },
        changeGeolocationPossible: function (val) {
            if (val === true) {
                this.$("#startAdressePositionSpan").removeClass("hidden");
            }
            else {
                this.$("#startAdressePositionSpan").addClass("hidden");
            }
        }
    });

    return RoutingView;
});
