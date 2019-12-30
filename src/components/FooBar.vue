<template lang="html">
    <h1>FooBar!</h1>
</template>

<script>
export default {
    mounted() {
        // console.log ('FooBar was mounted!!');
        // document.getElementById('main-nav').appendChild(this.$el);
        // const modelList = Radio.request("ModelList", "getCollection");
        // console.log(modelList);
        // console.log(this.$store.state.User.user);
        // this.$store.dispatch("addAlert", "FooBar alert");
        // this.$store.dispatch("addAlert", {text:"FooBar2 alert", id:"124"});
        // Radio.trigger("Alert", "alert:remove", "124");
        //Radio.tigger("Alert", "alert:remove");
        // this.$store.dispatch("removeAlert");
        // this.$store.dispatch("removeAlert", "124");
        Radio.trigger("Alert", "alert", "Textnachricht als alert!");
        Radio.trigger("Alert", "alert", "Textnachricht als alert!");
        Radio.trigger("Alert", "alert", "Textnachricht als alert222!");
        Radio.trigger("Alert", "alert", "Textnachricht als alert!");
                Radio.trigger("Alert", "alert", {
            id: "999999",
            text: "confirm Example from pendler",
            dismissable: false,
            confirmable: true
        });
        
    }
}
</script>

<style lang="css">
</style>
