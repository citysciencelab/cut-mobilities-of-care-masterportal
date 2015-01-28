define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/RoutingWin.html',
    'models/Routing',
    'eventbus',
    'models/Orientation'
], function ($, _, Backbone, RoutingWin, RoutingModel, EventBus, map) {

    var RoutingView = Backbone.View.extend({
        model: RoutingModel,
        id: 'RoutingWin',
        className: 'panel panel-master',
        template: _.template(RoutingWin),
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:fromCoord', this.setCenter);
            this.listenTo(this.model, 'change:toCoord', this.setCenter);
            this.listenTo(this.model, 'change:description', this.toggleSwitcher);
            EventBus.on('toggleRoutingWin', this.toggleRoutingWin, this);
            EventBus.on('setGeolocation', this.setGeolocation, this);
        },
        events: {
            'click .toggleRoutingOptions': 'toggleRoutingOptions',
            'click .closeroutenplaner': 'toggleRoutingWin',
            'click #RouteBerechnenButton': 'routeBerechnen',
            'change .changedWochentag': 'changedRoutingTime',
            'change .changedUhrzeit' : 'changedRoutingTime',
            
            'click .startAdresseChanged' : 'deleteDefaultString',
            'keyup .startAdresseChanged' : 'adresseChanged_keyup',
            'keyup .zielAdresseChanged' : 'adresseChanged_keyup',
            'click .startAdressePosition' : 'startAdressePosition',
            'click .startAdresseSelected' : 'startAdresseSelected',
            'click .zielAdresseSelected' : 'zielAdresseSelected',
            
            'click .toggleLayout' : 'toggleLayout',
            'click .deleteroute' : 'deleteRoute'
        },
        deleteRoute: function () {
            this.model.deleteRoute();
            this.model.set('description', '');
            this.model.set('endDescription', '');
        },
        toggleSwitcher: function () {
            var description = this.model.get('description');
            var endDescription = this.model.get('endDescription');
            if (description && description != '' && endDescription && endDescription != '') {
                console.log(description);
                _.each(description, function (item, index, list) {
                    $("#input-group-description ul").append('<li id="teil' + index.toString() + '" class="list-group-item"><span class="">' + item.Description + '</span></br><small>Dauer: ' + item.Duration + ' s</small></li>');
                });
//                $('#RoutingWin > .panel-description').text(endDescription);
                $('#RoutingWin > .panel-switcher').show('slow');
            }
            else {
                $('#RoutingWin > .panel-switcher').hide('slow');
            }
            this.toggleLayout();
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
            this.model.deleteRoute();
            if ($('#RoutingWin > .panel-options').is(":visible") == true) {
                this.toggleRoutingOptions();
            }
            if ($('#RoutingWin > .panel-description').is(":visible") == true) {
                this.toggleDescription();
            }
            this.model.requestRoute();
        },
        deleteDefaultString: function (evt) {
            var value = evt.target.value;
            if (evt.target.value == 'aktueller Standpunkt' && evt.target.id == 'startAdresse') {
                $('#startAdresse').val('');
                EventBus.trigger('clearGeolocationMarker', this);
            }
        },
        setCenter: function (newValue) {
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
            this.model.search(value, 'ziel', false);
        },
        startAdresseSelected: function (evt) {
            var value = evt.currentTarget.id;
            this.model.search(value, 'start', false);
        },
        adresseChanged_keyup: function (evt) {
            var value = evt.target.value;
            if (evt.keyCode === 13) {
                var openList = false;
            }
            else {
                var openList = true;
            }
            if (evt.target.id == 'startAdresse') {
                var target = 'start';
            }
            else {
                var target = 'ziel';
            }
            this.model.search(value, target, openList);
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
                    var hour = ((parseFloat(localtime[0])<10?'0':'') + parseFloat(localtime[0])).toString();
                    var minute = ((parseFloat(localtime[1])<10?'0':'') + parseFloat(localtime[1])).toString();
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
                var that = this;
                $('#RoutingWin').show(1000);
                if (this.model.get('fromCoord') == '') {
                    that.startAdressePosition();
                }
            }
        }
    });
    return RoutingView;
});
