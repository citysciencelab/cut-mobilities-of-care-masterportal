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
                getValue: () => srcDom.textContent,
                getAttributes: () => parseNodeAttributes(srcDom.attributes)
            };
        }
        return {
            getValue: () => srcDom.textContent,
            getAttributes: () => undefined
        };
    }

    children.forEach(child => {
        // checking if child has siblings of same name
        const childIsArray = children.filter(eachChild => eachChild.nodeName === child.nodeName).length > 1,
            // the key is equal to the nodeName property without the xmlns if exists
            keyName = child.nodeName.substr(child.nodeName.indexOf(":") + 1);

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
 * @param {Object} nodeAttributes - collection of nodes attributes as a NamedNodeMap object
 * @returns {Object} name value pairs
 */
function parseNodeAttributes (nodeAttributes) {
    const attributes = {};

    nodeAttributes.forEach(node => {
        attributes[node.name] = node.value;
    });
    return attributes;
}

/**
 * Make sure we have Node.children and Element.children available.
 * Internet Explorer 11 Polyfill.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children}
 */
(function (constructor) {
    if (
        constructor
        && constructor.prototype
        && !constructor.prototype.hasOwnProperty("children")
    ) {
        Object.defineProperty(constructor.prototype, "children", {
            get: function () {
                const nodes = this.childNodes,
                    children = [];

                // iterate all childNodes
                nodes.forEach(function (node) {
                    // remenber those, that are Node.ELEMENT_NODE (1)
                    if (node.nodeType === 1) {
                        children.push(node);
                    }
                });
                return children;
            }
        });
    }
    // apply the fix to all HTMLElements (window.Element) and to SVG/XML (window.Node)
})(window.Node || window.Element);
