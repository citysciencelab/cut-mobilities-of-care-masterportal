define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/RoutingWin.html',
    'models/Routing',
    'eventbus',
    'models/Orientation'
], function ($, _, Backbone, RoutingWin, RoutingModel, EventBus) {

    var RoutingView = Backbone.View.extend({
        model: RoutingModel,
        id: 'RoutingWin',
        className: 'panel panel-master',
        template: _.template(RoutingWin),
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:fromCoord', this.setCenterforFromValue);
            this.listenTo(this.model, 'change:toCoord', this.setCenterforToValue);
            EventBus.on('toggleRoutingWin', this.toggleRoutingWin, this);
            EventBus.on('setGeolocation', this.setGeolocation, this);
        },
        events: {
            'click .toggleRoutingOptions': 'toggleRoutingOptions',
            'click .close': 'toggleRoutingWin',
            'click #filterbutton': 'getFilterInfos',
            'click .changedWochentag': 'changedWochentag',
            'change .changedUhrzeit' : 'changedUhrzeit',
            'keyup .startAdresseChanged' : 'startAdresseChanged',
            'keyup .zielAdresseChanged' : 'zielAdresseChanged',
            'click .startAdressePosition' : 'startAdressePosition',
            'click .startAdresseChanged' : 'startAdresseChanged',
            'click .startAdresseSelected' : 'startAdresseSelected',
            'click .zielAdresseSelected' : 'zielAdresseSelected'
        },
        setCenterforFromValue: function (newValue) {
            if (newValue.changed.fromCoord != '') {
                EventBus.trigger('setCenter', newValue.changed.fromCoord, 5);
            }
        },
        setCenterforToValue: function (newValue) {
            if (newValue.changed.toCoord != '') {
                EventBus.trigger('setCenter', newValue.changed.toCoord, 5);
            }
        },
        zielAdresseSelected: function (evt) {
            var value = evt.currentTarget.id;
            this.model.search(value, 'ziel');
        },
        startAdresseSelected: function (evt) {
            var value = evt.currentTarget.id;
            this.model.search(value, 'start');
        },
        startAdresseChanged: function (evt) {
            EventBus.trigger('clearGeolocationMarker', this);
            var value = evt.target.value;
            if (value == 'aktueller Standpunkt') {
                $('#startAdresse').val('');
            }
            else {
                this.model.search(value, 'start');
            }
        },
        zielAdresseChanged: function (evt) {
            var value = evt.target.value;
            this.model.search(value, 'ziel');
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
        changedUhrzeit: function (evt) {
            var timeread = evt.target.value;
            var timearray = timeread.split(':');
            var success = false;
            if (timearray.length == 2) {
                var hour = timearray[0];
                var minute = timearray[1];
                if ($.isNumeric(hour) && $.isNumeric(minute)){
                    if (hour >= 0 && hour <=23 && minute >= 0 && minute <= 59) {
                        this.model.set('routinghour', hour);
                        this.model.set('routingminute', minute);
                        success = true;
                    }
                }
            }
            if (success == false) {
                $('#timeButton').addClass('errortime');
            }
            else {
                $('#timeButton').removeClass('errortime');
            }
        },
        changedWochentag: function (evt) {
            if (evt.target.textContent === 'keinen Zeitpunkt vorgeben') {
                this.model.set('routingday', '');
                $('#dayOfWeekButton').text("Wochentag wählen");
            }
            else {
                this.model.set('routingday', evt.target.textContent);
                $('#dayOfWeekButton').text(evt.target.textContent);
            }
        },
        render: function () {
            var attr = this.model.toJSON();
            $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        toggleRoutingOptions: function () {
            if ($('#RoutingWin > .panel-options').is(":visible") == false) {
                var oldHour = this.model.get('routinghour');
                var oldMinute = this.model.get('routingminute');
                var oldWeekday = this.model.get('routingday');
                if (oldHour && oldHour >= 0) {
                    $('#timeButton').val(oldHour + ':' + oldMinute);
                }
                else {
                    var time = new Date();
                    var hour = time.getHours();
                    var minute = (time.getMinutes()<10?'0':'') + time.getMinutes()
                    $('#timeButton').val(hour + ':' + minute);
                }
                if (oldWeekday != '') {
                    $('#dayOfWeekButton').text(oldWeekday);
                }
                else {
                    var time = new Date();
                    var weekday = new Array(7);
                    weekday[0]=  "Sontag";
                    weekday[1] = "Montag";
                    weekday[2] = "Dienstag";
                    weekday[3] = "Mittwoch";
                    weekday[4] = "Donnerstag";
                    weekday[5] = "Freitag";
                    weekday[6] = "Samstag";
                    $('#dayOfWeekButton').text(weekday[time.getDay()]);
                }
            }
            $('#RoutingWin > .panel-options').toggle('slow');
            $('#RoutingWin > .panel-body > .toggleRoutingOptions > .glyphicon').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
        },
        toggleRoutingWin: function () {
            if ($('#RoutingWin').is(":visible")){
                $('#RoutingWin').hide();
            }
            else {
                $('#RoutingWin > .panel-options').toggle('slow');
                var that = this;
                $('#RoutingWin').show(1000, function () {
                    that.startAdressePosition();
                });
            }
        }
    });
    return RoutingView;
});
