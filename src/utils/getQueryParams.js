const locationSearch = location.search.substr(1);

/**
 * Checks if the query contains html content, if so it is not valid.
 * @param {String} query - The URL-Parameters
 * @return {Boolean} Is the query valid.
 */
function checkisURLQueryValid (query) {
    return !(/(<([^>]+)>)/g).test(decodeURIComponent(query));
}

/**
 * Reads params from the URL and makes them available in the store.
 * @param {String} [query=locationSearch] The url-parameter
 * @returns {Object} url parameters as object.<string, string>
 */
function getQueryParams (query = locationSearch) {
    const queryParams = {};

    try {
        if (query !== undefined) {
            query.split("&").forEach(item => {
                const [key, value] = item.split("=");

                if (checkisURLQueryValid(value)) {
                    queryParams[key] = decodeURIComponent(value);
                }
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
