define(function (require) {
    var template = require("text!modules/tools/schulwegRouting_hh/template.html"),
        templateHitlist = require("text!modules/tools/schulwegRouting_hh/templateHitlist.html"),
        Model = require("modules/tools/schulwegRouting_hh/model"),
        SchulwegRoutingView;

    require("bootstrap-toggle");
    require("bootstrap-select");

    SchulwegRoutingView = Backbone.View.extend({
        model: new Model(),
        className: "schulweg-routing",
        template: _.template(template),
        templateHitlist: _.template(templateHitlist),
        events: {
            "keyup .address-search": "searchAddress",
            "focusout .address-search": "hideHitlist",
            "focusin .address-search": "showHitlist",
            // This event fires after the select's value has been changed
            "changed.bs.select": "updateSelectedValues"
        },
        initialize: function (attr) {
            this.listenTo(this.model, {
                "change:schoolNames": this.render,
                "change:streetNames": this.renderHitlist,
                "change:houseNumbers": this.renderHitlist
            });
            // Target wird in der app.js übergeben
            this.domTarget = attr.domTarget;

            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: "8712"});
            this.model.sortSchoolsByName("8712", layerModel.get("layer").getSource().getFeatures());
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initToogle();
            this.initSelectpicker();
            this.domTarget.append(this.$el);
        },

        initToogle: function () {
            this.$el.find("#regional-school").bootstrapToggle({
                on: "Ja",
                off: "Nein",
                size: "small"
            });
        },

        initSelectpicker: function () {
            this.$el.find(".selectpicker").selectpicker({
                width: "100%",
                selectedTextFormat: "value",
                size: 6
            });
        },

        renderHitlist: function () {
            var attr = this.model.toJSON();

            this.$el.find(".hit-list").empty();
            this.$el.find(".input-group").after(this.templateHitlist(attr));
        },

        hideHitlist: function () {
            this.$el.find(".hit-list").hide();
        },

        showHitlist: function () {
            this.$el.find(".hit-list").show();
        },

        searchAddress: function (evt) {
            if (evt.target.value.length > 2) {
                Radio.trigger("Gaz", "findStreets", evt.target.value);
            }
            // if (this.model.get("streetNames").length === 1) {
                // dann suche in housenumbers
                // oder siehe searchInHouseNumbers in gaz
            // }
        },

        updateSelectedValues: function () {
            console.log(54);
        }
    });

    return SchulwegRoutingView;
});
