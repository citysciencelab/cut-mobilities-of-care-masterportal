import PrintWinTemplate from "text-loader!./template.html";

const PrintView = Backbone.View.extend({
    events: {
        "change #layoutField": "setLayout",
        "change #scaleField": "setScale",
        "click button": "createPDF"
    },
    initialize: function () {
        this.template = _.template(PrintWinTemplate);
        this.listenTo(this.model, {
            "change:isActive change:fetched change:scale": this.render
        });
    },
    render: function (model) {
        if (model.get("fetched") && model.get("isActive")) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    },
    setLayout: function (evt) {
        this.model.setLayout(evt.target.selectedIndex);
    },
    setScale: function (evt) {
        this.model.setScale(evt.target.selectedIndex);
    },
    createPDF: function () {
        this.model.setTitleFromForm();
        this.model.getLayersForPrint();
    }
});

export default PrintView;
