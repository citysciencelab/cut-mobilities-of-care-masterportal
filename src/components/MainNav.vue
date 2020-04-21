<script>
// TODO this is just the HTML copied in - functions/CSS are still to be migrated
import Title from "./Title.vue";
export default {
    name: "MainNav",
    components: {
        Title
    }
};
</script>

<template>
    <div
        id="main-nav"
        class="navbar navbar-default"
        role="navigation"
    >
        <div class="container-fluid">
            <div id="navbarRow">
                <div class="navbar-header">
                    <button
                        type="button"
                        class="navbar-toggle"
                        data-toggle="collapse"
                        data-target=".navbar-collapse"
                    >
                        <span class="sr-only">Navigation ein-/ausblenden</span>
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                    </button>
                </div>
                <div class="collapse navbar-collapse">
                    <ul
                        id="root"
                        class="nav-menu"
                    />
                </div>
                <Title />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
</style>
