<template lang="html">
    <h1>FooBar!</h1>
</template>

<script>
export default {
    mounted() {
        console.log ('FooBar was mounted!!');

        // So lässt sich ein Element anzeigen
        document.getElementById('main-nav').appendChild(this.$el);
        
        // Nutzen von Daten aus Backbone in Vue mittels Radio
        const modelList = Radio.request("ModelList", "getCollection");
        
        console.log(modelList);

        // Alerts anzeigen über den Vuex-Store
        this.$store.dispatch("addAlert", "FooBar alert");
        this.$store.dispatch("addAlert", {text:"FooBar2 alert", id:"124"});
        
        // Alerts anzeigen über Radio
        Radio.trigger("Alert", "alert", "Textnachricht als alert!");
        Radio.trigger("Alert", "alert", "Textnachricht als alert!");
                Radio.trigger("Alert", "alert", {
            id: "999999",
            text: "confirm Example from pendler",
            dismissable: false,
            confirmable: true
        });
        
        // Alerts löschen über Radio
        // Radio.trigger("Alert", "alert:remove", "124");
        // Radio.tigger("Alert", "alert:remove");
        
        // Alerts löschen über den Vuex-Store
        // this.$store.dispatch("removeAlert");
        this.$store.dispatch("removeAlert", "124");
    }
}
</script>

<style lang="css">
</style>
