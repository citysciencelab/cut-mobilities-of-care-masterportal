import Template from "text-loader!./template.html";

const ContactView = Backbone.View.extend(/** @lends ContactView.prototype */{
    events: {
        "keyup #contactName": "setUserAttributes",
        "keyup #contactEmail": "setUserAttributes",
        "keyup #contactTel": "setUserAttributes",
        "keyup #contactText": "setUserAttributes",
        "click .contactButton": "send"
    },
    /**
     * @class ContactView
     * @extends Backbone.View
     * @memberof Contact
     * @constructs
     * @listens ContactModel#changeIsActive
     * @listens ContactModel#changeInvalid
     */
    initialize: function () {
        this.template = _.template(Template);
        this.listenTo(this.model, {
            "change:isActive": this.handleIsActive,
            "invalid": this.showValidity
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }
    },

    /**
     * Renders contact tool
     * @param {ContactModel} model Contact model
     * @param {Boolean} value Flag to show if contact is active
     * @returns {void}
     */
    render: function () {
        const model = this.model,
            isActive = model.get("isActive");

        if (isActive) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.setMaxHeight();
            this.delegateEvents();
        }
        return this;
    },

    /**
     * Registers at the window for resize if the tool is active and satartet render.
     * Otherwise the registry is removed
     * @param {Backbone.Model} model - contact model
     * @param {Boolean} value - represents if this tool is active
     * @returns {void}
     */
    handleIsActive: function (model, value) {
        var channel = this.model.get("channel");

        if (value) {
            this.model.set("resizeWindowHandler", this.render.bind(this));
            channel.trigger("registerListener", "resize", this.model.get("resizeWindowHandler"));
            this.render();
        }
        else {
            channel.trigger("unregisterListener", "resize", this.model.get("resizeWindowHandler"));
        }
    },

    /**
     * Sets the maximum height. Uses window.offset and the height of the menu and footer
     * @returns {void}
     */
    setMaxHeight: function () {
        var height = document.getElementsByClassName("lgv-container")[0].offsetHeight - 130;

        this.$el.css("max-height", height);
        this.$el.css("max-width", 400);
    },

    /**
     * Sets user attributes by user input
     * @param {KeyboardEvent} evt Keyup event
     * @returns {void}
     */
    setUserAttributes: function (evt) {
        this.model.setUserAttributes(evt);
    },

    /**
     * Sends email
     * @returns {void}
     */
    send: function () {
        this.model.send();
    },

    /**
     * Shows if the users inputs are valid
     * @returns {void}
     */
    showValidity: function () {
        var errors = this.model.validationError;

        if (_.isObject(this.model.validationError)) {

            this.toggleUserNameValid(errors.userName);
            this.toggleUserEmailValid(errors.userEmail);
            this.toggleUserTelValid(errors.userTel);
            this.toggleTextValid(errors.text);
            this.toggleSendButton(false);
        }
        else if (this.model.validationError === true) {
            this.toggleUserNameValid(true);
            this.toggleUserEmailValid(true);
            this.toggleUserTelValid(true);
            this.toggleTextValid(true);
            this.toggleSendButton(true);
        }
    },

    /**
     * Activates or deactivates the send button
     * @param {Boolean} val Flag if User can send the email. Email can only be sended when all input fields are valid
     * @returns {void}
     */
    toggleSendButton: function (val) {
        if (val === true) {
            this.$(".contactButton").removeClass("disabled");
        }
        else {
            this.$(".contactButton").addClass("disabled");
        }
    },

    /**
     * Shows or hides error messages on userName
     * @param {Boolean} val  Flag if userName input is valid
     * @returns {void}
     */
    toggleUserNameValid: function (val) {
        if (val === true) {
            this.$("#contactNameDiv").addClass("has-success");
            this.$("#contactNameDiv").removeClass("has-error");
            this.$("#contactNameFeedback").removeClass("contactHide");
            this.$("#contactNameLabel").addClass("contactHide");
        }
        else {
            this.$("#contactNameDiv").removeClass("has-success");
            this.$("#contactNameDiv").addClass("has-error");
            this.$("#contactNameFeedback").addClass("contactHide");
            this.$("#contactNameLabel").removeClass("contactHide");
        }
    },

    /**
     * Shows or hides error messages on userEmail
     * @param {Boolean} val  Flag if userEmail input is valid
     * @returns {void}
     */
    toggleUserEmailValid: function (val) {
        if (val === true) {
            this.$("#contactEmailDiv").addClass("has-success");
            this.$("#contactEmailDiv").removeClass("has-error");
            this.$("#contactEmailFeedback").removeClass("contactHide");
            this.$("#contactEmailLabel").addClass("contactHide");
        }
        else {
            this.$("#contactEmailDiv").removeClass("has-success");
            this.$("#contactEmailDiv").addClass("has-error");
            this.$("#contactEmailFeedback").addClass("contactHide");
            this.$("#contactEmailLabel").removeClass("contactHide");
        }
    },

    /**
     * Shows or hides error messages on userTel
     * @param {Boolean} val  Flag if userTel input is valid
     * @returns {void}
     */
    toggleUserTelValid: function (val) {
        if (val === true) {
            this.$("#contactTelDiv").addClass("has-success");
            this.$("#contactTelDiv").removeClass("has-error");
            this.$("#contactTelFeedback").removeClass("contactHide");
            this.$("#contactTelLabel").addClass("contactHide");
        }
        else {
            this.$("#contactTelDiv").removeClass("has-success");
            this.$("#contactTelDiv").addClass("has-error");
            this.$("#contactTelFeedback").addClass("contactHide");
            this.$("#contactTelLabel").removeClass("contactHide");
        }
    },

    /**
     * Shows or hides error messages on userText
     * @param {Boolean} val  Flag if userText input is valid
     * @returns {void}
     */
    toggleTextValid: function (val) {
        if (val === true) {
            this.$("#textDiv").addClass("has-success");
            this.$("#textDiv").removeClass("has-error");
            this.$("#contactTextFeedback").removeClass("contactHide");
        }
        else {
            this.$("#textDiv").removeClass("has-success");
            this.$("#textDiv").addClass("has-error");
            this.$("#contactTextFeedback").addClass("contactHide");
        }
    }
});

export default ContactView;
