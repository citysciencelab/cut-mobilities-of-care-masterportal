define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeFilter.html',
    'eventbus',
    'models/TreeFilter'
], function ($, _, Backbone, TreeFilterTemplate, EventBus, TreeFilter) {

    var TreeFilterView = Backbone.View.extend({
        model: TreeFilter,
        id: 'treeFilterWin',
        className: 'panel panel-master',
        template: _.template(TreeFilterTemplate),
        initialize: function () {
            this.render();
            EventBus.on('toggleFilterTreeWin', this.toggleFilterTreeWin, this);
        },
        events: {
            'click .glyphicon-chevron-up, .glyphicon-chevron-down': 'toggleContent',
            'click .close': 'toggleFilterTreeWin',
            'click #treeCategory': 'checkCombobox',
            'click #filterbutton': 'validateForm'
        },
        render: function () {
            var attr = this.model.toJSON();
             $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        toggleContent: function () {
            $('#treeFilterWin > .panel-body').toggle('slow');
            $('#treeFilterWin > .panel-heading > .toggleChevron').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
        },
        toggleFilterTreeWin: function () {
            $('#treeFilterWin').toggle();
        },
        checkCombobox: function () {
            if($('#treeCategory').val() !== "keine Auswahl") {
                $('#treeType').prop("disabled", false);
            }
            else {
                $('#treeType').prop("disabled", true);
            }
        },
        validateForm: function () {
            var isValid = true;
            // Pflanzjahr
            var yearCurrent = new Date().getFullYear();
            var yearStart = $('#yearStart').val();
            var yearEnd = $('#yearEnd').val();
            for(var i = 0; i < yearEnd.length; i = i+1) {
                if(yearEnd.charAt(i) > "9" || yearEnd.charAt(i) < "0" || yearEnd.length > 4 || yearEnd < yearStart) {
                    console.log("Eingabe fehlerhaft");
                    $('#yearEnd').parent().addClass('has-error');
                    $('#yearEnd').css('border-width', '2px');
                    isValid = false;
                    break;
                }
                else {
                    console.log("Eingabe korrekt");
                    $('#yearEnd').css('border-width', '1px');
                    $('#yearEnd').parent().removeClass('has-error');
                }
            }
            for(var i = 0; i < yearStart.length; i = i+1) {
                if(yearStart.charAt(i) > "9" || yearStart.charAt(i) < "0" || yearStart.length > 4 || yearEnd < yearStart || yearStart > yearCurrent) {
                    console.log("Eingabe fehlerhaft");
                    $('#yearStart').parent().addClass('has-error');
                    $('#yearStart').css('border-width', '2px');
                    isValid = false;
                    break;
                }
                else {
                    console.log("Eingabe korrekt");
                    $('#yearStart').css('border-width', '1px');
                    $('#yearStart').parent().removeClass('has-error');
                }
            }
            if(isValid) {
                // erst noch sld erstellen
                 this.model.setFormChecker(true);
            }
        }
    });

    return TreeFilterView;
});
