/**
 * Handles Loader Overlay.
 */
export default {
    loaderOverlayCount: 0, // this is needed to handle multiple loader show calls
    initialLoaderIsHidden: false,
    loaderTimeoutReference: null,
    /**
     * Shows Loader Overlay.
     * @param {int}     maxWait - Maximum loader duration
     * @returns {int}           - Count of virtual loader stacks
     */
    show: function (maxWait = 25000) {
        clearTimeout(this.loaderTimeoutReference);
        this.loaderTimeoutReference = setTimeout(() => {
            this.hide();
        }, maxWait);
        document.getElementById("loader").classList.add("loader-is-loading");
        document.getElementById("masterportal-container").classList.add("blurry");
        return ++this.loaderOverlayCount;
    },
    /**
     * Hides Loader Overlay.
     * @returns {int}   - Count of virtual loader stacks
     */
    hide: function () {
        this.loaderOverlayCount--;
        if (this.loaderOverlayCount <= 0) {
            this.loaderOverlayCount = 0;
            document.getElementById("loader").classList.remove("loader-is-loading");
            document.getElementById("masterportal-container").classList.remove("blurry");
            if (!this.initialLoaderIsHidden) {
                this.removePreLoadLogos();
            }
        }
        return this.loaderOverlayCount;
    },
    /**
     * Removes portal logos and titles from Loader
     * @returns {void}
     */
    removePreLoadLogos: function () {
        const portalLogoBox = document.getElementById("portal-logo-box"),
            genericMasterPortalLogo = document.getElementById("generic-masterportal-logo");

        portalLogoBox.parentNode.removeChild(portalLogoBox);
        genericMasterPortalLogo.parentNode.removeChild(genericMasterPortalLogo);
        document.getElementById("loader").classList.remove("loader-has-solid-bg");
        this.initialLoaderIsHidden = true;
    }
};
