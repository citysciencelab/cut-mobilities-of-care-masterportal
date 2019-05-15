import TemplateSearch from "text-loader!./templateSearch.html";
import TemplateTree from "text-loader!./templateTree.html";
import TemplateMeasureTool from "text-loader!./templateMeasureTool.html";
import QuickHelpModel from "./model";
import "jquery-ui/ui/widgets/draggable";

/**
 * @member TemplateSearch
 * @description Template used to create the quickhelp for Search
 * @memberof Quickhelp
 */

/**
 * @member TemplateTree
 * @description Template used to create the quickhelp for Tree Search
 * @memberof Quickhelp
 */

/**
 * @member TemplateMeasureTool
 * @description Template used to create the quickhelp for the measure tool
 * @memberof Quickhelp
 */
const QuickHelpView = Backbone.View.extend(/** @lends QuickHelpView.prototype */{
    events: {
        "click .glyphicon-remove": "removeWindow",
        "click .glyphicon-print": "printHelp"
    },

    /**
     * Initialises the QuickHelp
     * @class QuickHelpView
     * @extends Backbone.View
     * @memberof Quickhelp
     * @constructs
     * @param   {boolean | object} attr Configuration
     * @deprecated Boolean-Examines if true. Deprecated in Version 3.0 due to dedicated path pass
     * @listens Quickhelp#RadioTriggerQuickhelpShowWindowHelp
     * @listens Quickhelp#RadioRequestQuickhelpIsSet
     * @listens Quickhelp#render
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
            });

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

    /**
     * Renders the data to DOM.
     * @return {Quickhelp} returns this
     */
    render: function () {
        $("body").append(this.$el);
        return this;
    },

    /**
     * Remove the window
     * @return {void}
     */
    removeWindow: function () {
        this.$el.hide("slow");
    },

    /**
     * showWindow
     * @param {String} value Type of window (search | tree | measure)
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

    /**
     * Opens the print window
     * @return {void}
     */
    printHelp: function () {
        var htmlToPrint = document.getElementsByClassName("quick-help-window")[0],
            newWin = window.open("");

        newWin.document.write(htmlToPrint.outerHTML);
        newWin.print();
    }
});

export default QuickHelpView;
