define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        Model = require("modules/controls/totalview/model"),
        TotalView;

    TotalView = Backbone.View.extend({
        template: _.template("<div class='total-view-button'><span class='glyphicon glyphicon-fast-backward' title='Gesamtansicht anzeigen'></span></div>"),
        tabletemplate: _.template("<div class='total-view-menuelement'><span class='glyphicon icon-home'></span></br>Hauptansicht</div>"),
        model: new Model(),
        id: "totalview",
        events: {
            "click": "setTotalView"
        },
        initialize: function () {
            var style = Radio.request("Util", "getUiStyle"),
                el;

            if (style === "DEFAULT") {
                el = Radio.request("ControlsView", "addRowTR", "totalview");
                this.setElement(el[0]);
                this.render();
            }
            else if (style === "TABLE") {
                this.listenTo(Radio.channel("MenuLoader"), {
                    "ready": function () {
                        this.setElement("#table-tools-menu");
                        this.renderToToolbar();
                    }
                });
            }

        },
        render: function () {
            this.$el.html(this.template());
        },
        renderToToolbar: function () {
            $("#table-tools-menu").prepend(this.tabletemplate());
        },
        setTotalView: function () {
            var center = this.model.getStartCenter(),
                zoomlevel = this.model.getZoomLevel();

            Radio.trigger("MapView", "setCenter", center, zoomlevel);
        }

    });

    return TotalView;
});
