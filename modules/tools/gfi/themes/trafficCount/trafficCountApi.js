import {SensorThingsHttp} from "../../../../../modules/core/modelList/layer/sensorThingsHttp.js";
import {SensorThingsMqtt} from "../../../../../modules/core/modelList/layer/sensorThingsMqtt.js";
import moment from "moment";

// change language from moment.js to german
moment.locale("de");

/**
 * TrafficCountApi is the api for the TrafficCount GFI Theme
 * <pre>
 * The TrafficCountApi uses SensorThingsHttp and SensorThingsMqtt to provide simple access to basic functions for the TrafficCount GFI Theme
 * Any subscription is handled by the TrafficCountApi.
 *
 * To import TrafficCountApi: import {TrafficCountApi} from "./trafficCountApi";
 * create a new object:        const obj = new TrafficCountApi(...);
 * remember to unsubscribe:    obj.unsubscribeEverything();
 * </pre>
 * @param {String} httpHost the host (incl. protocol) to call any http request with
 * @param {String} sensorThingsVersion the used version of the SensorThingsAPI (e.g. "v1.0")
 * @param {Object} [mqttOptions] the options to connect to mqtt with
 * @param {Object} [sensorThingsHttpOpt] an optional http client for testing
 * @param {Object} [sensorThingsMqttOpt] an optional mqtt client for testing
 * @class
 * @memberof Tools.GFI.Themes.TrafficCount
 */
export function TrafficCountApi (httpHost, sensorThingsVersion, mqttOptions, sensorThingsHttpOpt, sensorThingsMqttOpt) {
    const http = sensorThingsHttpOpt || new SensorThingsHttp(),
        mqtt = sensorThingsMqttOpt || new SensorThingsMqtt(),
        mqttClient = mqtt && typeof mqtt.connect === "function" ? mqtt.connect(mqttOptions) : false,
        baseUrlHttp = httpHost + "/" + sensorThingsVersion;
    let subscriptionTopics = {};

    // sets the generell mqtt listener
    if (mqttClient && typeof mqttClient.on === "function") {
        mqttClient.on("message", function (topic, payload) {
            if (subscriptionTopics.hasOwnProperty(topic)) {
                if (!Array.isArray(subscriptionTopics[topic])) {
                    return;
                }

                subscriptionTopics[topic].forEach(callback => {
                    if (typeof callback !== "function") {
                        // continue
                        return;
                    }
                    callback(payload);
                });
            }
        });
    }

    /**
     * the default function to call on error
     * @param {String[]} errorargs the error messages as array of Strings
     * @returns {Void}  -
     */
    function defaultErrorHandler (...errorargs) {
        console.warn(errorargs);
    }

    /**
     * checks if the given dataset has a datastream with an id and an array of observations
     * @param {Object} dataset the dataset to check
     * @returns {Boolean}  true/false
     */
    function checkForObservations (dataset) {
        return Array.isArray(dataset) && dataset.length > 0 && dataset[0].hasOwnProperty("Datastreams")
            && Array.isArray(dataset[0].Datastreams) && dataset[0].Datastreams.length > 0 && dataset[0].Datastreams[0].hasOwnProperty("@iot.id")
            && Array.isArray(dataset[0].Datastreams[0].Observations);
    }

    /**
     * sums up the observation results of the given structure
     * @param {Object} dataset the dataset to go through
     * @returns {Integer|Boolean}  the sum of all found observation results
     */
    function sumObservations (dataset) {
        if (!checkForObservations(dataset)) {
            return false;
        }

        let sum = 0;

        dataset[0].Datastreams[0].Observations.forEach(observation => {
            if (!observation.hasOwnProperty("result")) {
                // continue
                return;
            }

            sum += observation.result;
        });

        return sum;
    }

    /**
     * returns the oldest date as phenomenonTime of the given structure
     * @param {Object} dataset the dataset to go through
     * @param {String} [firstDateSoFar] the firstDate to account for the "firstest" so far, todays date if no firstDateSoFar is given
     * @returns {String|Boolean}  the first date in format YYYY-MM-DD or false if no observations were found
     */
    function getFirstDate (dataset, firstDateSoFar) {
        if (!checkForObservations(dataset)) {
            return false;
        }

        // set firstDate to today
        let firstDate = firstDateSoFar || moment().format("YYYY-MM-DD"),
            phenomenonTime = "";

        dataset[0].Datastreams[0].Observations.forEach(observation => {
            if (!observation.hasOwnProperty("phenomenonTime")) {
                // continue
                return;
            }

            phenomenonTime = parsePhenomenonTime(observation.phenomenonTime);
            if (phenomenonTime < firstDate) {
                firstDate = phenomenonTime;
            }
        });

        return firstDate;
    }

    /**
     * checks a phenomenonTime for interval, if not phenomenonTime is returned, if so the last part of the interval is returned
     * @info phenomenonTime could be either "2020-03-16T14:30:01.000Z" or "2020-03-16T14:30:01.000Z/2020-03-16T14:45:00.000Z"
     * @param {String} phenomenonInterval the phenomenonTime either as value or interval (see info)
     * @returns {String} the phenomenonTime
     */
    function parsePhenomenonTime (phenomenonInterval) {
        if (typeof phenomenonInterval !== "string") {
            return "";
        }

        const phenomenonArray = phenomenonInterval.split("/");

        return phenomenonArray[phenomenonArray.length - 1];
    }

    /**
     * subscribes to a topic
     * @param {String} topic the topic to subscribe to
     * @param {Object} options the options for the mqtt client
     * @param {callback} handler the event as function(payload) to be called when receiving new data
     * @returns {Void}  -
     */
    function mqttSubscribe (topic, options, handler) {
        if (!subscriptionTopics.hasOwnProperty(topic)) {
            // new subscription
            subscriptionTopics[topic] = [];

            if (mqttClient && typeof mqttClient.subscribe === "function") {
                mqttClient.subscribe(topic, options);
            }
        }

        subscriptionTopics[topic].push(handler);
    }

    /**
     * gets the title of the thing
     * @param {Integer} thingId the ID of the thing
     * @param {Callback} [onupdate] as function(title) to set the title with
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    this.updateTitle = function (thingId, onupdate, onerror, onstart, oncomplete) {
        const url = baseUrlHttp + "/Things(" + thingId + ")";

        return http.get(url, (dataset) => {
            if (Array.isArray(dataset) && dataset.length > 0 && dataset[0].hasOwnProperty("name")) {
                if (typeof onupdate === "function") {
                    onupdate(dataset[0].name);
                }
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.getTitle: the response does not include a Thing with a proper name", dataset);
            }
        }, onstart, oncomplete, onerror || defaultErrorHandler);
    };

    /**
     * gets the sum for a single day excluding todays last 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {String} day the day as String in format YYYY-MM-DD
     * @param {Callback} [onupdate] as event function(date, value) fires initialy and anytime server site changes are made
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @param {String} [dayTodayOpt=NOW] as a String marking todays date in format YYYY-MM-DD; if left false, today is set automatically
     * @returns {Void}  -
     */
    this.updateDay = function (thingId, meansOfTransport, day, onupdate, onerror, onstart, oncomplete, dayTodayOpt) {
        let sum = 0;
        const startDate = moment(day, "YYYY-MM-DD").toISOString(),
            endDate = moment(day, "YYYY-MM-DD").add(1, "day").toISOString(),
            url = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_15-Min';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + "))";

        return http.get(url, (dataset) => {
            if (checkForObservations(dataset)) {
                sum = sumObservations(dataset);

                if (typeof onupdate === "function") {
                    onupdate(day, sum);
                }

                // if day equals dayToday: make a mqtt subscription to refresh sum
                if (day === (dayTodayOpt || moment().format("YYYY-MM-DD"))) {
                    // subscribe via mqtt
                    const datastreamId = dataset[0].Datastreams[0]["@iot.id"],
                        topic = sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                    // set retain to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
                    mqttSubscribe(topic, {retain: 2}, (payload) => {
                        if (payload && payload.hasOwnProperty("result")) {
                            sum += payload.result;

                            if (typeof onupdate === "function") {
                                onupdate(day, sum);
                            }
                        }
                        else {
                            (onerror || defaultErrorHandler)("TrafficCountAPI.updateDay: the payload does not include a result", payload);
                        }
                    });
                }
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.updateDay: the dataset does not include a datastream with an observation", dataset);
            }
        }, onstart, oncomplete, onerror || defaultErrorHandler);
    };

    /**
     * gets the sum of a year excluding todays last 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {String} year the year as String in format YYYY
     * @param {Callback} onupdate as event function(year, value) fires initialy and anytime server site changes are made
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @param {String} [yearTodayOpt=NOW] as a String marking todays year in format YYYY; if left false, todays year is set automatically
     * @returns {Void}  -
     */
    this.updateYear = function (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete, yearTodayOpt) {
        let sumWeekly = 0,
            sumThisWeek = 0;
        const startDate = moment(year, "YYYY-MM-DD").toISOString(),
            endDate = moment(year, "YYYY-MM-DD").add(1, "year").toISOString(),
            urlWeekly = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_1-Woche';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + "))",
            lastMonday = moment().startOf("isoWeek").format("YYYY-MM-DD"),
            yearToday = yearTodayOpt || moment().format("YYYY"),
            urlThisWeeks15min = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_15-Min';$expand=Observations($filter=date(phenomenonTime) ge '" + lastMonday + "'))";

        return http.get(urlWeekly, (datasetWeekly) => {
            if (checkForObservations(datasetWeekly)) {
                sumWeekly = sumObservations(datasetWeekly);

                if (year !== yearToday) {
                    if (typeof onupdate === "function") {
                        onupdate(year, sumWeekly);
                    }
                    return;
                }

                // year eq todays year
                http.get(urlThisWeeks15min, (dataset15min) => {
                    if (checkForObservations(dataset15min)) {
                        sumThisWeek = sumObservations(dataset15min);

                        if (typeof onupdate === "function") {
                            onupdate(year, sumWeekly + sumThisWeek);
                        }

                        // subscribe via mqtt
                        const datastreamId = dataset15min[0].Datastreams[0]["@iot.id"],
                            topic = sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                        // set retain to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
                        mqttSubscribe(topic, {retain: 2}, (payload) => {
                            if (payload && payload.hasOwnProperty("result")) {
                                sumThisWeek += payload.result;

                                if (typeof onupdate === "function") {
                                    onupdate(year, sumWeekly + sumThisWeek);
                                }
                            }
                            else {
                                (onerror || defaultErrorHandler)("TrafficCountAPI.updateYear: the payload does not include a result", payload);
                            }
                        });
                    }
                    else {
                        (onerror || defaultErrorHandler)("TrafficCountAPI.updateYear: dataset15min does not include a datastream with an observation", dataset15min);
                    }
                }, false, oncomplete, onerror || defaultErrorHandler);
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.updateYear: datasetWeekly does not include a datastream with an observation", datasetWeekly);
            }
        }, onstart, year !== yearToday ? oncomplete : false, onerror || defaultErrorHandler);
    };

    /**
     * gets the total sum excluding todays last 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {Callback} onupdate as event function(firstDate, value) fires initialy and anytime server site changes are made
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    this.updateTotal = function (thingId, meansOfTransport, onupdate, onerror, onstart, oncomplete) {
        let sumWeekly = 0,
            sumThisWeek = 0,
            firstDate = false;
        const urlWeekly = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_1-Woche';$expand=Observations)",
            lastMonday = moment().startOf("isoWeek").format("YYYY-MM-DD"),
            urlThisWeeks15min = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_15-Min';$expand=Observations($filter=date(phenomenonTime) ge '" + lastMonday + "'))";

        return http.get(urlWeekly, (datasetWeekly) => {
            if (checkForObservations(datasetWeekly)) {
                sumWeekly = sumObservations(datasetWeekly);
                firstDate = getFirstDate(datasetWeekly);

                http.get(urlThisWeeks15min, (dataset15min) => {
                    if (checkForObservations(dataset15min)) {
                        sumThisWeek = sumObservations(dataset15min);
                        firstDate = getFirstDate(dataset15min, firstDate);

                        if (typeof onupdate === "function") {
                            onupdate(moment.utc(firstDate.substr(0, 24)).local().format("YYYY-MM-DD"), sumWeekly + sumThisWeek);
                        }

                        // subscribe via mqtt
                        const datastreamId = dataset15min[0].Datastreams[0]["@iot.id"],
                            topic = sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                        // set retain to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
                        mqttSubscribe(topic, {retain: 2}, (payload) => {
                            if (payload && payload.hasOwnProperty("result")) {
                                sumThisWeek += payload.result;

                                if (typeof onupdate === "function") {
                                    onupdate(moment.utc(firstDate.substr(0, 24)).local().format("YYYY-MM-DD"), sumWeekly + sumThisWeek);
                                }
                            }
                            else {
                                (onerror || defaultErrorHandler)("TrafficCountAPI.updateTotal: the payload does not include a result", payload);
                            }
                        });
                    }
                    else {
                        (onerror || defaultErrorHandler)("TrafficCountAPI.updateTotal: dataset15min does not include a datastream with an observation", dataset15min);
                    }
                }, false, oncomplete, onerror || defaultErrorHandler);
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.updateTotal: datasetWeekly does not include a datastream with an observation", datasetWeekly);
            }
        }, onstart, false, onerror || defaultErrorHandler);
    };

    /**
     * gets the strongest day in the given year excluding today
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {String} year the year as String in format YYYY
     * @param {Callback} onupdate as event function(date, value)
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    this.updateHighestWorkloadDay = function (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        const startDate = moment(year, "YYYY-MM-DD").toISOString(),
            endDate = moment(year, "YYYY-MM-DD").add(1, "year").toISOString(),
            url = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_1-Tag';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + ";$orderby=result DESC;$top=1))";

        return http.get(url, (dataset) => {
            if (checkForObservations(dataset)) {
                const value = sumObservations(dataset),
                    date = getFirstDate(dataset);

                if (typeof onupdate === "function") {
                    onupdate(moment.utc(date.substr(0, 24)).local().format("YYYY-MM-DD"), value);
                }
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.updateHighestWorkloadDay: dataset does not include a datastream with an observation", dataset);
            }
        }, onstart, oncomplete, onerror || defaultErrorHandler);
    };

    /**
     * gets the strongest week in the given year excluding the current week
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {String} year the year as String in format YYYY
     * @param {Callback} onupdate as event function(calendarWeek, value)
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    this.updateHighestWorkloadWeek = function (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        const startDate = moment(year, "YYYY-MM-DD").toISOString(),
            endDate = moment(year, "YYYY-MM-DD").add(1, "year").toISOString(),
            url = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_1-Woche';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + ";$orderby=result DESC;$top=1))";

        return http.get(url, (dataset) => {
            if (checkForObservations(dataset)) {
                const value = sumObservations(dataset),
                    date = getFirstDate(dataset);

                if (typeof onupdate === "function") {
                    onupdate(moment(date).week(), value);
                }
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.updateHighestWorkloadWeek: dataset does not include a datastream with an observation", dataset);
            }
        }, onstart, oncomplete, onerror || defaultErrorHandler);
    };


    /**
     * gets the strongest month in the given year including the current month
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {String} year the year as String in format YYYY
     * @param {Callback} onupdate as event function(month, value)
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    this.updateHighestWorkloadMonth = function (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        const startDate = moment(year, "YYYY-MM-DD").toISOString(),
            endDate = moment(year, "YYYY-MM-DD").add(1, "year").toISOString(),
            url = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_1-Tag';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + "))",
            sumMonths = {"01": 0};
        let bestMonth = 0,
            bestSum = 0,
            month;

        return http.get(url, (dataset) => {
            if (checkForObservations(dataset)) {
                dataset[0].Datastreams[0].Observations.forEach(observation => {
                    if (!observation.hasOwnProperty("result") || !observation.hasOwnProperty("phenomenonTime")) {
                        // continue
                        return;
                    }

                    month = moment.utc(observation.phenomenonTime.substr(0, 24)).local().format("MM");
                    if (!sumMonths.hasOwnProperty(month)) {
                        sumMonths[month] = 0;
                    }
                    sumMonths[month] += observation.result;

                    if (sumMonths[month] > bestSum) {
                        bestSum = sumMonths[month];
                        bestMonth = month;
                    }
                });

                if (typeof onupdate === "function") {
                    onupdate(moment(bestMonth, "MM").format("MMMM"), bestSum);
                }
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.updateHighestWorkloadMonth: dataset does not include a datastream with an observation", dataset);
            }
        }, onstart, oncomplete, onerror || defaultErrorHandler);

    };

    /**
     * gets the data for a diagram or table for the given interval
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {String} interval the interval to call as '15-Min', '1-Stunde' or '1-Woche'
     * @param {String} from the day to start from (inclusive) as String in format YYYY-MM-DD
     * @param {String} until the day to end with (inclusive) as String in format YYYY-MM-DD
     * @param {Callback} onupdate as event function(data) fires initialy and anytime server site changes are made; with data as object {meansOfTransport: {date: value}}
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @param {String} [todayUntilOpt=NOW] as a String marking todays date in format YYYY-MM-DD; if left false, today is set automatically
     * @returns {Void}  -
     */
    this.updateDataset = function (thingId, meansOfTransport, interval, from, until, onupdate, onerror, onstart, oncomplete, todayUntilOpt) { // eslint-disable-line
        const url = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_" + interval + "';$expand=Observations($filter=date(phenomenonTime) ge '" + from + "' and date(phenomenonTime) le '" + until + "'))",
            meansOfTransportFahrzeuge = "AnzFahrzeuge",
            meansOfTransportSV = "AntSV",
            result = {},
            todayUntil = todayUntilOpt || moment().format("YYYY-MM-DD");

        result[meansOfTransport] = {};

        return http.get(url, (dataset) => {
            if (checkForObservations(dataset)) {
                dataset[0].Datastreams[0].Observations.forEach(observation => {
                    if (!observation.hasOwnProperty("result") || !observation.hasOwnProperty("phenomenonTime")) {
                        // continue
                        return;
                    }

                    result[meansOfTransport][observation.phenomenonTime] = observation.result;
                });

                if (meansOfTransport === meansOfTransportFahrzeuge) {
                    // call SV & subscribe
                    this.updateDataset(thingId, meansOfTransportSV, interval, from, until, resultSV => {
                        if (typeof onupdate === "function") {
                            Object.assign(result, resultSV);
                            onupdate(result);
                        }
                    }, onerror, false, oncomplete, todayUntilOpt);
                }
                else if (typeof onupdate === "function") {
                    onupdate(result);
                }

                if (until >= todayUntil) {
                    // subscribe via mqtt
                    const datastreamId = dataset[0].Datastreams[0]["@iot.id"],
                        topic = sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                    // set retain to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
                    mqttSubscribe(topic, {retain: 2}, (payload) => {
                        if (payload && payload.hasOwnProperty("result") && payload.hasOwnProperty("phenomenonTime")) {
                            result[meansOfTransport][payload.phenomenonTime] = payload.result;

                            if (typeof onupdate === "function") {
                                onupdate(result);
                            }
                        }
                        else {
                            (onerror || defaultErrorHandler)("TrafficCountAPI.updateDataset: the payload does not include a result", meansOfTransport, payload);
                        }
                    });
                }
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.updateDataset: dataset does not include a datastream with an observation", meansOfTransport, dataset);
            }
        }, onstart, meansOfTransport !== meansOfTransportFahrzeuge ? oncomplete : false, onerror || defaultErrorHandler);
    };

    /**
     * subscribes the last change of data based on 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'AnzFahrraeder' or 'AnzFahrzeuge'
     * @param {Callback} [onupdate] as event function(phenomenonTime) fires initialy and anytime server site changes are made
     * @param {Callback} [onerror] as function(error) to fire on error
     * @param {Callback} [onstart] as function() to fire before any async action has started
     * @param {Callback} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    this.subscribeLastUpdate = function (thingId, meansOfTransport, onupdate, onerror, onstart, oncomplete) {
        const url = baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + "_15-Min')";

        // get the datastreamId via http to subscribe to with mqtt
        return http.get(url, (dataset) => {
            if (
                Array.isArray(dataset) && dataset.length > 0 && dataset[0].hasOwnProperty("Datastreams")
                && Array.isArray(dataset[0].Datastreams) && dataset[0].Datastreams.length > 0 && dataset[0].Datastreams[0].hasOwnProperty("@iot.id")
            ) {
                // subscribe via mqtt
                const datastreamId = dataset[0].Datastreams[0]["@iot.id"],
                    topic = sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                // set retain to 0 to get the last message from the server immediately (see doc\sensorThings_EN.md)
                mqttSubscribe(topic, {
                    retain: 0,
                    rmSimulate: true
                }, (payload) => {
                    if (payload && payload.hasOwnProperty("phenomenonTime")) {
                        if (typeof onupdate === "function") {
                            onupdate(payload.phenomenonTime);
                        }
                    }
                    else {
                        (onerror || defaultErrorHandler)("TrafficCountAPI.getTitle: the payload does not include a phenomenonTime", payload);
                    }
                });
            }
            else {
                (onerror || defaultErrorHandler)("TrafficCountAPI.subscribeLastUpdate: the response does not include a Datastream with a proper @iot.id", dataset);
            }
        }, onstart, oncomplete, onerror || defaultErrorHandler);
    };

    /**
     * unsubscribe all subscriptions that have been made so far by any function of this api
     * @param {Callback} [onsuccess] an event function() to fire when all subscriptions have been successfully canceled
     * @returns {Void}  -
     */
    this.unsubscribeEverything = function (onsuccess) {
        const topics = Object.keys(this.getSubscriptionTopics());

        this.setSubscriptionTopics({});

        if (mqttClient && typeof mqttClient.unsubscribe === "function" && Array.isArray(topics) && topics.length > 0) {
            topics.forEach(topic => {
                mqttClient.unsubscribe(topic);
            });
        }

        if (typeof onsuccess === "function") {
            onsuccess();
        }
    };

    /**
     * gets the subscribed topics
     * @returns {Object}  an object {topic => [callback(payload)]} with all subscriptions
     */
    this.getSubscriptionTopics = function () {
        return subscriptionTopics;
    };

    /**
     * sets the subscribed topics
     * @info this is for the purpose of testing
     * @param {Object} object an object {topic => [callback(payload)]} with all subscriptions
     * @returns {Void}  -
     */
    this.setSubscriptionTopics = function (object) {
        subscriptionTopics = object;
    };

    /**
     * gets the base url for http calls
     * @returns {String}  the used base url vor http calls
     */
    this.getBaseUrlHttp = function () {
        return baseUrlHttp;
    };

    /**
     * gets the on construction initialized mqtt client
     * @returns {Object}  the mqtt client
     */
    this.getMqttClient = function () {
        return mqttClient;
    };

    /**
     * gets the on construction initialized http connector
     * @returns {Object}  the SensorThingsHttp
     */
    this.getSensorThingsHttp = function () {
        return http;
    };

    /**
     * gets the on construction initialized mqtt connector
     * @returns {Object}  the SensorThingsMqtt
     */
    this.getSensorThingsMqtt = function () {
        return mqtt;
    };

    // internal shadow functions for testing
    this.checkForObservations = checkForObservations;
    this.sumObservations = sumObservations;
    this.getFirstDate = getFirstDate;
    this.mqttSubscribe = mqttSubscribe;
}
