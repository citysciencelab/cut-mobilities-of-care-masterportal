import * as defaultMqtt from "mqtt";
import axios from "axios";
import UrlParser from "url-parse";

/**
 * SensorThingsMqtt is the software layer to handle the special needs of the SensorThingsAPI regarding the mqtt protocol.
 * <pre>
 * SensorThingsAPI: https://docs.opengeospatial.org/is/15-078r6/15-078r6.html
 *
 * This software layer uses mqtt 3.1.1
 * mqtt 3.1.1: https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html
 *
 * This layer can simulate Retained Messages if the Broker (Server) is not able to work with retained messages.
 * If the simulation or Retained Messages is activated, for every subscription there will be a single http call send to the Broker (Server).
 *
 * To import SensorThingsMqtt: import {SensorThingsMqtt} from "./SensorThingsMqtt";
 * create a new object:        const obj = new SensorThingsMqtt()
 * connect:                    const client = obj.connect(opts)
 * </pre>
 * @constructor
 * @memberof Core.ModelList.Layer.SensorThingsMqtt
 * @export
 */
export function SensorThingsMqtt () {
    /**
     * the default function to call on error
     * @param {String} errormsg the error message as String
     * @returns {Void}  -
     */
    function _defaultErrorHandler (errormsg) {
        console.warn(errormsg);
    }

    /**
     * connects to the host of the given url with mqtt and calls the given url with http
     * @param {Object} mqttOptions the mqtt options
     * @param {String} mqttOptions.host the mqtt host
     * @param {String} [mqttOptions.protocol] the protocol to use (mqtt, mqtts, ws, wss, wx, wxs), default: mqtt
     * @param {String} [mqttOptions.path] the path to follow (e.g. if protocol is wss, the path might be /mqtt)
     * @param {Object} [mqttOptions.context] the scope to call with
     * @param {mqtt} [mqtt_opt] the mqtt object to be used instead of the default (default is the npm package mqtt)
     * @param {SensorThingsErrorCallback} [onerror_opt] an optional callback to use as errorhandler - if not set console.warn will be triggert on error
     * @returns {SensorThingsHttpClient}  the client to bind the message and connect event and to subscribe and unsubscribe with
     */
    this.connect = function (mqttOptions, mqtt_opt, onerror_opt) {
        const options = Object.assign({
                host: "",
                protocol: "mqtt",
                path: "/",
                context: this
            }, mqttOptions),
            mqttClient = (mqtt_opt || defaultMqtt).connect(options),
            onerror = onerror_opt || _defaultErrorHandler;

        if (options.host === "") {
            onerror("No host was set on connecting with SensorThingsMqtt. Please set the host.");
        }

        return new SensorThingsMqttClient(mqttClient, options.host, options.context);
    };
}

/**
 * The SensorThingsMqttClient - received calling SensorThingsMqtt.connect
 * @constructor
 * @param {mqtt/mqttClient} _mqttClient the mqtt client (e.g. from npm mqtt)
 * @param {String} _mqttHost the mqtt host
 * @param {Object} _context the context to call events in (e.g. this)
 * @memberof Core.ModelList.Layer.SensorThingsMqtt
 * @export
 */
export function SensorThingsMqttClient (_mqttClient, _mqttHost, _context) {
    let _messageHandler;

    /**
     * an async function to call an url and to receive data from
     * @param {String} url the url to call
     * @param {Function} onsuccess a function(resp) with resp as JSON response of the call
     * @returns {Void}  -
     */
    function _defaultHttpClient (url, onsuccess) {
        axios({
            method: "get",
            url: url,
            responseType: "text"
        }).then(function (response) {
            if (typeof onsuccess === "function") {
                onsuccess(response.data);
            }
        }).catch(function (error) {
            console.warn("SensorThingsMqttClient - httpClient - an error occured calling the url: ", url, error);
        });
    }

    /**
     * a function to simulate retained messages via http
     * @param {String} host the protocol, hostname and port (optional) to call e.g. https://example.com
     * @param {String} topic the topic to call e.g. v1.0/Things(614)
     * @param {SensorThingsHttpClient} httpClient the function to call an url with
     * @param {SensorThingsMqttClient~callbackMessage} callbackMessage the handler as function(payload) to give the simulated retained message to
     * @returns {Void}  -
     */
    function _simulateRetainedMessage (host, topic, httpClient, callbackMessage) {
        const term = topic.split("/").pop().toLowerCase(),
            single = term.indexOf("(") >= 0,
            subTerm = single ? term.substr(0, term.indexOf("(")) : term,
            parsedUrl = new UrlParser(host + "/" + topic);

        switch (subTerm) {
            case "observations":
                // only first observation is relevant for retained messages
                if (!single) {
                    parsedUrl.set("query", "$orderby=phenomenonTime desc&$top=1");
                }
                httpClient(parsedUrl.href, function (resp) {
                    if (!single && Array.isArray(resp.value) && resp.value.length) {
                        callbackMessage.call(_context, topic, resp.value[0]);
                    }
                    else {
                        callbackMessage.call(_context, topic, resp);
                    }
                });
                break;
            case "locations":
                // there should be only one location
                httpClient(parsedUrl.href, function (resp) {
                    if (!single && Array.isArray(resp.value) && resp.value.length) {
                        callbackMessage.call(_context, topic, resp.value[0]);
                    }
                    else {
                        callbackMessage.call(_context, topic, resp);
                    }
                });
                break;
            default:
                httpClient(parsedUrl.href, function (resp) {
                    callbackMessage.call(_context, topic, resp);
                });
        }
    }

    /**
     * sets a handler as event of "eventName" for the _mqttClient
     * @description if eventName equals 'message', handler is set as instance variable _messageHandler - later used for the simulation of retained messages
     * @param {String} eventName the name of the mqtt event (connect, message, close, end, error)
     * @param {SensorThingsMqttCallbackMessage} handler the event handler
     * @returns {Void}  -
     */
    this.on = function (eventName, handler) {
        if (typeof handler !== "function") {
            return;
        }

        if (eventName === "message") {
            _messageHandler = handler;
            _mqttClient.on(eventName, function (topic, payload) {
                try {
                    return handler.call(_context, topic, JSON.parse(payload));
                }
                catch (e) {
                    return handler.call(_context, topic, payload);
                }
            });
        }
        else {
            _mqttClient.on(eventName, function (...args) {
                return handler.apply(_context, args);
            });
        }
    };

    /**
     * function to subscribe to a topic
     * @param {String} topic the SensorThings topic to subscribe at
     * @param {Object} [options_opt] a few options that can be set
     * @param {Number} [options_opt.qos=0] flag of how to set quality of service for this subscription - see: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169
     * @param {Number} [options_opt.retain=0] flag of how to use retained messages for this subscription - see: https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc385349265
     * @param {Boolean} [options_opt.rm_simulate=true] false if no simulation of retained messages should take place, otherwise true
     * @param {String} [options_opt.rm_path=""] a path on the server in case the path differs from the standard implementation
     * @param {String} [options_opt.rm_protocol="https"] the protocol to use for the simulation (http, https, ...)
     * @param {SensorThingsClientHttp} [options_opt.rm_httpClient] a function to call an url with for the simulation instead of using the default (_defaultHttpClient)
     * @param {SensorThingsMqttCallbackMessage} [onmessage_opt] a function to be called for receiving the message, default: _messageHandler
     * @returns {Void}  -
     */
    this.subscribe = function (topic, options_opt, onmessage_opt) {
        const options = Object.assign({
            qos: 0,
            retain: 0,
            rm_simulate: false,
            rm_path: "",
            rm_protocol: "https",
            rm_httpClient: _defaultHttpClient
        }, options_opt);

        _mqttClient.subscribe(topic, options);

        if (options.rm_simulate && (options.retain !== 2)) {
            // simulate retained message
            _simulateRetainedMessage(options.rm_protocol + "://" + _mqttHost + options.rm_path, topic, options.rm_httpClient, onmessage_opt || _messageHandler);
        }
    };

    /**
     * unsubscribes from the server
     * @param {String} topic the SensorThings topic to unsubscribe from
     * @returns {Void}  -
     */
    this.unsubscribe = function (topic) {
        _mqttClient.unsubscribe(topic);
    };

    /**
     * returns the currently used mqttClient
     * @returns {mqtt/mqttClient}  the currently used mqtt client
     */
    this.getMqttClient = function () {
        return _mqttClient;
    };

}

/**
 * a function to receive the mqtt response with
 * @callback SensorThingsMqttCallbackMessage
 * @param {String} topic the topic that has been received an update
 * @param {Object} payload the pushed response from the mqtt server
 */

/**
 * a function to call on error
 * @callback SensorThingsErrorCallback
 * @param {String} errormsg the error message as String
 */

/**
 * a function to call data from a http api with
 * @callback SensorThingsHttpClient
 * @param {String} url the url to call
 * @param {Function} onsuccess a function (resp) with the response of the call
 * @param {SensorThingsErrorCallback} onerror a function to handle errors with
 */
