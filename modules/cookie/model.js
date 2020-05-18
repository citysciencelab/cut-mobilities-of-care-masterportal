const CookieModel = Backbone.Model.extend(/** @lends CookieModel.prototype */{
    defaults: {
        approved: false
    },
    /**
     * @class CookieModel
     * @extends Backbone.Model
     * @memberof Cookie
     * @constructs
     * @property {Boolean} approved=false Flag if Cookies were approved
     */
    initialize: function () {
        const pathname = window.location.pathname.replace(/([.*+?^=!:${}()|[\]/\\])/g, "");

        this.set("sKey", "lgv_" + pathname);
        this.set("cookieEnabled", navigator.cookieEnabled);
        this.set("approved", this.hasItem()); // wenn schon ein Item existiert, dann wurde schon zugestimmt.
    },
    /**
     * Sets the attributes approved=true and calls setItem("").
     * @returns {void}
     */
    approval: function () {
        this.set("approved", true);
        this.setItem("");
    },

    /**
     * Sets the attribute approved=false.
     * @returns {void}
     */
    refusal: function () {
        this.set("approved", false);
    },
    /**
     * todo
     * @returns {*} - todo
     */
    getItem: function () {
        const sKey = this.get("sKey");

        if (this.get("cookieEnabled") === false || this.get("approved" === false)) {
            return null;
        }

        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;

    },

    /**
     * todo
     * @param {*} sValue todo.
     * @param {*} vEnd todo.
     * @param {*} sPath todo.
     * @param {*} sDomain todo.
     * @param {*} bSecure todo.
     * @returns {Boolean} true
     */
    setItem: function (sValue, vEnd, sPath, sDomain, bSecure) {
        const sKey = this.get("sKey");
        let sExpires = "";

        if (this.get("cookieEnabled") === false || this.get("approved" === false)) {
            return false;
        }

        if ((/^(?:expires|max-age|path|domain|secure)$/i).test(sKey)) {
            return false;
        }

        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
                default:
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },

    /**
     * Todo.
     * @param {*} sPath todo.
     * @param {*} sDomain todo.
     * @returns {Boolean} - todo
     */
    removeItem: function (sPath, sDomain) {
        const sKey = this.get("sKey");

        if (this.get("cookieEnabled") === false || this.get("approved" === false)) {
            return false;
        }

        if (!this.hasItem(sKey)) {
            return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },

    /**
     * Todo.
     * @returns{*} - todo.
     */
    hasItem: function () {
        const sKey = this.get("sKey");

        return new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=").test(document.cookie);
    },

    /**
     * Todo.
     * @returns {*} - todo.
     */
    keys: function () {
        const aKeys = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:=[^;]*)?;\s*/);
        let nLen,
            nIdx;

        if (this.get("cookieEnabled") === false || this.get("approved" === false)) {
            return null;
        }

        for (nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    }
});

export default CookieModel;
