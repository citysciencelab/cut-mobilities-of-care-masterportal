/**
* Checks group layers for children with datasets (metadata) to decide
* whether an info button should be shown for the group layer. It will
* be shown if a single child has datasets not undefined and not false.
* @param {object} model - The object to search for children with Datasets.
* @returns {void}

*/
function checkChildrenDatasets (model) {
    if (model.get("datasets") !== false && model.has("children")) {
        const children = model.get("children");

        for (const {datasets} of children) {
            if (typeof datasets !== "undefined" && datasets !== false) {
                model.set({datasets: true});
                break;
            }
        }
    }
}
export default checkChildrenDatasets;
