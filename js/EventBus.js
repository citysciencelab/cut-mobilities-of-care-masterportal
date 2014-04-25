define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    /**
     * @exports EventBus
     * @classdesc Dieses Modul gibt ein Objekt vom Typ Backbone.Events zurück. Damit ist es möglich
     * objektunabhängig Events zwischen MV-Komponenten abzufangen und zu triggern.
     * @example // In der 'initialize-Funktion' der View A wird das Event 'statusPopup' registriert
     * var ViewA = Backbone.View.extend({
     *     initialize: function () {
     *         EventBus.on('statusPopup', this.statusPopup, this);
     *     },
     *     statusPopup: function (status) {
     *         // wird in View B das Event ausgelöst, passiert hier was
     *     }
     * });
     *
     * // Beim Aufrufen der 'getStatus-Funktion' der View B wird das Event ausgelöst.
     * var ViewB = Backbone.View.extend({
     *     getStatus: function () {
     *         EventBus.trigger('statusPopup');
     *     }
     * });
     * @see {@link http://backbonejs.org/#Events}
     * @see {@link http://www.sethmcl.com/cross-view-communication-with-backbonejs-None.html}
     */
    var EventBus = {};
    return _.extend(EventBus, Backbone.Events);  // http://underscorejs.org/#extend
});