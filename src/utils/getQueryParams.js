/**
 * Reads params from the URL and makes them available in the store.
 * @returns {object} url parameters as object.<string, string>
 */
function getQueryParams () {
    const queryParams = {};

    try {
        if (location.search) {
            const query = location.search.substr(1); // remove "?" character

            query.split("&").forEach(item => {
                const [key, value] = item.split("=");

                queryParams[key] = decodeURIComponent(value);
            });
        }
    }
    catch (e) {
        console.error(e);
        console.warn("An error occured when reading the query params. Some parameters may not work. Params parsed:", queryParams);
    }

    return queryParams;
}

export default getQueryParams;
