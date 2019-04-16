/* eslint-disable require-jsdoc */
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

    polishAjax: function (type) {
        var ajax = this.get("ajaxRequests"),
            cleanedAjax = _.omit(ajax, type);

        this.set("ajaxRequests", cleanedAjax);
    },

    ajaxSend: function (serviceId, searchBody, searchUrl) {
        this.get("ajaxRequests")[serviceId] = $.ajax({
            dataType: "json",
            context: this,
            url: searchUrl,
            async: false,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            type: "POST",
            data: searchBody,
            success: function (response) {
                // handling response
                console.log(this);
                var datasources = [],
                    param = "_source";

                this.status = "success";
                if (response.hits) {
                    _.each(response.hits.hits, function (hit) {
                        datasources.push(hit[param]);
                    });
                }

                this.hits = datasources;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.status = "error";
                this.message = "ElasticSearch query went wrong with message: " + thrownError;
                console.error("error", thrownError);
                return this;
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

        if (ajax[serviceId] !== null && !_.isUndefined(ajax[serviceId])) {
            ajax[serviceId].abort();
            this.polishAjax(serviceId);
        }
        else {
            this.ajaxSend(serviceId, searchBody, searchUrl);
        }

    }
});

export default ElasticSearchModel;
