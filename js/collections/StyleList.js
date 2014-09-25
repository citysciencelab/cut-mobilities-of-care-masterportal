define([
    'underscore',
    'backbone',
    'models/wfsstyle',
    'config'
], function (_, Backbone, WFSStyle, Config) {

    var StyleList = Backbone.Collection.extend({
        model: WFSStyle,
        parse: function (response) {
            /* Erzeuge nur von denen einen WfsStyle
            *  von denen auch in der Config-Datei
            *  ein Nennung vorliegt und nicht von allen
            *  Einträgen in der json-Datei
            */
            var idArray = new Array ();
            for (i in Config.wfsconfig) {
                idArray.push(Config.wfsconfig[i].style);
            }
            return _.filter(response, function (element) {
                if (_.contains(idArray, element.id)) {
                    return element;
                }
            });
        },
        url: Config.styleConf,
        initialize: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    console.log('Service Request failure');
                },
                success: function (collection) {
                    //console.log(collection);
                }
            });
        }
    });
    return new StyleList();
});
