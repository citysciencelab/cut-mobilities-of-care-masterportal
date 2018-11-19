import TemplateSearch from "text-loader!./templateSearch.html";
import TemplateTree from "text-loader!./templateTree.html";
import TemplateMeasureTool from "text-loader!./templateMeasureTool.html";
import QuickHelpModel from "./model";
import "jquery-ui/ui/widgets/draggable";

const quickHelpView = Backbone.View.extend({
    events: {
        "click .glyphicon-remove": "removeWindow",
        "click .glyphicon-print": "printHelp"
    },

    /**
     * Initialisiert die QuickHelp
     * @param   {boolean | object} attr Konfiguration
     * @deprecated Boolean-Prüfung auf true entfällt mit Version 3.0 zwecks dedizierter Path-Übergabe
     * @returns {void}
     */
    initialize: function (attr) {
        var channel = Radio.channel("Quickhelp");

        if (attr === true || _.isObject(attr)) {
            this.model = new QuickHelpModel(attr);            

            channel.on({
                "showWindowHelp": this.showWindow
            }, this);

            channel.reply({
                "isSet": true
            })

            this.render();

            this.$el.draggable({
                containment: "#map",
                handle: ".header"
            });
        }
    },
    templateSearch: _.template(TemplateSearch),
    templateTree: _.template(TemplateTree),
    templateMeasureTool: _.template(TemplateMeasureTool),
    className: "quick-help-window ui-widget-content",
    render: function () {
        $("body").append(this.$el);
        return this;
    },
    removeWindow: function () {
        this.$el.hide("slow");
    },

    /**
     * [showWindow description]
     * @param {[type]} value [description]
     * @returns {void}
     */
    showWindow: function (value) {
        var attr = this.model.toJSON();

        switch (value) {
            case "search": {
                this.$el.html(this.templateSearch(attr));
                break;
            }
            case "tree": {
                this.$el.html(this.templateTree(attr));
                break;
            }
            case "measure": {
                this.$el.html(this.templateMeasureTool(attr));
                break;
            }
            default: {
                break;
            }
        }
        this.$el.show("slow");
    },

    printHelp: function () {
        var htmlToPrint = document.getElementsByClassName("quick-help-window")[0],
            newWin = window.open("");

        newWin.document.write(htmlToPrint.outerHTML);
        newWin.print();
    }
});

export default quickHelpView;
