var timeout = 6000,
    sorting = "asc",
    service;


function getServiceUrl (serviceID) {
    var url;

    return url;
}

function successFunction () {

}

export function setTimeOut (value) {
    timeout = value;
}

export function setSorting(value) {
    sorting = value;
}


/**
* sends query against ElasticSearch-Index
* @param {string} serviceId - id of ElasticSearch Element in rest-services.json
* @param {object} query - json-notated Query to post to
* @return {object} result - Resultobject of ElasticQuery
*/
export function search (serviceId, query) {
    var result = {},
        url;

        url = Radio.request("RestReader", "getServiceById", serviceId).get("url");
    console.log(url);


    if (_.isUndefined(url)) {
        result.status = "error";
        result.message = "ElasticSearch Service with id " + serviceId + " not found.";
        console.log(JSON.stringify(result));
    }
    else if (_.isUndefined(query)) {
        result.status = "error";
        result.message = "ElasticSearch query not found.";
        console.log(JSON.stringify(result));
    }
    else {
        $.ajax({
            url: url,
            data: "",
            dataType: "json",
            context: this,
            type: "GET",
            success: function (data) {
                console.log(data.hits);

            },
            timeout: timeout,
            error: function (err) {
                console.log("error");
            },
            complete: function () {
                console.log("complete");
            }
        }, this);
    }

    return result;
}
