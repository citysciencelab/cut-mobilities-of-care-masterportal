/**
@Discription Stellt das Tool-fenster da, in dem ein WMS per URL angefordert werden kann
@Author: RL
**/

define(function (require) {
    var $ = require("jquery"),
        AddWMSWin = require("text!modules/tools/addwms/template.html"),
        AddWMSModel = require("modules/tools/addwms/model"),
        AddWMSView;

    AddWMSView = Backbone.View.extend({
        events: {
            "click #addWMSButton": "loadAndAddLayers",
            "keydown": "keydown"
        },
        initialize: function (attr) {
            this.model = new AddWMSModel(attr);
            this.listenTo(this.model, {
                "change:wmsURL": this.urlChange,
                "change:isCollapsed": this.render,
                "change:isCurrentWin": this.render
            });
        },
        template: _.template(AddWMSWin),
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
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
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
