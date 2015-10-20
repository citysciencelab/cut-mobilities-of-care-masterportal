define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/addwms/template.html",
    "modules/addwms/model"
], function ($, _, Backbone, AddWMSWin, AddWMSModel) {

    var AddWMSView = Backbone.View.extend({
        model: AddWMSModel,
        template: _.template(AddWMSWin),
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
            this.listenTo(this.model, "change:wmsURL", this.urlChange);
        },
        events: {
            "click #addWMSButton": "loadAndAddLayers",
            "click #addLayersButton": "addLayers",
            "keydown": "keydown"
        },
        loadAndAddLayers: function () {
            this.model.loadAndAddLayers();
        },
        keydown: function (e) {
            var code = e.keyCode;

            if (code === 13) {
                this.loadAndAddLayers();
            }
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        }
    });

    return AddWMSView;

});
