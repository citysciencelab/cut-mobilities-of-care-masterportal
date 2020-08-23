import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateDraw";

const getters = {
    ...generateSimpleGetters(initialState),
    glyphicon: (_state, _getters, rootState) => rootState?.configJson?.Portalconfig?.menu?.tools?.children?.draw?.glyphicon || "glyphicon-pencil",
    iconList: (_state, _getters, rootState) => rootState?.configJson?.Portalconfig?.menu?.tools?.children?.draw?.iconList ||
        [
            {
                id: "iconPoint",
                type: "simple_point",
                value: "simple_point"
            },
            {
                id: "iconLeaf",
                type: "glyphicon",
                value: "\ue103"
            }
        ]
};

export default getters;
