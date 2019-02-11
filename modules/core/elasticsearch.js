// var sorting = {},
//    size = 10000;

export function prepareSearchBody (query, sorting, size) {
    var searchBody = {};

    if (!_.isEmpty(sorting)) {
        searchBody.sort = sorting;
    }

    searchBody.from = 0;
    searchBody.size = size;
    searchBody.query = query;

    return JSON.stringify(searchBody);
}

/* export function setSorting (key, value) {
    if (key && value) {
        sorting[key] = value;
    }
}

export function setSize (value) {
    if (typeof value === "number") {
        size = value;
    }
} */

/**
* sends query against ElasticSearch-Index
* @param {string} serviceId - id of ElasticSearch Element in rest-services.json
* @param {object} query - json-notated Query to post to
* @param {object} sorting - object used for sorting the query
* @param {number} size - size of the query
* @return {object} result - Resultobject of ElasticQuery
*/
export function search (serviceId, query, sorting, size) {
    var result = {},
        searchUrl,
        searchBody,
        serviceUrl;

    serviceUrl = Radio.request("RestReader", "getServiceById", serviceId).get("url");
    searchUrl = Radio.request("Util", "getProxyURL", serviceUrl);
    searchBody = prepareSearchBody(query, sorting, size);


    if (_.isUndefined(serviceUrl)) {
        result.status = "error";
        result.message = "ElasticSearch Service with id " + serviceId + " not found.";
        // console.error(JSON.stringify(result));
        return result;
    }
    else if (_.isUndefined(query)) {
        result.status = "error";
        result.message = "ElasticSearch query not found.";
        // console.error(JSON.stringify(result));
        return result;
    }

    /* eigentlich die schickere Variante, aber läuft nicht im IE...
    return fetch(searchUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: searchBody
    })
        .then(response => response.json())
        .then(response => {
            var datasources = [],
                param = "_source";

            result.status = "success";

            if (response.hits) {
                _.each(response.hits.hits, function (hit) {
                    datasources.push(hit[param]);
                });
            }

            result.hits = datasources;
            return result;
        })
        .catch(err => {
            result.status = "error";
            result.message = "ElasticSearch query went wrong with message: " + err;
            console.error("error", err);
            return result;
        });*/

    $.ajax({
        dataType: "json",
        url: searchUrl,
        async: false,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        type: "POST",
        data: searchBody,

        // handling response
        success: function (response) {
            var datasources = [],
                param = "_source";

            result.status = "success";

            if (response.hits) {
                _.each(response.hits.hits, function (hit) {
                    datasources.push(hit[param]);
                });
            }

            result.hits = datasources;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            result.status = "error";
            result.message = "ElasticSearch query went wrong with message: " + thrownError;
            console.error("error", thrownError);
            return result;
        }
    });

    return result;

}
