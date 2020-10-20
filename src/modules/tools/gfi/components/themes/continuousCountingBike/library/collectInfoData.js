
import * as moment from "moment";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";

/**
         * Creates data for the info-tab from given properties.
         * @param {Object} infoProps the for info omitted properties of the gfi
         * @returns {Object} the prepared data for info-tab
         */
export default function collectInfoData (infoProps) {
    const preparedInfoGFIContent = [];

    Object.entries(infoProps).forEach(content => {
        const attribute = content[1],
            key = content[0];
        let gfiAttributes,
            isnum,
            editedAttribute,
            strongestFrequentedMonth;

        if (attribute.indexOf("|") !== -1) {
            isnum = new RegExp(/^\d+$/).test(attribute.split("|")[1]);
            editedAttribute = attribute.split("|");
            if (isnum === true) {
                editedAttribute[1] = thousandsSeparator(editedAttribute[1]);
            }
            if (key === "Stärkster Monat im Jahr") {
                strongestFrequentedMonth = new Date(2019, editedAttribute[0] - 1);
                editedAttribute[0] = moment(strongestFrequentedMonth, "month", "de").format("MMMM");
            }
            gfiAttributes = {
                attrName: key,
                attrValue: editedAttribute
            };
        }
        else {
            gfiAttributes = {
                attrName: key,
                attrValue: attribute
            };
        }
        preparedInfoGFIContent.push(gfiAttributes);
    });
    return preparedInfoGFIContent;
}
