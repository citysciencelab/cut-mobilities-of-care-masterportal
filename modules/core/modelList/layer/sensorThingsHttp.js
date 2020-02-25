
import axios from "axios";
import UrlParser from "url-parse";
import {transform as transformProjectionToProjection} from "masterportalAPI/src/crs";

/**
 * SensorThingsHttp is the software layer to handle the special needs of the SensorThingsAPI regarding the http protocol.
 * <pre>
 * SensorThingsAPI: https://docs.opengeospatial.org/is/15-078r6/15-078r6.html
 *
 * This software layer handles the skip response of the SensorThingsAPI as well as the call in the browsers extent.
 *
 * To import SensorThingsHttp: import {SensorThingsHttp} from "./SensorThingsHttp";
 * create a new object:        const obj = new SensorThingsHttp()
 * call:                       obj.get(url, onsuccess, onstart, oncomplete, onerror, onwait)
 * call:                       obj.getInExtent(url, extentObj, onsuccess, onstart, oncomplete, onerror, onwait)
 * get the result via onsuccess = function (result) { ... }
 * </pre>
 * @constructor
 * @memberof Core.ModelList.Layer.SensorThingsHttp
 * @export
 */
export function SensorThingsHttp () {

    /**
     * an async function to call an url and to receive data from
     * @param {String} url the url to call
     * @param {SensorThingsCallbackHttpSuccess} onsuccess a function (resp) with the response of the call
     * @param {SensorThingsErrorCallback} onerror a function (resp) with the response of the call
     * @returns {Void}  -
     */
    function _defaultHttpClient (url, onsuccess, onerror) {
        axios({
            method: "get",
            url: url,
            responseType: "text"
        }).then(function (response) {
            if (response !== undefined && typeof onsuccess === "function") {
                onsuccess(response.data);
            }
        }).catch(function (error) {
            if (typeof onerror === "function") {
                onerror(error);
            }
        });
    }

    /**
     * creates a query to put into $filter of the SensorThingsAPI to select only Things within the given points
     * @param {Object[]} points the points as array with objects(x, y) to use as Polygon in SensorThingsAPI call
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @returns {String|Boolean}  the query to add to $filter= (excluding $filter=) or false on error
     */
    function getPolygonQueryWithPoints (points, onerror) {
        let query = "";

        if (!Array.isArray(points)) {
            if (typeof onerror === "function") {
                onerror("SensorThingsHttp - getPolygonQueryWithPoints: the given points should be an array");
            }
            return false;
        }

        points.forEach(function (coord) {
            if (!coord || !coord.hasOwnProperty("x") || !coord.hasOwnProperty("y")) {
                return;
            }

            if (query) {
                query += ",";
            }
            query += coord.x + " " + coord.y;
        });

        return "st_within(Locations/location,geography'POLYGON ((" + query + "))')";
    }

    /**
     * converts the given extent based on an OpenLayers extent into points used in the SensorThingsAPI
     * @param {Number[]} extent the extent based on OpenLayers (e.g. [556925.7670922858, 5925584.829527992, 573934.2329077142, 5942355.170472008])
     * @param {String} sourceProjection the projection of the extent
     * @param {String} targetProjection the projection the result shall have
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @returns {Object[]}  the points as array with objects(x, y) to use as Polygon in SensorThingsAPI call
     */
    function convertExtentIntoPoints (extent, sourceProjection, targetProjection, onerror) {
        let i;

        if (!Array.isArray(extent) || extent.length !== 4) {
            if (typeof onerror === "function") {
                onerror("SensorThingsHttp - convertExtentToPoints: the given extent must be an array with 4 entries");
            }
            return false;
        }
        else if (typeof sourceProjection !== "string") {
            if (typeof onerror === "function") {
                onerror("SensorThingsHttp - convertExtentToPoints: the sourceProjection must be a string describing a projection (e.g. 'EPSG:4326')");
            }
            return false;
        }
        else if (typeof targetProjection !== "string") {
            if (typeof onerror === "function") {
                onerror("SensorThingsHttp - convertExtentToPoints: the targetProjection must be a string describing a projection (e.g. 'EPSG:4326')");
            }
            return false;
        }

        const points = [
            {x: extent[0], y: extent[1]},
            {x: extent[2], y: extent[1]},
            {x: extent[2], y: extent[3]},
            {x: extent[0], y: extent[3]},
            {x: extent[0], y: extent[1]}
        ];

        if (sourceProjection !== targetProjection) {
            for (i in points) {
                try {
                    points[i] = transformProjectionToProjection(sourceProjection, targetProjection, points[i]);
                }
                catch (e) {
                    if (typeof onerror === "function") {
                        onerror(e);
                        return false;
                    }
                }
            }
        }

        return points;
    }

    /**
     * adds the given points into the query of the url
     * @param {String} url the url to extent - if POLYGON of SensorThingsAPI is already in use, nothing will change
     * @param {Object[]} points the points as array with objects(x, y) to use as Polygon in SensorThingsAPI call
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @returns {String|Boolean}  the url with an extent to call the SensorThingsAPI with or false on error
     */
    function addPointsToUrl (url, points, onerror) {
        const parsedUrl = new UrlParser(url),
            polygonQuery = getPolygonQueryWithPoints(points, onerror);

        if (!polygonQuery) {
            return false;
        }
        else if (!url || typeof url !== "string" || url.indexOf("http") !== 0) {
            if (typeof onerror === "function") {
                onerror("SensorThingsHttp - addPointsToUrl: an external url begining with http is expected");
            }
            return false;
        }

        if (!parsedUrl.query) {
            parsedUrl.query = {};
        }

        // use UrlParser.set to parse query into object
        parsedUrl.set("query", parsedUrl.query);

        if (polygonQuery && !parsedUrl.query.hasOwnProperty("$filter")) {
            parsedUrl.query.$filter = polygonQuery;
        }
        else if (polygonQuery && parsedUrl.query.$filter.indexOf("geography'POLYGON") === -1 && parsedUrl.query.$filter.indexOf("geography%27POLYGON") === -1) {
            parsedUrl.query.$filter += " and " + polygonQuery;
        }

        // use UrlParser.set(query) to overwrite href
        parsedUrl.set("query", parsedUrl.query);

        return parsedUrl.href;
    }

    /**
     * adds the $count=true param to the url if not already set
     * @param {String} url the url with or without $count=true
     * @returns {String}  the url with set $count=true param
     */
    function addCountToUrl (url) {
        const parsedUrl = new UrlParser(url);
        let parsedUrlHref = "";

        if (typeof parsedUrl === "object") {
            if (!parsedUrl.query) {
                parsedUrl.query = {};
            }

            // use UrlParser.set to parse query into object
            parsedUrl.set("query", parsedUrl.query);
            parsedUrl.query.$count = true;
            parsedUrl.set("query", parsedUrl.query);

            if (parsedUrl.hasOwnProperty("href")) {
                parsedUrlHref = parsedUrl.href;
            }
        }

        return parsedUrlHref;
    }

    /**
     * gets the percentage of data the given url will load with a set max data
     * @param {String} url the url with a $skip=x value to analyse, if no $skip=x value is found the returned value is 0.0
     * @param {Number} total the number of datasets to be expected, if no count is given the returned value is 1.0
     * @returns {Number}  a relative number [0..1] calculated from $skip and count
     */
    function getSkipProgress (url, total) {
        const parsedUrl = new UrlParser(url);

        if (!parsedUrl.query) {
            parsedUrl.query = {};
        }

        // use UrlParser.set to parse query into object
        parsedUrl.set("query", parsedUrl.query);

        if (isNaN(parseInt(parsedUrl.query.$skip, 10))) {
            return 0.0;
        }

        if (total <= 0 || parseInt(parsedUrl.query.$skip, 10) >= total) {
            return 1.0;
        }

        return 1 / total * parseInt(parsedUrl.query.$skip, 10);
    }

    /**
     * helper function to call the SensorThingsAPI with skip function - for more informations about this issue please read the doc/sensorThings.md
     * @param {String} url the url to call
     * @param {Function} onsuccess a function (resp) with the response of the call
     * @param {Function} oncomplete a function to allways call when the request is finished (successfully or in failure)
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @param {Function} onwait a function to call on each step of a skipping SensorThingsAPI response with the current progress
     * @param {SensorThingsHttpClient} httpClient the httpClient to use instead of the default
     * @param {Object[]} [result] an array to add up the responses
     * @returns {Void}  -
     */
    function getHelper (url, onsuccess, oncomplete, onerror, onwait, httpClient, result) {
        const requestUrl = addCountToUrl(url);
        let completeResult = Array.isArray(result) ? result : [];

        (httpClient || _defaultHttpClient)(requestUrl, function (response) {
            if (response && response.hasOwnProperty("value") && Array.isArray(response.value)) {
                completeResult = completeResult.concat(response.value);
            }

            if (response && response.hasOwnProperty("@iot.nextLink")) {
                if (typeof onwait === "function") {
                    onwait(getSkipProgress(response["@iot.nextLink"], response["@iot.count"]));
                }

                getHelper(response["@iot.nextLink"], onsuccess, oncomplete, onerror, onwait, httpClient, completeResult);

            }
            else {
                // no further skips
                if (typeof onsuccess === "function") {
                    if (typeof onwait === "function") {
                        onwait(1.0);
                    }
                    onsuccess(completeResult);
                }
                if (typeof oncomplete === "function") {
                    oncomplete();
                }
            }

        }, function (error) {
            if (typeof onerror === "function") {
                onerror(error);
            }
            if (typeof oncomplete === "function") {
                oncomplete();
            }
        });
    }

    /**
     * calls the given url from the SensorThingsAPI, follows skip urls, response is given as callback onsuccess
     * @param {String} url the url to call
     * @param {Function} onsuccess a function (resp) with the response of the call
     * @param {Function} onstart a function to call on start
     * @param {Function} oncomplete a function to allways call when the request is finished (successfully or in failure)
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @param {Function} onwait a function to call on each step of a skipping SensorThingsAPI response
     * @param {SensorThingsHttpClient} [httpClient] the httpClient to use instead of the default
     * @returns {Void}  -
     */
    this.get = function (url, onsuccess, onstart, oncomplete, onerror, onwait, httpClient) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (typeof onwait === "function") {
            onwait(0.0);
        }

        getHelper(url, onsuccess, oncomplete, onerror, onwait, httpClient);
    };

    /**
     * calls the given url from the SensorThingsAPI, uses a call in extent, follows skip urls, response is given as callback onsuccess
     * @param {String} url the url to call
     * @param {Object} extentObj data for the extent
     * @param {Number[]} extentObj.extent the extent based on OpenLayers (e.g. [556925.7670922858, 5925584.829527992, 573934.2329077142, 5942355.170472008])
     * @param {String} extentObj.sourceProjection the projection of the extent
     * @param {String} extentObj.targetProjection the projection the broker expects
     * @param {Function} onsuccess a function (resp) with the response of the call
     * @param {Function} onstart a function to call on start
     * @param {Function} oncomplete a function to allways call when the request is finished (successfully or in failure)
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @param {Function} onwait a function to call on each step of a skipping SensorThingsAPI response
     * @param {SensorThingsHttpClient} [httpClient] the httpClient to use instead of the default
     * @returns {Void}  -
     */
    this.getInExtent = function (url, extentObj, onsuccess, onstart, oncomplete, onerror, onwait, httpClient) {
        const extent = extentObj && extentObj.extent ? extentObj.extent : false,
            sourceProjection = extentObj && extentObj.sourceProjection ? extentObj.sourceProjection : false,
            targetProjection = extentObj && extentObj.targetProjection ? extentObj.targetProjection : false,
            points = convertExtentIntoPoints(extent, sourceProjection, targetProjection, onerror),
            requestUrl = addPointsToUrl(url, points, onerror);

        if (typeof onstart === "function") {
            onstart();
        }

        if (typeof onwait === "function") {
            onwait(0.0);
        }

        if (points === false || requestUrl === false) {
            if (typeof oncomplete === "function") {
                oncomplete();
            }
            return;
        }

        getHelper(requestUrl, onsuccess, oncomplete, onerror, onwait, httpClient);
    };

    // shadow functions - public internal functions for better testing
    this.getPolygonQueryWithPoints = getPolygonQueryWithPoints;
    this.convertExtentIntoPoints = convertExtentIntoPoints;
    this.addPointsToUrl = addPointsToUrl;
    this.addCountToUrl = addCountToUrl;
    this.getSkipProgress = getSkipProgress;
    this.getHelper = getHelper;

}
