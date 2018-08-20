define(function (require) {
    var RoutingWin = require("text!modules/viomRouting/template.html"),
        RoutingModel = require("modules/viomRouting/model"),
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
        initialize: function (attr) {
            var channel = Radio.channel("ViomRouting");

            this.model = new RoutingModel(attr);
            this.listenTo(this.model, "change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
            this.listenTo(this.model, "change:fromCoord", this.toggleRoutingButton);
            this.listenTo(this.model, "change:toCoord", this.toggleRoutingButton);
            this.listenTo(this.model, "change:description", this.addDescription);
            this.listenTo(this.model, "change:fromList", this.fromListChanged);
            this.listenTo(this.model, "change:toList", this.toListChanged);
            this.listenTo(this.model, "change:startAdresse", this.changeStartAdresse);
            this.listenTo(this.model, "change:zielAdresse", this.changeZielAdresse);
            this.listenTo(this.model, "change:isGeolocationPossible", this.changeGeolocationPossible, this);
            channel.on({
                "setRoutingDestination": this.setRoutingDestination
            }, this);

            Radio.trigger("Autostart", "initializedModul", "routing");
        },
        id: "routingWin",
        className: "win-body routingWin",
        template: _.template(RoutingWin),
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
            Radio.trigger("Window", "toggleWin", Radio.request("ModelList", "getModelByAttributes", {id: "routing"}));
            this.model.set("toStrassenname", coordinate.toString());
            this.model.set("toCoord", coordinate);
            this.model.set("zielAdresse", "gewähltes Ziel");
        },
        addDescription: function () {
            this.renderWin(); // Template schreibt Ergebnisse in Div
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
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.renderWin();
                this.delegateEvents();
            }
            else if (this.model.get("isCurrentWin") === false) {
                this.model.deleteRouteFromMap();
                this.undelegateEvents();
            }
            return this;
        },
        renderWin: function () {
            var attr = this.model.toJSON();

            this.$el.html("");
            $(".win-heading").after(this.$el.html(this.template(attr)));
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
