const selfUrl = new URL(import.meta.url);

function debugDir(arg) {
    // console.dir(arg);
}
function debugLog(...args) {
    // console.log(arg);
}

const [commaSeparatedLoaders] = [...selfUrl.searchParams.keys()];
const loaderSpecifiers = commaSeparatedLoaders.split(',').filter(s => s);
debugDir(selfUrl.toString());

const loaderPromises = loaderSpecifiers.map(loaderSpecifier => import(loaderSpecifier));
const loaderPromises = [];
const loaders = [];

let loadersInitialized = null;
const loadersApi = {
    add(hooks, options) {
        const {force = false} = options ?? {};
        if(force !== true) throw new Error('Adding loaders without forcing is not implemented yet');
        loadersInitialized = Promise.resolve(loadersInitialized).then(() => {
            loaderPromises.push(hooks);
            loaders = await Promise.all(loaderPromises);
            invokers = createInvokers();
        });
        return loadersInitialized;
    }
}

process.loaders = loadersApi;

// TODO feature-detect node version; switch between loader APIs

export async function resolve(specifier, context, nodeDefaultResolve) {
    return await invokers.resolve(0, specifier, context, nodeDefaultResolve);
}

export async function load(url, context, nodeDefaultLoad) {
    return await invokers.load(0, url, context, nodeDefaultLoad);
}

let invokers = createInvokers();
function createInvokers() {
    return {
        resolve: createInvoker('resolve', loaders),
        load: createInvoker('load', loaders)
    };
}

function createInvoker(hookName, loaders) {
    return invoker;
    async function invoker(startingIndex, specifier, context, defaultHook) {
        let index;
        for(index = startingIndex; index < loaders.length; index++) {
            if(typeof loaders[index][hookName] === 'function') break;
        }
        if(index >= loaders.length) {
            debugLog(`invoking node's default ${hookName} function`);
            return await defaultHook(specifier, context, defaultHook);
        } else {
            debugLog(`invoking ${hookName} function for loader index ${index} named ${loaderSpecifiers[index]}`);
            const resolveFunction = loaders[index][hookName];
            return await resolveFunction(specifier, context, async (specifier, context, _defaultHook) => {
                // loader tried to delegate to the default
                return await invokeLoaderResolve(index + 1, specifier, context, defaultHook);
            });
        }
    }
}
