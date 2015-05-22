define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'config'
], function ($, _, Backbone, EventBus, Config) {

    var formularView = Backbone.View.extend({
        id: 'formularWin',
        className: 'win-body',
        initialize: function (formularmodel, templatePath) {
            this.model = formularmodel;
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
            this.template = _.template(templatePath);
        },
        events: {
            'click #filterbutton': 'getFilterInfos'
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.model.prep();
                var attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            } else if (this.model.get("isCurrentWin") === false) {
                this.model.reset();
            }
        }
    });

    return formularView;
});
