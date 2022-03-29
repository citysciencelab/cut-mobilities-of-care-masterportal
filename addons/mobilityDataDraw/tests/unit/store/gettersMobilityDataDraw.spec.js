import {expect} from "chai";
import {mobilityModes} from "../../../../../shared/constants/mobilityData";
import {
    views,
    drawingModes,
    interactionTypes
} from "../../../store/constantsMobilityDataDraw";
import getters from "../../../store/gettersMobilityDataDraw";
import stateMobilityDataDraw from "../../../store/stateMobilityDataDraw";

const {
    id,
    view,
    audioRecorder,
    audioRecords,
    drawLineInteraction,
    drawPointInteraction,
    drawAnnotationInteraction,
    snapInteraction,
    modifyInteraction,
    currentInteraction,
    mobilityDataLayer,
    annotationsLayer,
    personalData,
    personId,
    mobilityMode,
    weekdays,
    mobilityData,
    summary,
    drawingMode,
    annotations,
    active,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI,
    initialWidth,
    initialWidthMobile
} = getters;

describe("addons/mobilityDataDraw/store/gettersMobilityDataDraw", function () {
    it("returns the id from state", function () {
        expect(id(stateMobilityDataDraw)).to.equals("mobilityDataDraw");
    });
    it("returns the view default value from state", function () {
        expect(view(stateMobilityDataDraw)).to.equals(views.PERSONAL_DATA_VIEW);
    });
    it("returns the audioRecorder default value from state", function () {
        expect(audioRecorder(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the audioRecords default value from state", function () {
        expect(JSON.stringify(audioRecords(stateMobilityDataDraw))).to.equals(
            JSON.stringify([
                {
                    audioRecordBlob: null,
                    isRecording: false
                }
            ]
        ));
    });
    it("returns the drawLineInteraction default value from state", function () {
        expect(drawLineInteraction(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the drawPointInteraction default value from state", function () {
        expect(drawPointInteraction(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the drawAnnotationInteraction default value from state", function () {
        expect(drawAnnotationInteraction(stateMobilityDataDraw)).to.equals(
            null
        );
    });
    it("returns the snapInteraction default value from state", function () {
        expect(snapInteraction(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the modifyInteraction default value from state", function () {
        expect(modifyInteraction(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the currentInteraction default value from state", function () {
        expect(currentInteraction(stateMobilityDataDraw)).to.equals(
            interactionTypes.DRAW
        );
    });
    it("returns the mobilityDataLayer default value from state", function () {
        expect(mobilityDataLayer(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the annotationsLayer default value from state", function () {
        expect(annotationsLayer(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the personalData default value from state", function () {
        expect(JSON.stringify(personalData(stateMobilityDataDraw))).to.equals(
            JSON.stringify({"personsInNeed":[{}]})
        );
    });
    it("returns the personId default value from state", function () {
        expect(personId(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the mobilityMode default value from state", function () {
        expect(mobilityMode(stateMobilityDataDraw)).to.equals(
            mobilityModes.WALK
        );
    });
    it("returns the weekdays default value from state", function () {
        expect(
            Array.isArray(weekdays(stateMobilityDataDraw)) &&
                !weekdays(stateMobilityDataDraw).length
        ).to.be.true;
    });
    it("returns the mobilityData default value from state", function () {
        expect(
            Array.isArray(mobilityData(stateMobilityDataDraw)) &&
                !mobilityData(stateMobilityDataDraw).length
        ).to.be.true;
    });
    it("returns the summary default value from state", function () {
        expect(summary(stateMobilityDataDraw)).to.equals(null);
    });
    it("returns the drawingMode default value from state", function () {
        expect(drawingMode(stateMobilityDataDraw)).to.equals(
            drawingModes.POINT
        );
    });
    it("returns the annotations default value from state", function () {
        expect(
            Array.isArray(annotations(stateMobilityDataDraw)) &&
                !annotations(stateMobilityDataDraw).length
        ).to.be.true;
    });

    describe("testing default values", function () {
        it("returns the active default value from state", function () {
            expect(active(stateMobilityDataDraw)).to.be.false;
        });
        it("returns the name default value from state", function () {
            expect(name(stateMobilityDataDraw)).to.be.equals(
                "Data Collection Tool"
            );
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(stateMobilityDataDraw)).to.equals(
                "glyphicon-user"
            );
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateMobilityDataDraw)).to.be.false;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateMobilityDataDraw)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateMobilityDataDraw)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateMobilityDataDraw)).to.be.true;
        });
        it("returns the initialWidth default value from state", function () {
            expect(initialWidth(stateMobilityDataDraw)).to.equals(500);
        });
        it("returns the initialWidthMobile default value from state", function () {
            expect(initialWidthMobile(stateMobilityDataDraw)).to.equals(300);
        });
    });
});
