var context;

function requireAll (req, callback) {
    // store moduleName => module mappings to prevent overriding
    const modules = {},
        reqList = req;

    if (!Array.isArray(reqList)) {
        reqList = [reqList];
    }
    // go trough each require.context
    for (const reqItem of reqList) {
        // go through each module
        for (const name of reqItem.keys()) {
            let module;

            // skip module if it is already required
            if (modules.hasOwnProperty(name)) {
                continue;
            }
            // require module
            module = reqItem(name);

            if (module.default) {
                module = module.default;
            }
            // callback
            if (callback) {
                return callback(module, name);
            }
            // memorize module
            modules[name] = module;
        }
    }
    return modules;
}

context = requireAll([
    require.context("./modules/", true, /.+\.js?$/),
    require.context("../../portalconfigs/test/", true, /.+\.js?$/)
]);

export default context;
