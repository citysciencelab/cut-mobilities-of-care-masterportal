define([
    "backbone",
    "backbone.radio",
    "text!modules/viomRouting/template.html",
    "modules/viomRouting/model",
    "eventbus",
    "modules/controls/orientation/model"
], function (Backbone, Radio, RoutingWin, RoutingModel, EventBus) {

    var RoutingView = Backbone.View.extend({
        model: RoutingModel,
        id: "RoutingWin",
        className: "win-body",
        template: _.template(RoutingWin),
        initialize: function () {
            var channel = Radio.channel("Routing");

            channel.on({
                "setRoutingDestination": this.setRoutingDestination
            }, this);

            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement

            this.listenTo(this.model, "change:fromCoord", this.coord_change);
            this.listenTo(this.model, "change:toCoord", this.coord_change);
            this.listenTo(this.model, "change:description", this.toggleSwitcher);
            this.listenTo(this.model, "change:fromList", this.fromListChanged);
            this.listenTo(this.model, "change:toList", this.toListChanged);
            this.listenTo(this.model, "change:startAdresse", this.changeStartAdresse);
            this.listenTo(this.model, "change:zielAdresse", this.changeZielAdresse);
            EventBus.on("setGeolocation", this.setGeolocation, this);
            EventBus.on("setRoutingDestination", this.setRoutingDestination, this);
            EventBus.on("deleteRoute", this.deleteRoute, this);
            Radio.trigger("Autostart", "initializedTool", "routing");
        },
        events: {
            "click .toggleRoutingOptions": "toggleRoutingOptions",
            "click #RouteBerechnenButton": "routeBerechnen",
            "change .changedWochentag": "changedRoutingTime",
            "change .changedUhrzeit": "changedRoutingTime",
            "click .startAdressePosition": "startAdressePosition", // eigene Positionsbestimmung auf aktueller Standpunkt
            "click .startAdresseChanged": "adresse_click",
            "click .zielAdresseChanged": "adresse_click",

            "keyup .startAdresseChanged": "adresseChanged_keyup",
            "keyup .zielAdresseChanged": "adresseChanged_keyup",

            "click .startAdresseSelected": "startAdresseSelected",
            "click .zielAdresseSelected": "zielAdresseSelected",

            "click .toggleLayout": "toggleLayout",
            "click .deleteroute": "deleteRoute"
        },
        changeStartAdresse: function () {
            $("#startAdresse").val(this.model.get("startAdresse"));
            $("#startAdresse").focus();
        },
        changeZielAdresse: function () {
            $("#zielAdresse").val(this.model.get("zielAdresse"));
            $("#zieltAdresse").focus();
        },
        fromListChanged: function () {
            var fromList = this.model.get("fromList");

            if (fromList.length > 0) {
                $("#input-group-start ul").empty();
                _.each(fromList, function (value) {
                    $("#input-group-start ul").append("<li " + value + "</li>");
                });
                $("#input-group-start ul").show();
                $("#startAdresse").focus();
            }
            else {
                $("#input-group-start ul").empty();
                $("#input-group-start ul").hide();
            }
        },
        toListChanged: function () {
            var toList = this.model.get("toList");

            if (toList.length > 0) {
                $("#input-group-ziel ul").empty();
                _.each(toList, function (value) {
                    $("#input-group-ziel ul").append("<li " + value + "</li>");
                });
                $("#input-group-ziel ul").show();
                $("#zielAdresse").focus();
            }
            else {
                $("#input-group-ziel ul").empty();
                $("#input-group-ziel ul").hide();
            }
        },
        setRoutingDestination: function (coordinate) {console.log(coordinate);
            Radio.trigger("GFIPopup", this);
            EventBus.trigger("toggleWin", ["routing", "Routenplaner", "glyphicon-road"]);
            this.model.set("toStrassenname", coordinate.toString());
            this.model.set("toCoord", coordinate);
            $("#zielAdresse").val(coordinate.toString());
        },
        deleteRoute: function () {
            this.model.deleteRouteFromMap();
            this.model.set("description", "");
            this.model.set("endDescription", "");
        },
        toggleSwitcher: function () {
            var description = this.model.get("description"),
                endDescription = this.model.get("endDescription");

            $("#input-group-description ul").empty();
            if (description && description !== "" && endDescription && endDescription !== "") {
                _.each(description, function (item, index) {
                    $("#input-group-description ul").append("<li id='teil" + index.toString() + "' class='list-group-item'><span class=''>" + item.Description + "</span></li>");
                });
                $("#endeDescription").text(endDescription);
                $("#RoutingWin > .panel-switcher").show("slow");
            }
            else {
                $("#endeDescription").text("");
                $("#RoutingWin > .panel-switcher").hide("slow");
                $("#input-group-description").hide("slow");
                $("#RoutingWin > .panel-route").show("slow");
            }
        },
        toggleLayout: function () {
            if ($("#RoutingWin > .panel-description").is(":visible") === true) {
                $("#toggleLayoutSpan").text("Beschreibung ");
                $("#RoutingWin > .panel-route").show("slow");
                $("#RoutingWin > .panel-description").hide("slow");
            }
            else {
                $("#toggleLayoutSpan").text("Start / Ziel ");
                $("#RoutingWin > .panel-route").hide("slow");
                $("#RoutingWin > .panel-options").hide("slow");
                $("#RoutingWin > .panel-description").show("slow");
            }
        },
        toggleDescription: function () {
            $("#RoutingWin > .panel-description").toggle("slow");
        },
        routeBerechnen: function () {
            this.model.deleteRouteFromMap();
            if ($("#RoutingWin > .panel-options").is(":visible") === true) {
                this.toggleRoutingOptions();
            }
            if ($("#RoutingWin > .panel-description").is(":visible") === true) {
                this.toggleDescription();
            }
            this.model.requestRoute();
        },
        adresse_click: function (evt) {
            var value = evt.target.value,
                target = evt.target.id;

            if (target === "startAdresse") {
                if (value === "aktueller Standpunkt") {
                    this.model.set("startAdresse", "");
                    this.model.set("fromCoord", "");
                    EventBus.trigger("clearGeolocationMarker", this);
                }
            }
            this.model.set("toList", "");
            this.model.set("fromList", "");
            evt.target.select();
        },
        coord_change: function (newValue) {
            // steuere Center der View
            if (newValue.changed.fromCoord) {
                var newCoord = newValue.changed.fromCoord;
            }
            else if (newValue.changed.toCoord) {
                var newCoord = newValue.changed.toCoord;
            }
            if (newCoord && newCoord.length === 2) {
                EventBus.trigger("setCenter", newCoord, 10);
            }
            // steuere Route berechnen Button
            if (this.model.get("fromCoord") !== "" && this.model.get("toCoord") !== "") {
                document.getElementById("RouteBerechnenButton").disabled = false;
            }
            else {
                document.getElementById("RouteBerechnenButton").disabled = true;
            }
        },
        zielAdresseSelected: function (evt) {
            var value = evt.currentTarget.id;

            this.model.geosearchByBKG(value, "ziel");
        },
        startAdresseSelected: function (evt) {
            var value = evt.currentTarget.id;

            this.model.geosearchByBKG(value, "start");
        },
        adresseChanged_keyup: function (evt) {
            var value = evt.target.value,
                target = "";

            if (evt.target.id === "startAdresse") {
                target = "start";
            }
            else {
                target = "ziel";
            }
            if (evt.keyCode === 40) { //Down
            }
            else if (evt.keyCode === 38) { //Up
            }
            else if (evt.keyCode === 27 || evt.keyCode === 13) { // Esc oder Enter
                this.model.set("fromList", "");
                this.model.set("toList", "");
            }
            else {
                if (evt.target.id === "startAdresse") {
                    this.model.set("fromCoord", "");
                    this.model.set("startAdresse", value);
                }
                else {
                    this.model.set("toCoord", "");
                    this.model.set("zielAdresse", value);
                }
                this.model.suggestByBKG(value, target);
            }
        },
        changedRoutingTime: function () {
            var rt = $("#timeButton").val(),
                rd = $("#dayOfWeekButton").val();

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
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
                if ($("#geolocate").length > 0) {
                    $("#startAdressePositionSpan").show();
                    if (this.model.get("fromCoord") === "") {
                        Radio.trigger("geolocation", "sendPosition");
                    }
                }
                else {
                    $("#startAdressePositionSpan").hide();
                }
                // steuere Route berechnen Button
                if (this.model.get("fromCoord") !== "" && this.model.get("toCoord") !== "") {
                    document.getElementById("RouteBerechnenButton").disabled = false;
                }
                else {
                    document.getElementById("RouteBerechnenButton").disabled = true;
                }
                if (this.model.get("description") !== "") {
                    this.toggleSwitcher();
                }
            }
            else {
                this.undelegateEvents();
            }
        },
        toggleRoutingOptions: function () {
            if ($("#RoutingWin > .panel-options").is(":visible") === false) {
                var date = new Date(),
                    oldTime = this.model.get("routingtime");

                if (oldTime && oldTime !== "") {
                    $("#timeButton").val(oldTime);
                }
                else {
                    var localtime = date.toLocaleTimeString().split(":"),
                        hour = localtime[0].length === 1 ? "0" + localtime[0] : localtime[0],
                        minute = localtime[1].length === 1 ? "0" + localtime[1] : localtime[1];

                    $("#timeButton").val(hour + ":" + minute);
                }
                var oldDate = this.model.get("routingdate");

                if (oldDate && oldDate !== "") {
                    $("#dayOfWeekButton").val(oldDate);
                }
                else {
                    var year = date.toISOString().substr(0, 4),
                        month = date.toISOString().substr(5, 2),
                        day = date.toISOString().substr(8, 2);

                    $("#dayOfWeekButton").val(year + "-" + month + "-" + day);
                }
            }
            $("#RoutingWin > .panel-options").toggle("slow");
            $("#RoutingWin > .panel-body > .btn-group > .toggleRoutingOptions > .glyphicon").toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
        }
    });
    return RoutingView;
});
