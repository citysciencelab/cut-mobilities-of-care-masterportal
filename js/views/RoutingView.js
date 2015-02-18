define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/RoutingWin.html',
    'models/Routing',
    'eventbus',
    'config',
    'models/Orientation'
], function ($, _, Backbone, RoutingWin, RoutingModel, EventBus, Config) {

    var RoutingView = Backbone.View.extend({
        model: RoutingModel,
        id: 'RoutingWin',
        className: 'panel panel-master',
        template: _.template(RoutingWin),
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:fromCoord', this.coord_change);
            this.listenTo(this.model, 'change:toCoord', this.coord_change);
            this.listenTo(this.model, 'change:description', this.toggleSwitcher);
            this.listenTo(this.model, 'change:fromList', this.fromListChanged);
            this.listenTo(this.model, 'change:toList', this.toListChanged);
            EventBus.on('toggleRoutingWin', this.toggleRoutingWin, this);
            EventBus.on('setGeolocation', this.setGeolocation, this);
            EventBus.on('setRoutingDestination', this.setRoutingDestination, this);
            if (Config.startUpModul.toUpperCase() === 'ROUTING') {
                this.toggleRoutingWin();
            }
        },
        events: {
            'click .toggleRoutingOptions': 'toggleRoutingOptions',
            'click .closeroutenplaner': 'toggleRoutingWin',
            'click #RouteBerechnenButton': 'routeBerechnen',
            'change .changedWochentag': 'changedRoutingTime',
            'change .changedUhrzeit' : 'changedRoutingTime',
            'click .startAdressePosition' : 'startAdressePosition', //eigene Positionsbestimmung auf aktueller Standpunkt
            'click .startAdresseChanged' : 'adresse_click',
            'click .zielAdresseChanged' : 'adresse_click',

            'keyup .startAdresseChanged' : 'adresseChanged_keyup',
            'keyup .zielAdresseChanged' : 'adresseChanged_keyup',

            'click .startAdresseSelected' : 'startAdresseSelected',
            'click .zielAdresseSelected' : 'zielAdresseSelected',

            'click .toggleLayout' : 'toggleLayout',
            'click .deleteroute' : 'deleteRoute'
        },
        fromListChanged: function () {
            var fromList = this.model.get('fromList');
            if (fromList.length > 0) {
                $("#input-group-start ul").empty();
                _.each(fromList, function (value) {
                    $("#input-group-start ul").append('<li ' + value + '</li>');
                });
                $("#input-group-start ul").show();
                $('#startAdresse').focus();
            }
            else {
                $("#input-group-start ul").empty();
                $("#input-group-start ul").hide();
            }
        },
        toListChanged: function (value) {
            var toList = this.model.get('toList');
            if (toList.length > 0) {
                $("#input-group-ziel ul").empty();
                _.each(toList, function (value) {
                    $("#input-group-ziel ul").append('<li ' + value + '</li>');
                });
                $("#input-group-ziel ul").show();
                $('#zielAdresse').focus();
            }
            else {
                $("#input-group-ziel ul").empty();
                $("#input-group-ziel ul").hide();
            }
        },
        setRoutingDestination: function (coordinate) {
            EventBus.trigger('closeGFIParams', this);
            this.model.set('toStrassenname', coordinate.toString());
            this.model.set('toCoord', coordinate);
            $('#zielAdresse').val(coordinate.toString());
            if ($('#RoutingWin').is(":hidden")){
                this.toggleRoutingWin();
            }
        },
        deleteRoute: function () {
            this.model.deleteRouteFromMap();
            this.model.set('description', '');
            this.model.set('endDescription', '');
        },
        toggleSwitcher: function () {
            var description = this.model.get('description');
            var endDescription = this.model.get('endDescription');
            $("#input-group-description ul").empty();
            if (description && description != '' && endDescription && endDescription != '') {
                _.each(description, function (item, index, list) {
                    $("#input-group-description ul").append('<li id="teil' + index.toString() + '" class="list-group-item"><span class="">' + item.Description + '</span></li>');
                });
                $('#endeDescription').text(endDescription);
                $('#RoutingWin > .panel-switcher').show('slow');
            }
            else {
                $('#endeDescription').text('');
                $('#RoutingWin > .panel-switcher').hide('slow');
                $('#input-group-description').hide('slow');
                $('#RoutingWin > .panel-route').show('slow');
            }
        },
        toggleLayout: function () {
            if ($('#RoutingWin > .panel-description').is(":visible") == true) {
                $('#toggleLayoutSpan').text('Beschreibung ');
                $('#RoutingWin > .panel-route').show('slow');
                $('#RoutingWin > .panel-description').hide('slow');
            }
            else {
                $('#toggleLayoutSpan').text('Start / Ziel ');
                $('#RoutingWin > .panel-route').hide('slow');
                $('#RoutingWin > .panel-options').hide('slow');
                $('#RoutingWin > .panel-description').show('slow');
            }
        },
        toggleDescription: function () {
            $('#RoutingWin > .panel-description').toggle('slow');
        },
        routeBerechnen: function () {
            this.model.deleteRouteFromMap();
            if ($('#RoutingWin > .panel-options').is(":visible") == true) {
                this.toggleRoutingOptions();
            }
            if ($('#RoutingWin > .panel-description').is(":visible") == true) {
                this.toggleDescription();
            }
            this.model.requestRoute();
        },
        adresse_click: function (evt) {
            var value = evt.target.value;
            if (evt.target.value == 'aktueller Standpunkt' && evt.target.id == 'startAdresse') {
                $('#startAdresse').val('');
                EventBus.trigger('clearGeolocationMarker', this);
            }
            else {
                evt.target.select();
            }
        },
        coord_change: function (newValue) {
            // steuere Center der View
            if (newValue.changed.fromCoord) {
                var newCoord = newValue.changed.fromCoord;
            }
            else if (newValue.changed.toCoord) {
                var newCoord = newValue.changed.toCoord;
            }
            if (newCoord && newCoord.length == 2) {
                EventBus.trigger('setCenter', newCoord, 10);
            }
            // steuere Route berechnen Button
            if (this.model.get('fromCoord') != '' && this.model.get('toCoord') != '') {
                document.getElementById("RouteBerechnenButton").disabled = false;
            }
            else {
                document.getElementById("RouteBerechnenButton").disabled = true;
            }
        },
        zielAdresseSelected: function (evt) {
            var value = evt.currentTarget.id;
            this.model.geosearchByBKG(value, 'ziel');
        },
        startAdresseSelected: function (evt) {
            var value = evt.currentTarget.id;
            this.model.geosearchByBKG(value, 'start');
        },
        adresseChanged_keyup: function (evt) {
            var value = evt.target.value;
            if (evt.target.id == 'startAdresse') {
                var target = 'start';
            }
            else {
                var target = 'ziel';
            }
            if (evt.keyCode === 40) { //Down
            }
            else if (evt.keyCode === 38) { //Up
            }
            else if (evt.keyCode === 27 || evt.keyCode === 13) { //Esc oder Enter
                this.model.set('fromList', '');
                this.model.set('toList', '');
            }
            else {
                if (evt.target.id == 'startAdresse') {
                    this.model.set('fromCoord', '');
                    this.model.set('fromAdresse', '');
                }
                else {
                    this.model.set('toCoord', '');
                    this.model.set('toAdresse', '');
                }
                this.model.suggestByBKG(value, target);
            }
        },
        setGeolocation: function (geoloc) {
            if (_.isArray(geoloc) && geoloc.length == 2) {
                this.model.set('fromAdresse', 'aktueller Standpunkt');
                this.model.set('fromCoord', geoloc[0]);
                $('#startAdresse').val('aktueller Standpunkt');
                EventBus.trigger('showGeolocationMarker', this);
            }
        },
        startAdressePosition: function (evt) {
            EventBus.trigger('setOrientation', this);
            EventBus.trigger('showGeolocationMarker', this);
        },
        changedRoutingTime: function (evt) {
            var rt = $('#timeButton').val();
            var rd = $('#dayOfWeekButton').val();
            if (rt && rt != '' && rd && rd != '') {
                this.model.set('routingtime', rt);
                this.model.set('routingdate', rd);
            }
            else {
                this.model.set('routingtime', '');
                this.model.set('routingdate', '');
            }
        },
        render: function () {
            var attr = this.model.toJSON();
            $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        toggleRoutingOptions: function () {
            if ($('#RoutingWin > .panel-options').is(":visible") == false) {
                var date = new Date();
                var oldTime = this.model.get('routingtime');
                if (oldTime && oldTime != '') {
                    $('#timeButton').val(oldTime);
                }
                else {
                    var localtime = date.toLocaleTimeString().split(':');
                    var hourAsFloat = parseFloat(localtime[0].slice(1, localtime[0].length-1));
                    var minAsFloat = parseFloat(localtime[1].slice(1, localtime[1].length-1));
                    var hour = ((hourAsFloat<10?'0':'') + hourAsFloat).toString();
                    var minute = ((minAsFloat<10?'0':'') + minAsFloat).toString();
                    $('#timeButton').val(hour + ':' + minute);
                }

                var oldDate = this.model.get('routingdate');
                if (oldDate && oldDate != '') {
                    $('#dayOfWeekButton').val(oldDate);
                }
                else {
                    var year = date.toISOString().substr(0,4);
                    var month = date.toISOString().substr(5,2);
                    var day = date.toISOString().substr(8,2);
                    $('#dayOfWeekButton').val(year + '-' + month + '-' + day);
                }
            }
            $('#RoutingWin > .panel-options').toggle('slow');
            $('#RoutingWin > .panel-body > .btn-group > .toggleRoutingOptions > .glyphicon').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
        },
        toggleRoutingWin: function () {
            if ($('#RoutingWin').is(":visible")){
                $('#RoutingWin').hide();
            }
            else {
                if ($("#geolocate").length > 0) {
                    $("#startAdressePositionSpan").show();
                }
                else {
                    $("#startAdressePositionSpan").hide();
                }
                var that = this;
                $('#RoutingWin').show(1000);
                if (this.model.get('fromCoord') == '' && $("#geolocate").length > 0) {
                    that.startAdressePosition();
                }
            }
        }
    });
    return RoutingView;
});
