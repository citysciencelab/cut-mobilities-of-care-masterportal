define([
    'underscore',
    'backbone',
    'models/wfsstyle',
    'config'
], function (_, Backbone, WFSStyle, Config) {

    var StyleList = Backbone.Collection.extend({
        model: WFSStyle,
        parse: function (response) {
            var idArray = new Array ();
            for (i in Config.layerstyle) {
                idArray.push(Config.layerstyle[i].style);
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
