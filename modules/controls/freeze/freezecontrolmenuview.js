define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        FreezeControlTemplate = require("text!modules/controls/freeze/templateControl.html"),
        $ = require("jquery"),
        Radio = require("backbone.radio"),
        FreezeControlViewMenu;

    FreezeControlViewMenu = Backbone.View.extend({
        collection: {},
        id: "freeze-view-menu",
        className: "table-tool freeze-view-start",
        template: _.template(FreezeControlTemplate),
        uiStyle: "DEFAULT",
        events: {
            "click .freeze-view-start": "toggleFreezeWindow"
        },
        initialize: function (model) {
            console.log(this.model);

            if (this.uiStyle === "TABLE") {
                this.listenTo(Radio.channel("MenuLoader"), {
                    "ready": function () {
                        this.renderToToolbar();
                    }
                });
            }
            else {
                this.renderAsControl();
            }
        },
        renderAsControl: function () {
            //ToDo hier noch das Control einfügen
        },
        renderToToolbar: function () {
            //$("#table-tools-menu").append("<div id='table-tool' class='table-tool freeze-view-start'>" + this.tooltemplate({name: "Ansicht einfrieren", glyphicon: "icon-close"}) + "</div>");
            $(this.$el).html(this.template({name: "Ansicht einfrieren", glyphicon: "icon-close"}));
            $("#table-tools-menu").append(this.$el);
        },
        toggleFreezeWindow: function () {
            this.model.startFreezeWin();
        }
    });
        return FreezeControlViewMenu;
});
