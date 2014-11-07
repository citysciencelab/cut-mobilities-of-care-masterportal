define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Menubar.html',
    'views/LayerListView',
    'models/Menubar',
    'config',
    'eventbus'
], function ($, _, Backbone, MenubarTemplate, LayerListView, Menubar, Config, EventBus) {

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
        events: {
            'click .filterTree': 'activateFilterTree',
            'click .legend': 'activateLegend'
        },
        render: function () {
            var attr = this.model.toJSON();
            $('body').append(this.$el.append(this.template(attr)));
            if(Config.isMenubarVisible === false) {
                $('#navbarRow').css('display', 'none');
            }
//            new TreefolderListView();
            new LayerListView();
        },
        activateFilterTree: function () {
            EventBus.trigger('toggleFilterTreeWin');
        },
        activateLegend: function () {
            EventBus.trigger('toggleLegendWin');
        }
    });

    return MenubarView;

});
