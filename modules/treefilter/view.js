define([
    "backbone",
    "text!modules/treefilter/template.html",
    "eventbus",
    "modules/treefilter/model"
], function (Backbone, TreeFilterTemplate, EventBus, TreeFilter) {

    var View = Backbone.View.extend({
        model: TreeFilter,
        // id: "treeFilterWin",
        className: "win-body",
        template: _.template(TreeFilterTemplate),
        initialize: function () {
            // this.render();
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
            this.model.on("change:filterHits invalid change:treeType change:errors", this.render, this);
            this.model.on("change:categoryArray", this.render, this);
            this.model.on("change:typeArray", this.render, this);
            EventBus.on("toggleFilterTreeWin", this.toggleFilterTreeWin, this);

            // NOTE http://www.benknowscode.com/2013/12/bootstrap-dropdown-button-select-box-control.html
            $(document.body).on("click", ".categoryPick", this, function (evt) {
                if (evt.target.textContent !== "Keine Treffer") {
                    $("#categoryInput").val(evt.target.textContent);
                    evt.data.model.setCategory();
                    $("#typeInput").prop("disabled", false);
                     $(".dropdown-toggle-type").prop("disabled", false);
                    $("#typeInput").val("");
                    $("#typeInput").focus();
                }
            });
            $(document.body).on("click", ".typePick", this, function (evt) {
                // evt.data = this (die View)
                $("#typeInput").val(evt.target.textContent);
                evt.data.model.setType();
                evt.data.focusOnEnd($("#yearMin > input"));
            });
            // http://holdirbootstrap.de/javascript/#dropdowns
            $(document.body).on("hidden.bs.dropdown", "#categoryToggle", this, function (evt) {
                if (_.contains(evt.data.model.get("categoryArray"), $("#categoryInput").val()) === false && evt.data.model.get("categoryArray").length !== 73) {
                    $(".dropdown-toggle-category").dropdown("toggle");
                    evt.data.focusOnEnd($("#categoryInput"));
                }
                else if ($("#categoryInput").val() === "") {
                    evt.data.model.setCategory();
                }
            });
            $(document.body).on("hidden.bs.dropdown", "#typeToggle", this, function (evt) {
                if (_.contains(evt.data.model.get("typeArray"), $("#typeInput").val()) === false && $("#typeInput").val() !== "") {
                    $(".dropdown-toggle-type").dropdown("toggle");
                    evt.data.focusOnEnd($("#typeInput"));
                }
            });
        },
        events: {
            "click .glyphicon-chevron-up, .glyphicon-chevron-down": "toggleContent",
            "click .close": "toggleFilterTreeWin",
            "click #filterbutton": "setFilterParams",
            "click #filterRemoveButton": "removeFilter",
            "keyup #categoryInput": "setSearchCategoryString",
            "keyup #typeInput": "setSearchTypeString"
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },
        setSearchCategoryString: function () {
            this.model.setSearchCategoryString($("#categoryInput").val());
            if ($(".treeList").css("display") !== "block") {
                $(".dropdown-toggle-category").dropdown("toggle");
            }
            this.focusOnEnd($("#categoryInput"));
        },
        setSearchTypeString: function () {
            this.model.setSearchTypeString($("#typeInput").val());
            if ($(".treeTypeList").css("display") !== "block") {
                $(".dropdown-toggle-type").dropdown("toggle");
            }
            this.focusOnEnd($("#typeInput"));
        },
        /**
         * Platziert den Cursor am Ende vom String
         * @param {Element} element - Das Dom-Element
         */
        focusOnEnd: function (element) {
            var strLength = element.val().length * 2;

            element.focus();
            element[0].setSelectionRange(strLength, strLength);
        },
        /**
         * Platziert den Cursor am Anfang vom String
         * @param {Element} element - Das Dom-Element
         */
        focusOnStart: function (element) {
            element.focus();
            element[0].setSelectionRange(0, 0);
        },
        toggleContent: function () {
            $("#treeFilterWin > .panel-body").toggle("slow");
            $("#treeFilterWin > .panel-heading > .toggleChevron").toggleClass("glyphicon-chevron-up glyphicon-chevron-down");
        },
        toggleFilterTreeWin: function () {
            $("#treeFilterWin").toggle();
        },
        removeFilter: function () {
            this.model.removeFilter();
        },
        setFilterParams: function () {
             this.model.setFilterParams();
        }
    });

    return View;
});
