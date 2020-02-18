export default {
    state: {
        scaleNumber: "",
        scaleLineValue: "",
        mapMode: "2D",
        insideFooter: false
    },
    mutations: {
        updateScaleNumber (state, scaleNumber) {
            state.scaleNumber = scaleNumber;
        },
        updateScaleLineValue (state, scaleLineValue) {
            state.scaleLineValue = scaleLineValue;
        }
    },
    actions: {
        modifyScale ({commit}, obj) {
            var scaleNumber = obj.scale.toString();

            if (scaleNumber >= 10000) {
                scaleNumber = scaleNumber.substring(0, scaleNumber.length - 3) + " " + scaleNumber.substring(scaleNumber.length - 3);
            }

            commit("updateScaleNumber", scaleNumber);
        },
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
    }
};
