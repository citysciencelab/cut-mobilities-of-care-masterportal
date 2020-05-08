import getters from "./gettersDraw";
import mutations from "./mutationsDraw";

const colorOptions = [], // TODO: The caption is translated --> Maybe this needs to be somewhere else!
    drawTypeOptions = [{caption: "Punkt zeichnen", value: "Point", id: "drawPoint"}], // TODO: The caption is translated --> Maybe this needs to be somewhere else!
    earthRadius = 6378137,
    fontOptions = [
        {caption: "Arial", value: "Arial"},
        {caption: "Calibri", value: "Calibri"},
        {caption: "Times New Roman", value: "Times New Roman"}
    ],
    fontSizeOptions = [
        {caption: "10 px", value: 10},
        {caption: "12 px", value: 12},
        {caption: "16 px", value: 16},
        {caption: "20 px", value: 20},
        {caption: "24 px", value: 24},
        {caption: "32 px", value: 32}
    ],
    keyStore = {
        getters: Object.keys(getters),
        mutations: Object.keys(mutations)
    },
    pointSizeOptions = [
        {caption: "6 px", value: 6},
        {caption: "8 px", value: 8},
        {caption: "10 px", value: 10},
        {caption: "12 px", value: 12},
        {caption: "14 px", value: 14},
        {caption: "16 px", value: 16}
    ],
    strokeOptions = [
        {caption: "1 px", value: 1},
        {caption: "2 px", value: 2},
        {caption: "3 px", value: 3},
        {caption: "4 px", value: 4},
        {caption: "5 px", value: 5},
        {caption: "6 px", value: 6}
    ],
    transparencyOptions = [
        {caption: "0 %", value: 1.0},
        {caption: "10 %", value: 0.9},
        {caption: "20 %", value: 0.8},
        {caption: "30 %", value: 0.7},
        {caption: "40 %", value: 0.6},
        {caption: "50 %", value: 0.5},
        {caption: "60 %", value: 0.4},
        {caption: "70 %", value: 0.3},
        {caption: "80 %", value: 0.2},
        {caption: "90 %", value: 0.1},
        {caption: "100 %", value: 0.0}
    ];

export {
    colorOptions,
    drawTypeOptions,
    earthRadius,
    fontOptions,
    fontSizeOptions,
    keyStore,
    pointSizeOptions,
    strokeOptions,
    transparencyOptions
};
