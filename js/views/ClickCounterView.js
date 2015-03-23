define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'models/ClickCounter'
], function ($, _, Backbone, EventBus, ClickCounter) {

    var ClickCounterView = Backbone.View.extend({
        model: ClickCounter,
        initialize: function () {
        		// Erzeuge iFrame
        		$('<iframe " src="' + this.model.get('srcUrl') + '" id="' + this.model.get('countframeid') + '" width="0" height="0" frameborder="0"/>').appendTo('body');
        		this.registerEvents();
        },
        registerEvents: function () {
        		// fired beim Öffnen der Seite
	        	this.registerClick();			
	        	// fired beim Ausschnitt-Move und Klickabfragen auf Features
						$('#map').click(function() {
						  this.registerClick();
						}.bind(this));
						// fired beim LayerChange, Info-Button, Einstellungen auf dem Layertree
						if ($('#tree').length > 0) {
							$('#tree').click(function() {
							  this.registerClick();
							}.bind(this));
						}					
						// fired beim ToolChange
						if ($('#tools').length > 0) {
							$('#tools').click(function() {
							  this.registerClick();
							}.bind(this));
						}
						// fired beim Öffnen der Routenberechnung
						if ($('.routingModul').length > 0) {
							$('.routingModul').click(function() {
							  this.registerClick();
							}.bind(this));
						}
        },
        registerClick: function () {
            this.model.refreshIframe();
        }
    });

    return ClickCounterView;
});
