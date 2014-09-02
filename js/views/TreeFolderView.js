define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeFolder.html',
    'models/TreeFolder',
    'bootstrap'
], function ($, _, Backbone, TreeFolderTemplate, TreeFolder) {

    var TreeFolderView = Backbone.View.extend({
        model: TreeFolder,
        className: 'panel panel-default',
        template: _.template(TreeFolderTemplate),
        initialize: function () {
            this.render();
        },
        events: {
            'click .glyphicon-check, .glyphicon-unchecked': 'toggleVisibility',
            'click .glyphicon-chevron-right, .glyphicon-chevron-down': 'toggleExpanding'
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        toggleVisibility: function (evt) {
            this.model.toggleVisibility();
        },
        toggleExpanding: function (evt) {
            this.model.toggleExpanding();
            $(evt.target).toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
        }
    });

    return TreeFolderView;
});