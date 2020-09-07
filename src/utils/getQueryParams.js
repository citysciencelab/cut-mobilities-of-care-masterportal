const locationSearch = location.search.substr(1);

/**
 * Checks if the query contains html content, if so it is not valid.
 * @param {string} query - The URL-Parameters
 * @return {boolean} Is the query valid.
 */
function checkisURLQueryValid (query) {
    return !(/(<([^>]+)>)/g).test(decodeURIComponent(query));
}

/**
 * Reads params from the URL and makes them available in the store.
 * @param {string} [query=locationSearch] The url-parameter
 * @returns {object} url parameters as object.<string, string>
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
                else {
                    console.warn("The URL-parameters contain illegal information!");
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
