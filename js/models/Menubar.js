define([
    'underscore',
    'backbone',
    'config'
], function (_, Backbone, Config) {

    var Menubar = Backbone.Model.extend({
        initialize: function () {
            _.each(Config.menu, this.setAttributes, this);
            // Wenn nur ein Tool aktiviert ist, wird der Menüeintrag Werkzeuge nicht erzeugt. --> Abfrage im template
            var oneTool = _.filter(_.values(Config.tools), function (value) {
                return value == true;
            });
            if (oneTool.length === 1) {
                this.set('oneTool', true);
            }
            else {
                this.set('oneTool', false);
            }
        },
        setAttributes: function (value, key) {
            this.set(key, value);
        }
    });

    return new Menubar();
});
