import Template from "text-loader!./templateConcepts.html";
import "./style.less";

const ViewConcepts = Backbone.View.extend({
    events: {
        "click span": "showConcept",
        "click .startFlight": "startFlight",
        "click .stopFlight": "stopFlight",
        "click #table-nav-concepts-panel-toggler": "toggleConceptsMenu",
        "click [type='checkbox']": "toggleCheckbox"
    },

    /**
     * Initialize View
     * @param {Object} model the model for this view
     * @listens FlightPlayer#RadioTriggerFlightPlayerStateChange
     * @listens TableMenu#RadioTriggerTableMenuHideMenuElementConcepts
     * @listens Map#RadioTriggerMapChange
     * @returns {void}
     */
    initialize: function (model) {
        this.listenTo(Radio.channel("Map"), {
            "change": this.changeMap
        });

        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementConcepts": this.hideConceptsMenu
        });

        this.listenTo(Radio.channel("FlightPlayer"), {
            "stateChange": this.togglePlayButton
        });

        this.model = model;
        $("#table-category-list").remove();
        this.render();
        this.showConceptsMenu();
    },
    template: _.template(Template),
    className: "table-nav col-md-1",
    id: "table-concepts",
    /**
     * Adds an return to overview link on the left-hand side
     * @returns {this} this
     */
    render: function () {
        const attr = this.model.toJSON();

        $("#table-nav").children().first().after(this.$el.html(this.template(attr)));
        if (Radio.request("TableMenu", "getActiveElement") === "Concepts") {
            this.$("#table-nav-concepts-panel").collapse("show");
        }
        return this;
    },

    /**
     * Is called when user toggles it's checkbox. Forwarding to model method.
     * @param   {jQuery.Event} evt Event of clicked checkbox
     * @returns {void}
     */
    toggleCheckbox: function (evt) {
        const newState = evt.currentTarget.checked;

        this.model.toggleStadtmodell(newState);
    },

    /**
     * Is called when user chooses a concept of interesst. Forwarding to model method.
     * @param   {jQuery.Event} evt Event of clicked concept
     * @returns {void}
     */
    showConcept: function (evt) {
        const conceptId = evt.target.nodeName === "LI" ? evt.target.id : evt.target.parentElement.id;

        this.workWithBullets(evt);
        this.model.triggerShowConcept(conceptId);
    },

    /**
     * Handles the bullet toggeling in the list of concepts
     * @param   {jQuery.Event}   evt Event of clicked concept
     * @returns {void}
     */
    workWithBullets: function (evt) {
        this.$(".concept_list span").removeClass("bauforum-icon-bullet_checked");
        this.$(".concept_list span").addClass("bauforum-icon-bullet");
        this.$(".concept_list .startFlight").addClass("disabled");
        this.$(".concept_list .startFlight").removeClass("hidden");
        this.$(".concept_list .stopFlight").addClass("hidden");
        this.$(evt.currentTarget).removeClass("bauforum-icon-bullet");
        this.$(evt.currentTarget).addClass("bauforum-icon-bullet_checked");
        this.$(evt.currentTarget.parentElement).find(".startFlight").removeClass("disabled");
    },

    changeMap: function (map) {
        if (map === "2D") {
            const listItems = document.querySelectorAll(".concept_list li");

            for (let i = 0; i < listItems.length; i++) {
                this.$("#" + listItems[i].id + " > span").removeClass("bauforum-icon-bullet_checked");
                this.$("#" + listItems[i].id + " > span").addClass("bauforum-icon-bullet");
            }
        }
    },

    /**
     * Handles the click event on flight button to start flight
     * @param   {jQuery.Event} evt button click event
     * @returns {void}
     */
    startFlight: function (evt) {
        const id = evt.currentTarget.parentElement.id;

        if (!this.$(evt.currentTarget).hasClass("disabled")) {
            this.model.triggerStartFlight(id);
        }
    },

    /**
     * Handles the click event on flight button to stop flight
     * @param   {jQuery.Event} evt button click event
     * @returns {void}
     */
    stopFlight: function (evt) {
        if (!this.$(evt.currentTarget).hasClass("disabled")) {
            this.model.triggerStopFlight();
        }
    },

    /**
     * Toggle this menu
     * @returns {void}
     */
    toggleConceptsMenu: function () {
        if (this.$("#table-nav-concepts-panel").hasClass("in")) {
            this.hideConceptsMenu();
        }
        else {
            this.showConceptsMenu();
        }
    },

    /**
     * Hides this menu
     * fires TableMenu#RadioTriggerTableMenuDeactivateCloseClickFrame
     * @returns {void}
     */
    hideConceptsMenu: function () {
        this.$("#table-nav-concepts-panel").removeClass("in");
        this.$el.removeClass("table-concepts-active");
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    },

    /**
     * Shows this menu
     * @fires TableMenu#RadioTriggerTableMenuSetActiveElement
     * @returns {void}
     */
    showConceptsMenu: function () {
        this.$el.addClass("table-concepts-active");
        this.$("#table-nav-concepts-panel").addClass("in");

        Radio.request("TableMenu", "setActiveElement", "Concepts");
    },

    /**
     * Toggles play and stop buttons according to flight state
     * @param   {boolean} state state of flight
     * @returns {void}
     */
    togglePlayButton: function (state) {
        const ele = this.$el.find(".bauforum-icon-bullet_checked");

        if (state === "play") {
            ele.parent().find(".startFlight").addClass("hidden");
            ele.parent().find(".stopFlight").removeClass("hidden");

            return;
        }
        ele.parent().find(".startFlight").removeClass("hidden");
        ele.parent().find(".stopFlight").addClass("hidden");
    }
});

export default ViewConcepts;
