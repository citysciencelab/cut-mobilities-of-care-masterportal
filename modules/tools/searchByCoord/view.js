define(function (require) {

    var SearchByCoordTemplate = require("text!modules/tools/searchByCoord/template.html"),
        SearchByCoordView;

    SearchByCoordView = Backbone.View.extend({
        events: {
            "change #coordSystemField": "setCoordSystem",
            "click button": "setCoordinates"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isActive": this.render,
                "change:coordSystem": this.setFocusToCoordSystemInput
            });
        },
        template: _.template(SearchByCoordTemplate),
        render: function (model, value) {
            if (value) {
                this.setElement(document.getElementsByClassName("win-body")[0]);
                this.$el.html(this.template(model.toJSON()));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },
        setCoordSystem: function () {
            this.model.setCoordSystem(this.$("#coordSystemField").val());
        },
        setCoordinates: function (evt) {
            if (evt.keyCode === 13) {
                this.model.validateCoordinates();
            }
            this.model.setCoordinates(this.$("#coordinatesEastingField").val().replace(",", "."), this.$("#coordinatesNorthingField").val().replace(",", "."));
        },
        setFocusToCoordSystemInput: function () {
            this.$("#coordSystemField").focus();
            this.render();
        },
        validateCoords: function () {
            this.model.validateCoordinates();
        }
    });

    return SearchByCoordView;
});
