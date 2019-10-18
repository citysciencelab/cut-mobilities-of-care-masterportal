import Template from "text-loader!./template.html";
import SnippetDropdownView from "../dropdown/view";
import "bootstrap-select";
/**
 * @member Template
 * @description Template for GraphicalSelectView Snippet
 * @memberof Snippets.GraphicalSelect
 */
const GraphicalSelectView = Backbone.View.extend(/** @lends GraphicalSelectView.prototype */{
    /**
     * @class GraphicalSelectView
     * @extends Backbone.View
     * @memberof Snippets.Dropdown
     * @constructs
     */
    events: {
        "changed.bs.select": "createDrawInteraction",
    },

    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "removeView": this.removeView
        });
        if(this.model){
            this.snippetDropdownView = new SnippetDropdownView({model: this.model.get("snippetDropdownModel")});
        }
    },
    template: _.template(Template),
    snippetDropdownView: {},

    /**
     * renders the view depending on the isOpen attribute
     * @return {Object} - this
     */
    render: function () {
        let attr;
        if (this.model.get("isOpen") === false) {
            attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            this.initDropdown();
        }
        this.delegateEvents();
        return this;
    },

    /**
     * inits the dropdown list
     * @see {@link http://silviomoreto.github.io/bootstrap-select/options/|Bootstrap-Select}
     * @returns {void}
     */
    initDropdown: function () {
        this.$el.find(".graphical-select").append(this.snippetDropdownView.render().el);
    },

    /**
     * create draw interaction
     * @param {*} evt todo
     * @returns {void}
     */
    createDrawInteraction: function (evt) {
        const geographicValues = this.model.get("geographicValues");
        for (let prop in geographicValues) {
            if(prop === evt.target.title){
                if( this.model.get("drawInteraction")){
                    this.model.get("drawInteraction").setActive(false);
                }
                this.model.createDrawInteraction(evt.target.value);
                break;
            }
        }
    },
    /**
     * calls the function "setIsOpen" in the model with parameter false
     * removes this view and its el from the DOM
     * @returns {void}
     */
    removeView: function () {
        this.model.resetView();
        this.model.setIsOpen(false);
        this.remove();
    }

});

export default GraphicalSelectView;
