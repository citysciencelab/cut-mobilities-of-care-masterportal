<script>
// TODO this is just the HTML copied in - functions/CSS are still to be migrated
//      maybe control loader via store module
export default {
    name: "Loader"
};
</script>

<template>
    <!-- not yet implemented
    <div id="loader">
        <img src="../img/ajax-loader.gif">
    </div>
    -->
    <div class="loading">
        <img
            id="portal-logo"
            src="https://geoportal-hamburg.de/lgv-config/img/Logo_Masterportal.svg"
        >
        <div id="portal-text">
            Masterportal
        </div>
        <div id="init-loader">
            <img src="../../img/ajax-loader.gif">
        </div>
    </div>
</template>

<style lang="less" scoped>
    .loading {
        position: absolute;
        top: 30%;
        left: 32.5%;
        z-index: 9999;
        text-align: center;
        width: 35%;
    }

    .loading div {
        font-size: 5vmin;
        line-height: 130%;
        margin-top: 5%;
    }

    /* currently not in use
    #loader {
        background-color: rgba(0, 0, 0, 0.4);
        color: #FFFFFF;
        height: 100%;
        position: absolute;
        width: 100%;
        z-index: 2000;
    }

    #loader img {
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -21px;
        margin-top: -5px;
    }
    */
</style>
