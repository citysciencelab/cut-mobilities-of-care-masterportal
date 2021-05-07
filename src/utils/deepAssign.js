/**
 * This function provides a "soft" deep assign of objects, where objects aren't overwritten, but followed.
 *
 * EXAMPLES
 * // In this example the m-object has a property x that isn't replaced but left intact by deepAssign:
 * a = {m: {x: 1, y: 1}};
 * deepAssign(a, {m: {y: 2}});
 * // -> {m: {x: 1, y: 2}}
 *
 * // In this example the m-object has a property x that is replaced and thereby destroyed by Object.assign:
 * a = {m: {x: 1, y: 1}};
 * Object.assign(a, {m: {y: 2}});
 * // -> {m: {y: 2}}
 *
 * @param {Object} target The target object — what to apply the sources' properties to, which is returned after it is modified.
 * @param {Object} sources The source object(s) — objects containing the properties you want to apply.
 * @returns {Object} The modified target object.
 */
export default function deepAssign (target, ...sources) {
    if (typeof target !== "object" || target === null) {
        console.error("deepAssign: The given target is not an object. Please check the target object before handing it over to deepAssign.");
        return null;
    }

    sources.forEach(source => {
        // the depth barrier is fixed to a depth of 200
        deepAssignHelper(target, source, 200);
    });

    return target;
}
/**
 * helper function for the recursion
 * @param {Object} target The target object — what to apply the sources properties to.
 * @param {Object} source The source object — object containing the properties you want to apply.
 * @param {Number} depthBarrier The depth barrier to escape infinit loops.
 * @param {Number} [depth=0] The depth of the current recursion.
 * @returns {void}
 */
function deepAssignHelper (target, source, depthBarrier, depth = 0) {
    if (
        depthBarrier <= depth
        || typeof source !== "object" || source === null
    ) {
        return;
    }

    Object.keys(source).forEach(key => {
        if (typeof source[key] === "object" && source[key] !== null) {
            if (!target.hasOwnProperty(key) || typeof target[key] !== "object" || target[key] === null) {
                target[key] = {};
            }
            deepAssignHelper(target[key], source[key], depthBarrier, depth + 1);
        }
        else {
            target[key] = source[key];
        }
    });
}
