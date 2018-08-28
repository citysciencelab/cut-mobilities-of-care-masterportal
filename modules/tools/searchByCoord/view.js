define(function (require) {

    var SearchByCoordTemplate = require("text!modules/tools/searchByCoord/template.html"),
        SearchByCoord = require("modules/tools/searchByCoord/model"),
        $ = require("jquery"),
        SearchByCoordView;

    SearchByCoordView = Backbone.View.extend({
        events: {
            "change #coordSystemField": "setCoordSystem",
            "click button": "setCoordinates"
        },
        initialize: function (attr) {
            this.model = new SearchByCoord(attr);
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:coordSystem": this.setFocusToCoordSystemInput
            });
        },
        className: "win-body",
        template: _.template(SearchByCoordTemplate),

        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
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
