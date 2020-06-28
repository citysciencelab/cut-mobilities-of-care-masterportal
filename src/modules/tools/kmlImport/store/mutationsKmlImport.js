export default {
    active (state, value) {
        state.active = value;
    },
    selectedFiletype (state, value) {
        state.selectedFiletype = value;
        console.log(state);
        
    }
};
