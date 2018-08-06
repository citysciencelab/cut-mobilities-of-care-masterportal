define(function (require) {
    var TreeFilterTemplate = require("text!modules/treefilter/template.html"),
        TreeFilter = require("modules/treefilter/model"),
        $ = require("jquery"),
        TreeFilterView;

    TreeFilterView = Backbone.View.extend({
        events: {
            "click #filterbutton": "setFilterParams",
            "click #filterRemoveButton": "removeFilter",
            "keyup #categoryInput": "setSearchCategoryString",
            "keyup #typeInput": "setSearchTypeString",
            "focusout #yearMin > input": "setYearMin",
            "focusout #yearMax > input": "setYearMax",
            "focusout #diameterMin > input": "setDiameterMin",
            "focusout #diameterMax > input": "setDiamterMax",
            "focusout #perimeterMin > input": "setPerimeterMin",
            "focusout #perimeterMax > input": "setPerimeterMax",
            "focusout #categoryInput": "setCategory",
            "focusout #typeInput": "setType"
        },
        initialize: function (attr) {
            this.model = new TreeFilter(attr);
            // this.render();
            this.listenTo(this.model, {
                "change:isCurrentWin": this.render,
                "change:isCollapsed ": this.render,
                "change:categoryArray": this.render,
                "change:filterHits invalid change:errors change:treeType": this.render,
                "change:typeArray": this.render
            }, this);

            // NOTE http://www.benknowscode.com/2013/12/bootstrap-dropdown-button-select-box-control.html
            $(document.body).on("click", ".categoryPick", this, function (evt) {
                if (evt.target.textContent !== "Keine Treffer") {
                    $("#categoryInput").val(evt.target.textContent);
                    evt.data.model.setCategory(evt.target.textContent);
                    $("#typeInput").prop("disabled", false);
                    $(".dropdown-toggle-type").prop("disabled", false);
                    $("#typeInput").val("");
                    $("#typeInput").focus();
                }
            });
            $(document.body).on("click", ".typePick", this, function (evt) {
                // evt.data = this (die View)
                $("#typeInput").val(evt.target.textContent);
                evt.data.model.setType(evt.target.textContent);
                evt.data.focusOnEnd($("#yearMin > input"));
            });
            // http://holdirbootstrap.de/javascript/#dropdowns
            $(document.body).on("hidden.bs.dropdown", "#categoryToggle", this, function (evt) {
                if (_.contains(evt.data.model.get("categoryArray"), $("#categoryInput").val()) === false && evt.data.model.get("categoryArray").length !== 73) {
                    // $(".dropdown-toggle-category").dropdown("toggle");
                    // evt.data.focusOnEnd($("#categoryInput"));
                }
                else if ($("#categoryInput").val() === "") {
                    evt.data.model.setCategory();
                }
            });
            $(document.body).on("hidden.bs.dropdown", "#typeToggle", this, function (evt) {
                if (_.contains(evt.data.model.get("typeArray"), $("#typeInput").val()) === false && $("#typeInput").val() !== "") {
                    // $(".dropdown-toggle-type").dropdown("toggle");
                    // evt.data.focusOnEnd($("#typeInput"));
                }
                else if ($("#typeInput").val() === "") {
                    evt.data.model.setType();
                }
            });
        },
        className: "win-body",
        template: _.template(TreeFilterTemplate),
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
        setSearchCategoryString: function () {
            this.model.setSearchCategoryString(this.$("#categoryInput").val());
            if (this.$(".treeList").css("display") !== "block") {
                this.$(".dropdown-toggle-category").dropdown("toggle");
            }
            this.focusOnEnd(this.$("#categoryInput"));
        },
        setSearchTypeString: function () {
            this.model.setSearchTypeString(this.$("#typeInput").val());
            if (this.$(".treeTypeList").css("display") !== "block") {
                this.$(".dropdown-toggle-type").dropdown("toggle");
            }
            this.focusOnEnd(this.$("#typeInput"));
        },
        /**
         * Platziert den Cursor am Ende vom String
         * @param {Element} element - Das Dom-Element
         * @returns {void}
         */
        focusOnEnd: function (element) {
            var strLength = element.val().length * 2;

            element.focus();
            element[0].setSelectionRange(strLength, strLength);
        },
        /**
         * Platziert den Cursor am Anfang vom String
         * @param {Element} element - Das Dom-Element
         * @returns {void}
         */
        focusOnStart: function (element) {
            element.focus();
            element[0].setSelectionRange(0, 0);
        },

        removeFilter: function () {
            this.model.removeFilter();
        },
        setFilterParams: function () {
            this.model.setFilterParams();
        },
        setYearMin: function (evt) {
            this.model.setYearMin(evt.target.value);
        },
        setYearMax: function (evt) {
            this.model.setYearMax(evt.target.value);
        },
        setDiameterMin: function (evt) {
            this.model.setDiameterMin(evt.target.value);
        },
        setDiamterMax: function (evt) {
            this.model.setDiamterMax(evt.target.value);
        },
        setPerimeterMin: function (evt) {
            this.model.setPerimeterMin(evt.target.value);
        },
        setPerimeterMax: function (evt) {
            this.model.setPerimeterMax(evt.target.value);
        },
        setCategory: function (evt) {
            this.model.setCategory(evt.target.value);
        },
        setType: function (evt) {
            this.model.setType(evt.target.value);
        }
    });

    return TreeFilterView;
});
