/**
@Discription Stellt das Tool-fenster da, in dem ein WMS per URL angefordert werden kann
@Author: RL
**/

define([
    "jquery",
    "backbone",
    "text!modules/tools/addwms/template.html",
    "modules/tools/addwms/model"
], function ($, Backbone, AddWMSWin, AddWMSModel) {

    var AddWMSView = Backbone.View.extend({
        model: AddWMSModel,
        template: _.template(AddWMSWin),
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
            this.listenTo(this.model, "change:wmsURL", this.urlChange);
        },
        events: {
            "click #addWMSButton": "loadAndAddLayers",
            "keydown": "keydown"
        },
        // Löst das laden und einfügen der Layer in den Baum aus
        loadAndAddLayers: function () {
            this.model.loadAndAddLayers();
        },
        // abschicken per Enter-Taste
        keydown: function (e) {
            var code = e.keyCode;

            if (code === 13) {
                this.loadAndAddLayers();
            }
        },
        // Rendert das Tool-Fenster
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
