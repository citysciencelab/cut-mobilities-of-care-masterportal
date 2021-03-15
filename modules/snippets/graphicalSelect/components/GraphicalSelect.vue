<script>
import Dropdown from "../../../src/share-components/dropdowns/DropdownSimple.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersGraphicalSelect";
import mutations from "../store/mutationsGraphicalSelect";
import actions from "../store/actionsGraphicalSelect";

export default {
    name: "GraphicalSelect",
    components: {
        Dropdown
    },

    computed: {
        ...mapGetters("GraphicalSelect", Object.keys(getters))
    },

    watch: {
    },

    /**
     * Created hook:
     * @returns {void}
     */
    /* created () {
    },*/

    /**
     * Mounted hook:
     * @returns {void}
     */
    /* mounted () {
    },*/

    methods: {
        ...mapMutations("GraphicalSelect", Object.keys(mutations)),
        ...mapActions("GraphicalSelect", Object.keys(actions)),

        initialize: function () {
            this.listenTo(this.model, {
                "render": this.render,
                "removeView": this.removeView
            });
            if (this.model) {
                // this.snippetDropdownView = new SnippetDropdownView({model: this.model.get("snippetDropdownModel")});
            }
        },
        /**
         * @description Template used to add the dropdown to
         * @memberof Snippets.GraphicalSelect
        */
        snippetDropdownView: {},

        /**
        * Renders the view depending on the isOpen attribute.
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
        * Inits the dropdown list.
        * @see {@link http://silviomoreto.github.io/bootstrap-select/options/|Bootstrap-Select}
        * @returns {void}
        */
        initDropdown: function () {
            this.$el.find(".graphical-select").append(this.snippetDropdownView.render().el);
        },

        /**
         * Creates draw interaction.
         * @param {*} evt contains the selection of the dropdown
         * @returns {void}
         */
        createDrawInteraction: function (evt) {
            const geographicValues = this.model.get("geographicValues");

            Object.keys(geographicValues).forEach(function (key) {
                if (key === evt.target.title) {
                    if (this.model.get("drawInteraction")) {
                        this.model.get("drawInteraction").setActive(false);
                    }
                    this.model.createDrawInteraction(this.model.id, evt.target.value);
                }
            }, this);
        },
        /**
        * Calls the function "setIsOpen" in the model with parameter false
        * removes this view and its el from the DOM and resets the draw interaction.
        * @returns {void}
        */
        removeView: function () {
            this.model.resetView(this.model.id);
            this.model.setIsOpen(false);
            this.remove();
        }
    }
};
</script>

<template>
    <form>
        <Dropdown
            v-model="selectedOption"
            :options="options"
        />
    </form>
</template>

<style lang="less" scoped>
</style>
