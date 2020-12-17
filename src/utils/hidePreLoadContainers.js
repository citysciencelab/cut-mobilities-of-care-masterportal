/**
 * hides the loder containers until the timeout has expired
 * @returns {void}
 */
export default function hidePreLoadContainers () {
    setTimeout(function () {
        const box = document.getElementById("portal-logo-box");

        if (box) {
            box.style.visibility = "hidden";
        }
    }, 5000);
}
