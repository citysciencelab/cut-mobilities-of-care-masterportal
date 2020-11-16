import store from "../../src/app-store";

store.watch((state, getters) => getters["Map/gfiFeatures"], features => {
    if (features !== null) {
        Radio.trigger("ClickCounter", "gfi");
    }
});
