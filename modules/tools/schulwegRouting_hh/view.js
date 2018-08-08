define(function (require) {
    var template = require("text!modules/tools/schulwegRouting_hh/template.html"),
        templateHitlist = require("text!modules/tools/schulwegRouting_hh/templateHitlist.html"),
        templateRouteResult = require("text!modules/tools/schulwegRouting_hh/templateRouteResult.html"),
        templateRouteDescription = require("text!modules/tools/schulwegRouting_hh/templateRouteDescription.html"),
        Model = require("modules/tools/schulwegRouting_hh/model"),
        SnippetCheckBoxView = require("modules/snippets/checkbox/view"),
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
            "click .delete-route": "resetRoute",
            "click .print-route": "printRoute",
            "click .description button": "toggleRouteDesc",
            "click #regional-school": function () {
                if (!_.isEmpty(this.model.get("regionalSchool"))) {
                    this.updateSelectedSchool(this.model.get("regionalSchool").get("schul_id"));
                    this.model.selectSchool(this.model.get("schoolList"), this.model.get("regionalSchool").get("schul_id"));
                    this.model.prepareRequest(this.model.get("startAddress"));
                }
            }
        },
        initialize: function () {
            this.checkBoxHVV = new SnippetCheckBoxView({model: this.model.get("checkBoxHVV")});
            if (this.model.get("isActive")) {
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
                "updateRegionalSchool": this.updateRegionalSchool,
                "updateSelectedSchool": this.updateSelectedSchool,
                "resetRouteResult": this.resetRouteResult,
                "togglePrintEnabled": this.togglePrintEnabled,
                "render": function () {
                    this.$el.remove();
                    this.render();
                }
            });

        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.initSelectpicker();
            this.setPresetValues();
            this.$el.find(".routing-checkbox").append(this.checkBoxHVV.render().$el);
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true);
            this.delegateEvents();
            return this;
        },
        togglePrintEnabled: function (value) {
            if (value) {
                this.$el.find(".print-route").removeAttr("disabled");
            }
            else {
                this.$el.find(".print-route").attr("disabled", true);
            }
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

        renderRouteResult: function (model, value) {
            var attr = this.model.toJSON();

            if (Object.keys(value).length !== 0) {
                this.$el.find(".result").html(this.templateRouteResult(attr));
            }
        },
        renderRouteDescription: function (model, value) {
            var attr = this.model.toJSON();

            if (value.length > 0) {
                this.$el.find(".description").html(this.templateRouteDescription(attr));
            }
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
        updateSelectedSchool: function (schoolId) {
            this.$el.find(".selectpicker").selectpicker("val", schoolId);
        },

        updateRegionalSchool: function (value) {
            this.$el.find("#regional-school").text(value);
        },
        toggleRouteDesc: function (evt) {
            var oldText = evt.target.innerHTML,
                newText = oldText === "Routenbeschreibung einblenden" ? "Routenbeschreibung ausblenden" : "Routenbeschreibung einblenden";

            evt.target.innerHTML = newText;
        },
        resetRoute: function () {
            this.model.resetRoute();
            this.updateSelectedSchool("");
            this.updateRegionalSchool("");
            this.$el.find(".address-search").val("");
        },
        resetRouteResult: function () {
            this.$el.find(".route-result").html("");
            this.$el.find(".result").html("");
            this.$el.find(".description").html("");
        },
        printRoute: function () {
            this.model.printRoute();
        }
    });

    return SchulwegRoutingView;
});
