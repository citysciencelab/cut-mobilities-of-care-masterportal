
import axios from "axios";
import UrlParser from "url-parse";
import {transform as transformProjectionToProjection} from "masterportalAPI/src/crs";

/**
 * SensorThingsHttp is the software layer to handle the special needs of the SensorThingsAPI regarding http requests.
 * <pre>
 * SensorThingsAPI: https://docs.opengeospatial.org/is/15-078r6/15-078r6.html
 *
 * This software layer handles the skip response of the SensorThings-API as well as the call in the browsers extent.
 *
 * To import SensorThingsHttp: import {SensorThingsHttp} from "./sensorThingsHttp";
 * create a new object:        const obj = new SensorThingsHttp()
 * call:                       obj.get(url, onsuccess, onstart, oncomplete, onerror, onwait)
 * call:                       obj.getInExtent(url, extentObj, onsuccess, onstart, oncomplete, onerror, onwait)
 * get the result via onsuccess = function (result) { ... }
 * </pre>
 * @constructor
 * @memberof Core.ModelList.Layer.SensorThingsHttp
 * @export
 */
export class SensorThingsHttp {

    /**
     * constructor of SensorThingsHttp
     * @param {Object} [optionsOpt] the options for the SensorThingsHttp
     * @param {Boolean} [optionsOpt.removeIotLinks=false] set to true if the overhead from IotLinks should be removed
     * @param {Boolean} [optionsOpt.httpClient=null] the httpClient to use as function(url, onsuccess, onerror) with onsuccess as function(response) and onerror as function(error)
     * @constructor
     * @returns {SensorThingsHttp}  the instance of SensorThingsHttp
     */
    constructor (optionsOpt) {
        const options = Object.assign({
            removeIotLinks: false,
            httpClient: null
        }, optionsOpt);

        /** private **/
        this.removeIotLinks = options.removeIotLinks;
        /** private **/
        this.httpClient = options.httpClient;
    }

    /**
     * calls the given url, targets only data in expand, walks through all @iot.nextLink
     * @param {String} url the url to call
     * @param {Function} [onsuccess] as function(result) with result as Object[] (result is always an array)
     * @param {Function} [onstart] as function called on start
     * @param {Function} [oncomplete] as function called at the end anyways
     * @param {Function} [onerror] as function(error)
     * @param {Function} [onprogress] as function(rel) with rel as current progress [0..1] called after each @iot.nextLink
     * @param {Function} [callNextLinkOpt] see this.callNextLink - a fake callNextLink function for testing
     * @returns {Void}  -
     */
    get (url, onsuccess, onstart, oncomplete, onerror, onprogress, callNextLinkOpt) {
        const nextLinkFiFo = [],
            progressList = [{
                count: 1,
                progress: 0
            }],
            result = [];

        if (typeof onstart === "function") {
            onstart();
        }
        if (typeof onprogress === "function") {
            onprogress(0);
        }

        (typeof callNextLinkOpt === "function" ? callNextLinkOpt : this.callNextLink).bind(this)(url, nextLinkFiFo, () => {
            // onfinish
            if (typeof onsuccess === "function") {
                onsuccess(result);
            }
            if (typeof oncomplete === "function") {
                oncomplete();
            }
        }, error => {
            // onerror
            if (typeof onerror === "function") {
                onerror(error);
            }
            if (typeof oncomplete === "function") {
                oncomplete();
            }
        }, onprogress, result, progressList, progressList[0]);
    }

    /**
     * calls the given url to a SensorThings server, uses a call in extent, follows skip urls, response is given as callback onsuccess
     * @param {String} url the url to call
     * @param {Object} extentObj data for the extent
     * @param {Number[]} extentObj.extent the extent based on OpenLayers (e.g. [556925.7670922858, 5925584.829527992, 573934.2329077142, 5942355.170472008])
     * @param {String} extentObj.sourceProjection the projection of the extent
     * @param {String} extentObj.targetProjection the projection the broker expects
     * @param {Function} [onsuccess] a function (resp) with the response of the call
     * @param {Function} [onstart] a function to call on start
     * @param {Function} [oncomplete] a function to allways call when the request is finished (successfully or in failure)
     * @param {Function} [onerror] a function (error) to call on error
     * @param {Function} [onprogress] a function to call on each step of a skipping SensorThingsAPI response
     * @param {Function} [getOpt] see this.get - a function for testing only
     * @returns {Void}  -
     */
    getInExtent (url, extentObj, onsuccess, onstart, oncomplete, onerror, onprogress, getOpt) {
        const extent = extentObj && extentObj.extent ? extentObj.extent : false,
            sourceProjection = extentObj && extentObj.sourceProjection ? extentObj.sourceProjection : false,
            targetProjection = extentObj && extentObj.targetProjection ? extentObj.targetProjection : false,
            points = this.convertExtentIntoPoints(extent, sourceProjection, targetProjection, error => {
                if (typeof onstart === "function") {
                    onstart();
                }
                if (typeof onerror === "function") {
                    onerror(error);
                }
                if (typeof oncomplete === "function") {
                    oncomplete();
                }
            }),
            requestUrl = this.addPointsToUrl(url, points, error => {
                if (typeof onstart === "function") {
                    onstart();
                }
                if (typeof onerror === "function") {
                    onerror(error);
                }
                if (typeof oncomplete === "function") {
                    oncomplete();
                }
            });

        if (points === false || requestUrl === false) {
            // if an error occured above
            return;
        }

        (typeof getOpt === "function" ? getOpt : this.get).bind(this)(requestUrl, onsuccess, onstart, oncomplete, onerror, onprogress);
    }


    /**
     * creates a query to put into $filter of the SensorThingsAPI to select only Things within the given points
     * @param {Object[]} points the points as array with objects(x, y) to use as Polygon in SensorThingsAPI call
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @returns {String|Boolean}  the query to add to $filter= (excluding $filter=) or false on error
     */
    getPolygonQueryWithPoints (points, onerror) {
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

            if (query !== "") {
                query += ",";
            }
            query += coord.x + " " + coord.y;
        });

        return "st_within(Thing/Locations/location,geography'POLYGON ((" + query + "))')";
    }

    /**
     * converts the given extent based on an OpenLayers extent into points used in the SensorThingsAPI
     * @param {Number[]} extent the extent based on OpenLayers (e.g. [556925.7670922858, 5925584.829527992, 573934.2329077142, 5942355.170472008])
     * @param {String} sourceProjection the projection of the extent
     * @param {String} targetProjection the projection the result shall have
     * @param {SensorThingsErrorCallback} onerror a function (error) to call on error
     * @returns {Object[]}  the points as array with objects(x, y) to use as Polygon in SensorThingsAPI call
     */
    convertExtentIntoPoints (extent, sourceProjection, targetProjection, onerror) {
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
    addPointsToUrl (url, points, onerror) {
        const parsedUrl = new UrlParser(url),
            polygonQuery = this.getPolygonQueryWithPoints(points, onerror);

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
     * calls a nextLink for the recursion
     * @param {String} nextLink the url to call
     * @param {Object[]} nextLinkFiFo the fifo-List to walk through @iot.nextLink
     * @param {Function} onfinish as function to be called when finished
     * @param {Function} onerror as function(error)
     * @param {Function} onprogress as function(rel) with rel as current progress [0..1] called after each @iot.nextLink
     * @param {Object[]} resultRef the reference for the result anything should be added to at this depth
     * @param {Object[]} progressList the progressList - a collection of progressRef to calc the progress with
     * @param {Object} progressRef the progress object to use for this specific call
     * @param {Function} [collectNextLinksOpt] a collectNextLink function for testing only
     * @returns {Void}  -
     */
    callNextLink (nextLink, nextLinkFiFo, onfinish, onerror, onprogress, resultRef, progressList, progressRef, collectNextLinksOpt) {
        if (!Array.isArray(resultRef)) {
            if (typeof onerror === "function") {
                onerror("SensorThingsHttp - callNextLink: given resultRef is not an array - nextLink: " + nextLink + " - resultRef: " + resultRef);
            }
            return;
        }

        // to calc the progress we need the number of entities for each call - so add $count=true to any given nextLink
        const url = this.addCountToUrl(nextLink);

        this.callHttpClient(url, response => {
            if (response === null || typeof response !== "object" || Array.isArray(response)) {
                // the response is represented as a JSON object (no array)
                // https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#36
                if (typeof onerror === "function") {
                    onerror("SensorThingsHttp - callNextLink: the response from the SensorThingsApi is not an object - check url: " + url);
                }
                return;
            }

            if (progressRef !== null && typeof progressRef === "object" && !Array.isArray(progressRef) && response.hasOwnProperty("@iot.count")) {
                // the number of entities to receive is @iot.count - except if $top=X is given via url
                const topX = this.fetchTopX(url),
                    skipX = this.fetchSkipX(url),
                    count = topX > 0 && topX < response["@iot.count"] ? topX : response["@iot.count"];

                // $skip=X is only found in url if $top=X or @iot.count is bigger than the at once received number of entities
                progressRef.count = count;
                progressRef.progress = skipX;
            }

            if (response.hasOwnProperty("value") && Array.isArray(response.value)) {
                response.value.forEach(value => {
                    resultRef.push(value);
                });

                // all responses in a row of @iot.nextLink followups have following @iot.nextLink except the last one
                if (response.hasOwnProperty("@iot.nextLink")) {
                    if (Array.isArray(nextLinkFiFo)) {
                        nextLinkFiFo.push({
                            nextLink: response["@iot.nextLink"],
                            resultRef: resultRef,
                            progressRef: progressRef
                        });
                    }
                }
                else if (progressRef !== null && typeof progressRef === "object" && !Array.isArray(progressRef)) {
                    // if no @iot.nextLink to follow: the end of this @iot.nextLink path to follow is reached
                    progressRef.progress = progressRef.count;
                }
            }
            else {
                // e.g. a single Thing
                resultRef.push(response);
            }

            (typeof collectNextLinksOpt === "function" ? collectNextLinksOpt : this.collectNextLinks).bind(this)(resultRef, nextLinkFiFo, progressList, () => {
                const obj = this.getNextFiFoObj(nextLinkFiFo);

                if (typeof onprogress === "function") {
                    onprogress(this.getProgress(progressList));
                }
                if (obj === false) {
                    // depth barrier reached
                    if (typeof onfinish === "function") {
                        onfinish();
                    }
                    return;
                }

                this.callNextLink(obj.nextLink, nextLinkFiFo, onfinish, onerror, onprogress, obj.resultRef, progressList, obj.progressRef);
            });
        }, onerror);
    }

    /**
     * searches for @iot.nextLink in the given resultRef, removes the @iot.nextLink and expands the nextLinkFiFo-List as well as the progressList
     * @param {*} resultRef something to walk through
     * @param {Object[]} nextLinkFiFo the fifo list to add found @iot.nextLink and their resultRef to
     * @param {Object[]} progressList the list of progress objects to adapt
     * @param {Function} onfinish a function to call when finished
     * @returns {Void}  -
     */
    collectNextLinks (resultRef, nextLinkFiFo, progressList, onfinish) {
        if (resultRef === null || typeof resultRef !== "object") {
            if (typeof onfinish === "function") {
                onfinish();
            }
            return;
        }
        let key;

        for (key in resultRef) {
            if (this.removeIotLinks && (key.indexOf("@iot.navigationLink") !== -1 || key.indexOf("@iot.selfLink") !== -1)) {
                // to reduce output navigationLink and selfLink should be removed
                delete resultRef[key];
                continue;
            }

            const pos = key.indexOf("@iot.nextLink");

            if (pos === -1) {
                // onfinish mustn't be used in recursion
                this.collectNextLinks(resultRef[key], nextLinkFiFo, progressList);
            }
            else if (pos === 0) {
                // this should never happen as the rood node is moved into nextLinkFiFo in callNextLink
                // we collect it anyways just in case some sub node uses @iot.nextLink, which shouldn't happen ...
                // in this case no progressList should be used because at this place we can't use a reference (new lists should only be created for sub nodes)
                // @iot.nextLink - aka root node
                if (Array.isArray(nextLinkFiFo)) {
                    nextLinkFiFo.push({
                        nextLink: resultRef[key],
                        resultRef: resultRef.value
                    });
                }

                // always collect the nextLink to prevent additional recursions (avoiding double entities on resultRef)
                delete resultRef[key];
            }
            else {
                // [collectionKey]@iot.nextLink
                if (Array.isArray(progressList)) {
                    progressList.push({
                        count: 1,
                        progress: 0
                    });
                }
                if (Array.isArray(nextLinkFiFo)) {
                    nextLinkFiFo.push({
                        nextLink: resultRef[key],
                        resultRef: resultRef[key.substring(0, pos)],
                        progressRef: progressList[progressList.length - 1]
                    });
                }

                // always collect the nextLink to prevent additional recursions (avoiding double entities on resultRef)
                delete resultRef[key];
            }
        }

        if (typeof onfinish === "function") {
            onfinish();
        }
    }

    /**
     * returns the next object from nextLinkFiFo, returns false if no valid object was found (depth barrier)
     * @param {Object[]} nextLinkFiFo the fifo list to add found @iot.nextLink and their resultRef to
     * @returns {(Object|Boolean)}  the next fifo object to be followed or false if depth barrier has been triggert
     */
    getNextFiFoObj (nextLinkFiFo) {
        if (!Array.isArray(nextLinkFiFo) || nextLinkFiFo.length === 0 || !nextLinkFiFo[0].hasOwnProperty("nextLink")) {
            return false;
        }
        const obj = nextLinkFiFo.shift(),
            topX = this.fetchTopX(obj.nextLink),
            skipX = this.fetchSkipX(obj.nextLink);

        if (topX > 0 && topX <= skipX) {
            // "In addition, if the $top value exceeds the service-driven pagination limitation (...), the $top query option SHALL be discarded and the server-side pagination limitation SHALL be imposed."
            // https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#51
            // that means: skipX can be less than top, but stop for all topX greater or equal skipX
            // all of this only if topX is given
            return this.getNextFiFoObj(nextLinkFiFo);
        }

        return obj;
    }

    /**
     * adds the $count=true param to the url if not already set
     * @param {String} url the url with or without $count=true
     * @returns {String}  the url with set $count=true param
     */
    addCountToUrl (url) {
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
     * extracts the X from $top=X of the given String
     * @param {String} url the url to extract $top from
     * @returns {Number}  the X in $top=X or 0 if no $top was found
     */
    fetchTopX (url) {
        if (typeof url !== "string") {
            return 0;
        }
        const regex = /[$|%24]top=([0-9]+)/,
            result = regex.exec(url);

        if (!Array.isArray(result) || !result.hasOwnProperty(1)) {
            return 0;
        }

        return parseInt(result[1], 10);
    }

    /**
     * extracts the X from $skip=X of the given String
     * @param {String} url the url to extract $skip from
     * @returns {Number}  the X in $skip=X or 0 if no $skip was found
     */
    fetchSkipX (url) {
        if (typeof url !== "string") {
            return 0;
        }
        const regex = /[$|%24]skip=([0-9]+)/,
            result = regex.exec(url);

        if (!Array.isArray(result) || !result.hasOwnProperty(1)) {
            return 0;
        }

        return parseInt(result[1], 10);
    }

    /**
     * sums up the content of progressList and calcs the progress
     * @param {Object[]} progressList the list of progress objects to be calculated
     * @returns {Number}  a number in the range [0..1] round to 2 decimal numbers
     */
    getProgress (progressList) {
        let count = 0,
            progress = 0;

        progressList.forEach(ref => {
            count += ref.count;
            progress += ref.progress;
        });
        if (count === 0) {
            return 0;
        }

        return Math.round(100 / count * progress) / 100;
    }

    /**
     * calls the httpClient as async function to call an url and to receive data from
     * @param {String} url the url to call
     * @param {Function} onsuccess a function (response) with the response of the call
     * @param {Function} onerror a function (error) with the error of the call if any
     * @returns {Void}  -
     */
    callHttpClient (url, onsuccess, onerror) {
        if (typeof this.httpClient === "function") {
            this.httpClient(url, onsuccess, onerror);
            return;
        }

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
     * sets the httpClient after construction (used for testing only)
     * @param {Function} httpClient as function(url, onsuccess, onerror)
     * @post the internal httpClient is set to the given httpClient
     * @return {Void}  -
     */
    setHttpClient (httpClient) {
        this.httpClient = httpClient;
    }

    /**
     * sets the removeIotLinks flag after construction (used for testing only)
     * @param {Boolean} removeIotLinks see options
     * @post the removeIotLinks flag is set to the given removeIotLinks flag
     * @return {Void}  -
     */
    setRemoveIotLinks (removeIotLinks) {
        this.removeIotLinks = removeIotLinks;
    }
}
