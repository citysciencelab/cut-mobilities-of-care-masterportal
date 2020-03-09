import Attributions from "./attributions/Attributions.vue";
import BackForward from "./backForward/BackForward.vue";
import Zoom from "./zoom/Zoom.vue";

const componentMap = {
        attributions: Attributions,
        backForward: BackForward,
        zoom: Zoom
    },
    mobileHiddenControls = [
        "backForward"
    ];

/**
 * NOTE Only an idea, no complete implementation
 * Before "new Vue" is called with the App, this function can be used to introduce
 * an addon to the controls element. The controls element will render the component
 * as if it were part of the code base, and it can add its own store module etc.
 *
 * Pro: Can use features of Controls.vue automatically. (Not many atm.)
 * Con: A global registration mechanism would be required for addons.
 * @param {string} name name of control in config.json
 * @param {object} control Vue Component
 * @param {boolean} [hiddenMobile=false] whether component is visible in mobile resolution
 * @returns {void}
 */
function registerControl (name, control, hiddenMobile = false) {
    // if (App did not render yet) {
    componentMap[name] = control;
    if (hiddenMobile) {
        mobileHiddenControls.push(name);
    }
    // } else { log warning }
}

export {
    componentMap,
    mobileHiddenControls,
    registerControl
};
