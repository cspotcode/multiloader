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
const loaders = await Promise.all(loaderSpecifiers.map(loaderSpecifier => import(loaderSpecifier)));

// TODO feature-detect node version; switch between loader APIs
export async function resolve(specifier, context, nodeDefaultResolve) {
    return await invokeLoaderResolve(0, specifier, context);
    async function invokeLoaderResolve(startingIndex, specifier, context) {
        let index;
        for(index = startingIndex; index < loaders.length; index++) {
            if(typeof loaders[index].resolve === 'function') break;
        }
        if(index >= loaders.length) {
            return await nodeDefaultResolve(specifier, context, nodeDefaultResolve);
        } else {
            debugLog(`invoking resolve function for loader index ${index} named ${loaderSpecifiers[index]}`);
            const resolveFunction = loaders[index].resolve;
            return await resolveFunction(specifier, context, async (specifier, context, defaultResolve) => {
                // loader tried to delegate to the default
                return await invokeLoaderResolve(index + 1, specifier, context);
            });
        }
    }
}

export async function load(url, context, nodeDefaultLoad) {
    return await invokeLoaderLoad(0, url, context);
    async function invokeLoaderLoad(startingIndex, specifier, context) {
        let index;
        for(index = startingIndex; index < loaders.length; index++) {
            if(typeof loaders[index].load === 'function') break;
        }
        if(index >= loaders.length) {
            return await nodeDefaultLoad(url, context, nodeDefaultLoad);
        } else {
            const loadFunction = loaders[index].load;
            debugLog(`invoking load function for loader index ${index} named ${loaderSpecifiers[index]}`);
            return await loadFunction(url, context, async (url, context, defaultLoad) => {
                // loader tried to delegate to the default
                return await invokeLoaderLoad(index + 1, url, context);
            });
        }
    }
}
