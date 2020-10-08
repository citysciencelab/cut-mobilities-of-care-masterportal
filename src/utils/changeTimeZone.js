import * as moment from "moment";

/**
* Change the timzone for the phenomenonTime into a target utc.
* Daylight saving time is considered.
* @param {String} phenomenonTime The phenomenonTime to change.
* @param {String} [utc="+1"] The target timezone.
* @returns {String} The changed phenomenonTime.
*/
function changeTimeZone (phenomenonTime, utc = "+1") {
    const utcAlgebraicSign = utc.substring(0, 1);
    let utcSub,
        utcNumber;

    if (utc.length === 2) {
        utcSub = parseInt(utc.substring(1, 2), 10);
        utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
        utcNumber = "0" + utcSub + "00";
    }
    else if (utc.length > 2) {
        utcSub = parseInt(utc.substring(1, 3), 10);
        utcSub = moment(phenomenonTime).isDST() ? utcSub + 1 : utcSub;
        utcNumber = utcSub + "00";
    }

    return moment(phenomenonTime).utcOffset(utcAlgebraicSign + utcNumber).format("YYYY-MM-DDTHH:mm:ss");
}

export default changeTimeZone;
