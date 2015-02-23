define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/GFIPopup.html',
    'models/GFIPopup',
    'eventbus'
], function ($, _, Backbone, GFIPopupTemplate, GFIPopup, EventBus) {

    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        template: _.template(GFIPopupTemplate),
        events: {
            'click .gfi-close': 'destroy',
            'click .gfi-toggle': 'minMaximizePop',
            'click .pager-right': 'renderNext',
            'click .pager-left': 'renderPrevious',
            'click #RouteZeigenButton' : 'startShowingRoute',
            'click #setRoutingDestination' : 'setRoutingDestination'
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function () {
            $('#popovermin').remove();
            EventBus.on('setMap', this.setMap, this);
            this.listenTo(this.model, 'change:coordinate', this.render);
            this.listenTo(this.model, 'change:gfiContent', this.routingButton);
            EventBus.on('closeGFIParams', this.destroy, this); // trigger in map.js
            EventBus.on('showGFIParams', this.minMaximizePop, this);
        },
        /**
         * Sichert Map für Route
         */
        setMap: function (map) {
            this.model.set('map', map);
        },
        setRoutingDestination: function (evt) {
            EventBus.trigger('setRoutingDestination', this.model.get('coordinate'));
        },
        startShowingRoute: function (evt) {
            // hole Map nur, wenn Route angezeigt werden soll
            EventBus.trigger('getMap', this);
            // lösche alte Route
            this.model.clearRoute();
            var gesuchteRoute = evt.currentTarget.value;
            this.model.showRoute(gesuchteRoute);
            this.minMaximizePop();
        },
        /**
         * Toggle des Popovers in minimiert oder maximiert
         */
        minMaximizePop: function () {
            var overlay = this.model.get('gfiOverlay');
            if (overlay.getPosition() == undefined) {
                overlay.setPosition(this.model.get('coordinate'));
                $('#popovermin').fadeOut(500, function() {
                    $('#popovermin').remove();
                });
            }
            else {
                overlay.setPosition(undefined);
                var html = '<div id="popovermin" class="popover-min">';
                html += '<span class="glyphicon glyphicon-info-sign gfi-icon-min"></span>'
                html += '<span class="popovermintext">Abfrageergebnisse</span>';
                html += '</div>';
                $('#map').append(html);
                $('#popovermin').fadeIn(500);
                $('#popovermin').click(function () {
                    EventBus.trigger('showGFIParams', this);
                });
            }
        },
        /**
         * beim setzen des GFIContent werden evtl. Buttons zum zeigen von Routen gezeigt.
         */
        routingButton: function (values) {
            var gfiContent = values.get('gfiContent');
            for (i=0; i < gfiContent.length; i++) {
                var values = _.pairs(gfiContent[i]);
                // Verändern des vorherigen Eintrags der Route
                for (var j=0; j < values.length; j++) {
                    if (_.isObject(values[j][1]) && values[j][1].flatCoordinates.length > 0 && _.isString(values[j-1][1])) {
                        var config = '<button id="RouteZeigenButton" title="Schnellste Route zeigen" value="' + values[j][0] + '" style="min-width: 130px; width:100%" type="button" class="btn btn-info btn-sm">';
                        config = config + '<span style="float:left;" class="" aria-hidden="true">' + values[j-1][1] + '  </span>';
                        config = config + '<span style="float:right; top:3px;" class="glyphicon glyphicon-road" aria-hidden="true"></span>';
                        config = config + '</button>';
                        values[j-1][1] = config;
                    }
                }
                gfiContent[i] = _.object(values);
            }
            this.model.set('gfiContent', gfiContent);
        },
        /**
         *
         */
        render: function () {
            if (_.has(this.model.get('gfiContent')[0], 'video')) {
                this.model.set('isStreamingLibLoaded', true); //lädt Bibliotheken
            }
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $(this.model.get('element')).popover({
                'placement': function () {
                    if (this.getPosition().y > window.innerWidth / 2) {
                        return 'top'
                    }
                    else {
                        return 'bottom'
                    }
                },
                'html': true,
                'content': this.$el
            });
            this.model.showPopup();
            EventBus.trigger('closeMouseHoverPopup', this);
            EventBus.trigger('GFIPopupVisibility', true);
        },
        /**
         *
         */
        renderNext: function () {
            if($('.pager-right').hasClass('disabled') === false) {
                this.model.set('gfiCounter', this.model.get('gfiCounter') - 1);
                this.render();
            }
        },
        /**
         *
         */
        renderPrevious: function () {
            if($('.pager-left').hasClass('disabled') === false) {
                this.model.set('gfiCounter', this.model.get('gfiCounter') + 1);
                this.render();
            }
        },
        /**
         *
         */
        destroy: function () {
            $('#popovermin').remove();
            this.model.clearRoute();
            EventBus.trigger('GFIPopupVisibility', false);
            this.model.destroyPopup();
        }
    });

    return GFIPopupView;
});
