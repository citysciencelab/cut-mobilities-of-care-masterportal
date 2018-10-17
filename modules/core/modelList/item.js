const Item = Backbone.Model.extend({
    defaults: {
        name: "",
        id: "",
        parentId: "",
        type: "", // welcher Node-Type - folder/layer/tool/staticlink ...
        title: "test", // angezeigter Titel
        glyphicon: "", // Bootstrap Glyphicon Class,
        isInThemen: false,
        level: 0,
        isVisibleInTree: false
    },
    setId: function (value) {
        this.set("id", value);
    },

    setParentId: function (value) {
        this.set("parentId", value);
    },

    setName: function (value) {
        this.set("name", value);
    },

    setType: function (type) {
        return this.set("type", type);
    },

    setGlyphicon: function (glyphicon) {
        return this.set("glyphicon", glyphicon);
    },

    setIsInThemen: function (value) {
        this.set("isInThemen", value);
    },

    setLevel: function (value) {
        this.set("level", value);
    },

    setIsVisibleInTree: function (value) {
        this.set("isVisibleInTree", value);
    }
});

export default  Item;
