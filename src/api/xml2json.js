import substrStartFromValue from "../utils/substrStartFromValue.js";

/**
 * Parses Xml to Json recursivly
 * @param {XMLDocument} srcDom - Dom to parse
 * @returns {Object} json
 */
export default function xml2json (srcDom) {
    // HTMLCollection to Array
    const children = [...srcDom.children],
        jsonResult = {};

    // base case for recursion
    if (!children.length) {
        if (srcDom.hasAttributes()) {
            return {
                getValue: () => srcDom.innerHTML,
                getAttributes: () => parseNodeAttributes(srcDom.attributes)
            };
        }
        return {
            getValue: () => srcDom.innerHTML,
            getAttributes: () => undefined
        };
    }

    children.forEach(child => {
        // checking is child has siblings of same name
        const childIsArray = children.filter(eachChild => eachChild.nodeName === child.nodeName).length > 1,
            // the key is equal to the nodeName property without the xmlns, if existing
            keyName = substrStartFromValue(child.nodeName, ":");

        // if child is array, save the values as an array of objects, else as object
        if (childIsArray) {
            if (jsonResult[keyName] === undefined) {
                jsonResult[keyName] = [xml2json(child)];
            }
            else {
                jsonResult[keyName].push(xml2json(child));
            }
        }
        else {
            jsonResult[keyName] = xml2json(child);
        }
    });

    return jsonResult;
}

/**
 * Gets the names and the values from the attributes of a node
 * @param {Object} nodeAttributes - collection of node's attributes as a NamedNodeMap object
 * @returns {Object} name value pairs
 */
function parseNodeAttributes (nodeAttributes) {
    const attributes = {};

    nodeAttributes.forEach(node => {
        attributes[node.name] = node.value;
    });
    return attributes;
}
