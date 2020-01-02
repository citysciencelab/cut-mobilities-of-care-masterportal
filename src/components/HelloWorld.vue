<template lang="html">
    <h1>HALLOO!</h1>
</template>

<script>
export default {
    created() {
        console.log("Hello World was created!");
    },
    mounted() {
        console.log ('Hello World was mounted!!');
        console.log(this.$store.state.User.user);
        document.getElementById('main-nav').appendChild(this.$el);
        Radio.trigger("Alert", "alert", {id: "123", text:"Hello World!", kategorie: "alert-danger"});
        // this.$store.commit("setAlert", "Text")
        this.$store.dispatch('storeUser', "XYUser");
    }
}
</script>

<style lang="css">
</style>
