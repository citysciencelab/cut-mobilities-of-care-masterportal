import {mobilityModes} from "../../../shared/constants/mobilityData";
import {
    views,
    interactionTypes,
    drawingModes
} from "./constantsMobilityDataDraw";

/**
 * User type definition
 * @typedef {object} MobilityDataDrawState
 * @property {string} id The ID of the mobility data draw tool
 * @property {number} view The current visible view of the mobility data draw tool
 * @property {MediaRecorder} audioRecorder The audio recorder
 * @property {boolean} isRecording Whether the audio recorder is currently recording or not
 * @property {Blob} audioRecordBlob The recorded audio
 * @property {module:ol/interaction/Draw} drawLineInteraction The draw line interaction of the mobility data draw tool
 * @property {module:ol/interaction/Draw} drawPointInteraction The draw point interaction of the mobility data draw tool
 * @property {module:ol/interaction/Draw} drawAnnotationInteraction The draw interaction to draw annotations
 * @property {module:ol/interaction/Snap} snapInteraction The snap interaction of the mobility data draw tool
 * @property {module:ol/interaction/Modify} modifyInteraction The modify interaction of the mobility data draw tool
 * @property {string} currentInteraction The current interaction type. Could be "draw" or "modify".
 * @property {module:ol/layer/Vector} mobilityDataLayer The layer on which the mobility data is drawn
 * @property {module:ol/layer/Vector} annotationsLayer The layer on which the annotations are drawn
 * @property {Object} personalData The personal data
 * @property {number} personId The id of the person saved in the database
 * @property {string} mobilityMode The selected mobility mode
 * @property {Array<number>} weekdays The selected weekdays (from 0 = Monday to 7 = Sunday)
 * @property {Array} mobilityData The mobility data drawn on the map
 * @property {string} summary The mobility data summary text
 * @property {string} drawingMode The selected drawing mode
 * @property {Array} annotations The annotations to the mobility data
 * @property {boolean} active If true, the mobility data draw tool will be rendered (config-param)
 * @property {string} name Displayed as title (config-param)
 * @property {string} glyphicon Icon next to title (config-param)
 * @property {boolean} renderToWindow If true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow If true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu If true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI Flag if tool should deactivate gfi (config-param)
 * @property {Number} initialWidth Size of the sidebar when opening (config-param)
 * @property {Number} initialWidthMobile Mobile size of the sidebar when opening (config-param)
 */
const state = {
    id: "mobilityDataDraw",
    view: views.PERSONAL_DATA_VIEW,
    audioRecorder: null,
    audioRecords: [
        {
            audioRecordBlob: null,
            isRecording: false
        }
    ],
    imageUploads: [],
    drawLineInteraction: null,
    drawPointInteraction: null,
    drawAnnotationInteraction: null,
    snapInteraction: null,
    modifyInteraction: null,
    currentInteraction: interactionTypes.DRAW,
    personalData: {
        personsInNeed: [{}]
    },
    personId: null,
    mobilityDataLayer: null,
    annotationsLayer: null,
    mobilityMode: mobilityModes.WALK,
    weekdays: [],
    mobilityData: [],
    summary: null,
    drawingMode: drawingModes.POINT,
    annotations: [],
    // defaults for config.json parameters
    active: false,
    name: "Data Collection Tool",
    glyphicon: "glyphicon-user",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    initialWidth: 500,
    initialWidthMobile: 300
};

export default state;
