define(function (require) {
    var template = require("text!modules/tools/schulwegRouting_hh/template.html"),
        templateHitlist = require("text!modules/tools/schulwegRouting_hh/templateHitlist.html"),
        templateRouteResult = require("text!modules/tools/schulwegRouting_hh/templateRouteResult.html"),
        templateRouteDescription = require("text!modules/tools/schulwegRouting_hh/templateRouteDescription.html"),
        Model = require("modules/tools/schulwegRouting_hh/model"),
        SchulwegRoutingView;

    require("bootstrap-toggle");
    require("bootstrap-select");

    SchulwegRoutingView = Backbone.View.extend({
        model: new Model(),
        className: "schulweg-routing",
        template: _.template(template),
        templateHitlist: _.template(templateHitlist),
        templateRouteResult: _.template(templateRouteResult),
        templateRouteDescription: _.template(templateRouteDescription),
        events: {
            "keyup .address-search": "searchAddress",
            "click li.street": function (evt) {
                this.setAddressSearchValue(evt);
                this.$el.find(".address-search").focus();
                evt.stopPropagation();
            },
            "click li.address": function (evt) {
                this.setAddressSearchValue(evt);
                this.model.selectStartAddress(evt.target.textContent, this.model.get("addressListFiltered"));
                this.model.findRegionalSchool(this.model.get("startAddress"));
                this.model.prepareRequest(this.model.get("startAddress"));
            },
            "click .address-search": function (evt) {
                // stop event bubbling
                evt.stopPropagation();
            },
            "click": "hideHitlist",
            "focusin .address-search": "showHitlist",
            "click .close": "closeView",
            // Fires after the select's value (schoolList) has been changed
            "changed.bs.select": "selectSchool",
            "change .regional-school": "useRegionalSchool",
            "click .btn-route-desc": "toggleRouteDesc",
            "click .delete-route": "resetRoute"
        },
        initialize: function () {
            if (this.model.getIsActive()) {
                this.render();
            }
            this.listenTo(this.model, {
                "change:routeResult": this.renderRouteResult,
                "change:routeDescription": this.renderRouteDescription,
                "change:streetNameList": this.renderHitlist,
                "change:addressListFiltered": this.renderHitlist,
                "change:isActive": function (model, isActive) {
                    if (isActive) {
                        this.render();
                    }
                    else {
                        this.$el.remove();
                        Radio.trigger("Sidebar", "toggle", false);
                    }
                },
                "updateSelectedSchool": this.updateSelectedSchool,
                "resetRouteResult": this.resetRouteResult
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initToogle();
            this.initSelectpicker();
            this.setPresetValues();
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true);
            this.renderRouteResult();
            this.renderRouteDescription();
            this.delegateEvents();
        },
        setPresetValues: function () {
            var schoolID = _.isEmpty(this.model.get("selectedSchool")) ? undefined : this.model.get("selectedSchool").get("schul_id");

            this.setStartAddress();
            if (!_.isUndefined(schoolID)) {
                this.updateSelectedSchool(schoolID);
            }
        },
        setStartAddress: function () {
            var startAddress = this.model.get("startAddress"),
                startStreet = "";

            if (!_.isEmpty(startAddress)) {
                startStreet = startAddress.street + " " + startAddress.number + startAddress.affix;
                this.$el.find(".address-search").attr("value", startStreet);
            }
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

            this.$el.find(".hit-list").html(this.templateHitlist(attr));
        },

        renderRouteResult: function () {
            var attr = this.model.toJSON();

            this.$el.find(".result-container").html(this.templateRouteResult(attr));
        },
        renderRouteDescription: function () {
            var attr = this.model.toJSON();

            this.$el.find(".description-container").html(this.templateRouteDescription(attr));
        },

        hideHitlist: function () {
            this.$el.find(".hit-list").hide();
        },

        showHitlist: function () {
            this.$el.find(".hit-list").show();
        },

        searchAddress: function (evt) {
            if (evt.target.value.length > 2) {
                this.model.searchAddress(evt.target.value);
            }
            else {
                this.model.setAddressListFiltered([]);
                this.model.setStartAddress({});
            }
        },

        setAddressSearchValue: function (evt) {
            this.$el.find(".address-search").val(evt.target.textContent);
            this.model.searchAddress(evt.target.textContent);
        },
        closeView: function () {
            this.model.setIsActive(false);
        },
        selectSchool: function (evt) {
            this.model.selectSchool(this.model.get("schoolList"), evt.target.value);
            this.model.prepareRequest(this.model.get("startAddress"));
        },
        updateSelectedSchool: function (schoolID) {
            this.$el.find(".selectpicker").selectpicker("val", schoolID);
        },
        useRegionalSchool: function (evt) {
            var useRegionalSchool = evt.target.checked;

            this.model.setUseRegionalSchool(useRegionalSchool);
            if (useRegionalSchool) {
                this.model.findRegionalSchool(this.model.get("startAddress"));
                this.$el.find(".selectpicker").prop("disabled", true);
            }
            else {
                this.$el.find(".selectpicker").prop("disabled", false);
            }
            this.$el.find(".selectpicker").selectpicker("refresh");
        },
        toggleRouteDesc: function (evt) {
            var oldText = evt.target.innerHTML,
                newText = oldText === "Routenbeschreibung einblenden" ? "Routenbeschreibung ausblenden" : "Routenbeschreibung einblenden";

            this.$el.find(".btn-route-desc").text(newText);
        },
        resetRoute: function () {
            this.model.resetRoute();
        },
        resetRouteResult: function () {
            this.$el.find(".route-result").html("");
        }
    });

    return SchulwegRoutingView;
});
