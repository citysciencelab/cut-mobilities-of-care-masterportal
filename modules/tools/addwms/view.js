/**
@Discription Stellt das Tool-fenster da, in dem ein WMS per URL angefordert werden kann
@Author: RL
**/

define(function (require) {
    var AddWMSWin = require("text!modules/tools/addwms/template.html"),
        AddWMSView;

    AddWMSView = Backbone.View.extend({
        template: _.template(AddWMSWin),
        initialize: function () {
            this.listenTo(this.model, {
                "change:wmsURL": this.urlChange,
                "change:isActive": this.render
            });
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
        render: function (model, value) {
            if (value) {
                this.setElement(document.getElementsByClassName("win-body")[0]);
                this.$el.html(this.template(model.toJSON()));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        }
    });

    return AddWMSView;

});
