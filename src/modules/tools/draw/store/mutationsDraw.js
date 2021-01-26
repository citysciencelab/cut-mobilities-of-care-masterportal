import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateDraw";

const mutations = {
    ...generateSimpleMutations(initialState),
    setDownloadDataString: (state, payload) => {
        state.download.dataString = payload;
    },
    setDownloadEnabled: (state) => {
        state.download.enabled = !state.download.enabled;
    },
    setDownloadFeatures: (state, payload) => {
        state.download.features = payload;
    },
    setDownloadFile: (state, payload) => {
        state.download.file = payload;
    },
    setDownloadFileName: (state, payload) => {
        state.download.fileName = payload;
    },
    setDownloadFileUrl: (state, payload) => {
        state.download.fileUrl = payload;
    },
    setDownloadSelectedFormat: (state, payload) => {
        state.download.selectedFormat = payload;
    }
};

export default mutations;
