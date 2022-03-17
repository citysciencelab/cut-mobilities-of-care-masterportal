import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

const opts = {
    icons: {
        iconfont: "md"
    },
    theme: {
        themes: {
            light: {
                primary: "#3F51B5"
            }
        }
    }
};

export default new Vuetify(opts);
