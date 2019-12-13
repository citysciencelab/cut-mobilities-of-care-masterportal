import BauforumGUIModeler from "../changeGUI/model";
import ViewReturnButton from "../changeGUI/viewReturnButton";
import ViewConcepts from "../changeGUI/viewConcepts";

/**
 * todo
 * @returns {void} Todo
 */
function initializeBauforum () {
    new ViewConcepts(BauforumGUIModeler);
    new ViewReturnButton(BauforumGUIModeler);
}

export default initializeBauforum;
