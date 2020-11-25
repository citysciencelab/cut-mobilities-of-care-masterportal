import SearchByCoordTemplate from "text-loader!./template.html";
import store from "../../../src/app-store";

const SearchByCoordView = Backbone.View.extend({
    events: {
        "change #coordSystemField": "setCoordSystem",
        "click button": "setCoordinates"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:coordSystem": this.setFocusToCoordSystemInput,
            "change:coordSystemField change:hdmsEastingLabel change:hdmsNorthingLabel change:cartesianEastingLabel change:cartesianNorthingLabel": function () {
                if (this.model.get("isActive")) {
                    this.render(this.model, true);
                }
            }
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    template: _.template(SearchByCoordTemplate),
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            store.dispatch("MapMarker/removePointMarker");
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
        this.render(this.model, true);
    },
    validateCoords: function () {
        this.model.validateCoordinates();
    }
});

export default SearchByCoordView;
