import ResultTemplate from "text-loader!./resultTemplate.html";

const ResultView = Backbone.View.extend({
    model: {},
    template: _.template(ResultTemplate),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    }
});

export default ResultView;
