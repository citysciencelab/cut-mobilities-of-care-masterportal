import GraphicalSelectView from "../../snippets/graphicalSelect/view";
import ResultView from "./resultView";
import Template from "text-loader!./selectTemplate.html";
import SnippetCheckBoxView from "../../snippets/checkbox/view";

/**
 * @member Template
 * @description Template used to create the population tool
 * @memberof Tools.EinwohnerAbfrage_HH
 */

const SelectView = Backbone.View.extend(/** @lends SelectView.prototype */{
    /**
     * @class SelectView
     * @extends Backbone.View
     * @memberof Tools.Einwohnerabfrage_hh
     * @constructs
     * @listens Tools.Einwohnerabfrage_hh#ChangeIsActive
     * @listens Tools.Einwohnerabfrage_hh#RenderResult
     * @fires Core#RadioRequestUtilGetPathFromLoader
     */
    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            "renderResult": this.renderResult
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.render
        });
        this.snippetDropdownView = new GraphicalSelectView({model: this.model.get("snippetDropdownModel")});
        this.checkBoxRaster = new SnippetCheckBoxView({model: this.model.get("checkBoxRaster")});
        this.checkBoxAddress = new SnippetCheckBoxView({model: this.model.get("checkBoxAddress")});
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }

        this.model.setLoaderPath(Radio.request("Util", "getPathFromLoader"));
    },
    id: "einwohnerabfrage-tool",

    /**
     * @member Template
     * @description Template used to create SelectView for Einwohnerabfrage_hh
     * @memberof Filter/Source
     * @returns {void}
     */
    template: _.template(Template),
    snippetDropdownView: {},

    /**
     * render the temlpate
     * @param {*} model not used
     * @param {Boolean} value this view is active
     * @returns {this} this view
     */
    render: function (model, value) {
        const attr = this.model.toJSON(),
              prefixSelect = "common:modules.tools.populationRequest.select.";

        if (value) {
            attr.info = i18next.t(prefixSelect+"info");
            this.checkBoxAddress.model.set("label", i18next.t(prefixSelect+"showAlkisAdresses"));
            this.checkBoxRaster.model.set("label", i18next.t(prefixSelect+"showRasterLayer"));
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.$el.find(".dropdown").append(this.snippetDropdownView.render().el);
            this.$el.find(".checkbox").append(this.checkBoxRaster.render().el);
            this.$el.find(".checkbox").append(this.checkBoxAddress.render().el);
        }
        else {
            this.model.reset();
            this.undelegateEvents();
        }

        return this;
    },

    /**
     * render the resultView
     * @returns {void}
     */
    renderResult: function () {
        this.$el.find(".result").html("");
        this.$el.find(".result").append(new ResultView({model: this.model}).render().el);
    }
});

export default SelectView;
