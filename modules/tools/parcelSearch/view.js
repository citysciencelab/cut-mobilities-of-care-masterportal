define([
    "backbone",
    "text!modules/tools/parcelSearch/template.html",
    "modules/tools/parcelSearch/model"
], function (Backbone, parcelSearchTemplate, ParcelSearch) {

    var ParcelSearchView = Backbone.View.extend({
        model: new ParcelSearch(),
        className: "win-body",
        template: _.template(parcelSearchTemplate),
        events: {
            "change #districtField": "setDistrictNumber",
            "keyup #parcelField": "setParcelNumber",
            "click button": "validateParcelNumber"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:districtNumber": this.setFocusToParcelInput
            });
        },
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
        },
        setDistrictNumber: function () {
            this.model.setDistrictNumber($("#districtField").val());
        },
        setParcelNumber: function (evt) {
            this.model.setParcelNumber(evt.target.value);
        },
        setFocusToParcelInput: function () {
            $("#parcelField").focus();
        },
        validateParcelNumber: function () {
            this.model.validateParcelNumber();
        }
    });

    return ParcelSearchView;
});
