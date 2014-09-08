define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Menubar.html',
    'views/WMSLayerListView',
    'models/Menubar',
    'config',
], function ($, _, Backbone, MenubarTemplate, WMSLayerListView, Menubar, Config) {

    var MenubarView = Backbone.View.extend({
        model: Menubar,
        tagName: 'nav',
        className: 'navbar navbar-default navbar-fixed-top',
        attributes: {"role": "navigation"},
        template: _.template(MenubarTemplate),
        initialize: function () {
            this.render();
            $('#tree').on({
                "click": function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            var attr = this.model.toJSON();
            $('body').append(this.$el.append(this.template(attr)));
            if(Config.isMenubarVisible === false) {
                $('#navbarRow').css('display', 'none');
            }
//            new TreefolderListView();
            new WMSLayerListView();
        }
    });

    return MenubarView;

});
