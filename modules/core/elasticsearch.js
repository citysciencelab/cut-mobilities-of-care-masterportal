
const ElasticSearchModel = Backbone.Model.extend({
    defaults: {
        ajaxRequests: {}
    },
    prepareSearchBody (query, sorting, size) {
        var searchBody = {};

        if (!_.isEmpty(sorting)) {
            searchBody.sort = sorting;
        }

        searchBody.from = 0;
        searchBody.size = size;
        searchBody.query = query;

        return JSON.stringify(searchBody);
    },

    polishAjax: function (serviceId) {
        var ajax = this.get("ajaxRequests"),
            cleanedAjax = _.omit(ajax, serviceId);

        this.set("ajaxRequests", cleanedAjax);
    },

    /**
     * @description Fuehrt einen HTTP-GET-Request aus
     * @param {string} serviceId - id of ElasticSearch Element in rest-services.json
     * @param {object} searchBody - body of ElasticQuery
     * @param {object} searchUrl - url of ElasticSearchService
     * @param {object} result - Resultobject of ElasticQuery
     * @return {void}
     */
    ajaxSend: function (serviceId, searchBody, searchUrl, result) {
        this.get("ajaxRequests")[serviceId] = $.ajax({
            dataType: "json",
            context: this,
            url: searchUrl,
            // async: false,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            type: "POST",
            data: searchBody,
            success: function (response) {
                // handling response
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
            error: function (err) {
                console.log(err.status);
                if (err.status !== 0) { // Bei abort keine Fehlermeldung
                    this.showError(err);
                }
                // console.log(Radio.trigger("Searchbar", "abortSearch", "gdi"));
                Radio.trigger("Searchbar", "abortSearch", "gdi");
            },
            // error: function (xhr, ajaxOptions, thrownError) {
            //     result.status = "error";
            //     result.message = "ElasticSearch query went wrong with message: " + thrownError;
            //     console.error("error", thrownError);
            //     console.log(result);
            //     return result;
            // },
            complete: function () {
                this.polishAjax(serviceId);
            }
        });
    },

    /**
     * sends query against ElasticSearch-Index
     * @param {string} serviceId - id of ElasticSearch Element in rest-services.json
     * @param {object} query - json-notated Query to post to
     * @param {object} sorting - object used for sorting the query
     * @param {number} size - size of the query
     * @return {object} result - Resultobject of ElasticQuery
     */
    search (serviceId, query, sorting, size) {
        var result = {},
            searchUrl,
            searchBody,
            serviceUrl,
            serviceUrlCheck,
            ajax = this.get("ajaxRequests");

        serviceUrlCheck = Radio.request("RestReader", "getServiceById", serviceId);

        if (!_.isUndefined(serviceUrlCheck)) {
            serviceUrl = Radio.request("RestReader", "getServiceById", serviceId).get("url");
            searchUrl = Radio.request("Util", "getProxyURL", serviceUrl);
            searchBody = this.prepareSearchBody(query, sorting, size);
        }
        else if (_.isUndefined(serviceUrlCheck)) {
            result.status = "error";
            result.message = "ElasticSearch Service with id " + serviceId + " not found.";
            console.error(JSON.stringify(result));
            return result;
        }
        else if (_.isUndefined(query)) {
            result.status = "error";
            result.message = "ElasticSearch query not found.";
            console.error(JSON.stringify(result));
            return result;
        }
        if (ajax[serviceId] && !_.isUndefined(ajax[serviceId])) {
            ajax[serviceId].abort();
            this.polishAjax(serviceId);
        }
        else {
            this.ajaxSend(serviceId, searchBody, searchUrl, result);
        }
        return result;
    }
});

export default ElasticSearchModel;
