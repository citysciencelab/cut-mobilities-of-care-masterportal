const ElasticSearchModel = Backbone.Model.extend(/** @lends ElasticSearchModel.prototype */{
    defaults: {
        ajaxRequests: {}
    },
    /**
     * Deletes the information of the successful or canceled Ajax request from the object of the running Ajax requests.
     * @param {string} serviceId - id of ElasticSearch Element in rest-services.json
     * @returns {void}
     */
    polishAjax: function (serviceId) {
        var ajax = this.get("ajaxRequests"),
            cleanedAjax = _.omit(ajax, serviceId);

        this.set("ajaxRequests", cleanedAjax);
    },

    /**
     * @description Executes an HTTP GET request.
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
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            type: "GET",
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

                Radio.trigger("Elastic", "triggerHitList", datasources);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                result.status = "error";
                result.message = "ElasticSearch query went wrong with message: " + thrownError;
                if (xhr.status !== 0) { // Bei abort keine Fehlermeldung
                    console.error("error", thrownError);
                }
                Radio.trigger("Searchbar", "abortSearch", "gdi");
                return result;
            },
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
    search (serviceId, query) {
        var result = {},
            searchUrl,
            searchBody,
            serviceUrlCheck,
            ajax = this.get("ajaxRequests");

        serviceUrlCheck = Radio.request("RestReader", "getServiceById", serviceId);

        if (!_.isUndefined(serviceUrlCheck)) {
            searchUrl = Radio.request("RestReader", "getServiceById", serviceId).get("url");
            searchBody = "source=" + JSON.stringify(query) + "&source_content_type=application/json";
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
