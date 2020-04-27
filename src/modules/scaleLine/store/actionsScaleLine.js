export default {
    /**
     * Modifies the scale number if it has more than three digits and adds it to the store
     * @param {ActionContext} param0 - context passed by vuex
     * @param  {object} obj - contains resolution, zoomlevel and scale from MapView
     * @returns {void}
     */
    modifyScale ({commit}, obj) {
        var scaleNumber = obj.scale.toString();

        if (scaleNumber >= 10000) {
            scaleNumber = scaleNumber.substring(0, scaleNumber.length - 3) + " " + scaleNumber.substring(scaleNumber.length - 3);
        }

        commit("updateScaleNumber", scaleNumber);
    },

    /**
     * Calculates the scaleLineValue für the scale bar in relation to a 2cm long line
     * If the scaleLineValue is greater than 1000 meter, it is given as km
     * @param {ActionContext} param0 - context passed by vuex
     * @returns {void}
    */
    updateScaleLineValue: function ({state, commit}) {
        var scaleLineValue,
            scaleNumber = Math.round(0.02 * state.scaleNumber.replace(" ", ""));

        if (scaleNumber >= 1000) {
            scaleLineValue = (scaleNumber / 1000).toString() + " km";
        }
        else {
            scaleLineValue = scaleNumber.toString() + " m";
        }

        commit("updateScaleLineValue", scaleLineValue);
    }
};
