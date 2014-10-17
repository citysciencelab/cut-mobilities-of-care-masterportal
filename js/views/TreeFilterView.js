define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeFilter.html',
    'eventbus',
    'models/TreeFilter'
], function ($, _, Backbone, TreeFilterTemplate, EventBus, TreeFilter) {

    var TreeFilterView = Backbone.View.extend({
        model: TreeFilter,
        id: 'treeFilterWin',
        className: 'panel panel-treeFilter',
        template: _.template(TreeFilterTemplate),
        initialize: function () {
            this.render();
            EventBus.on('toggleFilterTreeWin', this.toggleFilterTreeWin, this);
            this.listenTo(this.model, 'change:showContent', this.render);
        },
        events: {
            'click .glyphicon-chevron-up': 'hideContent',
            'click .glyphicon-chevron-down': 'showContent',
            'click .close': 'toggleFilterTreeWin'
        },
        render: function () {
            var attr = this.model.toJSON();
             $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        hideContent: function () {
            this.model.set('showContent', false);
        },
        showContent: function () {
            this.model.set('showContent', true);
        },
        toggleFilterTreeWin: function () {
            $('#treeFilterWin').toggle();
        }
    });

    return TreeFilterView;
});
