import fs from "fs";

interface ConfigOptions {
    path?: string;
    logMissing?: boolean;
}

function acfg<T extends object>(DEFAULT_CONFIG: T, o?: ConfigOptions): T {
    const configPath = o?.path ?? "./config.json";
    const logMissing = o?.logMissing ?? false;

    if (fs.existsSync(configPath)) {
        let target = readConfig<typeof DEFAULT_CONFIG>(configPath);
        const x = new Proxy(target, {
            get(_, _prop) {
                const targetProp = _prop as keyof typeof DEFAULT_CONFIG;

                // If the property is in the config, return the value
                if (targetProp in target) {
                    // Check if all fields are present
                    const prop = target[targetProp];
                    const defaultProp = DEFAULT_CONFIG[targetProp];

                    if (typeof prop === "object") {
                        if (Array.isArray(prop)) {
                            // Check if all fields are present in each array element
                            // @ts-ignore
                            target[targetProp] = prop.map((x, i) => mergeDeep(x, checkFields(x, defaultProp[i])));
                        } else {
                            // Check if all fields are present in the object
                            const x = checkFields(prop, defaultProp);
                            if (x && Object.keys(x).length > 0) {
                                // Append to obj
                                target[targetProp] = mergeDeep(prop!, x);
                            }
                        }
                        fs.writeFileSync(configPath, JSON.stringify(target, null, 4));
                    }

                    return target[targetProp];
                }

                // If the property is not in the config, add to config and return the default value
                if (targetProp in DEFAULT_CONFIG) {
                    // Check if field is present in default config
                    target[targetProp] = DEFAULT_CONFIG[targetProp];
                    fs.writeFileSync(configPath, JSON.stringify(target, null, 4));
                    if (logMissing) console.log(`Added missing config key: ${String(targetProp)}`);
                }

                return DEFAULT_CONFIG[targetProp];
            },

            set(_, _prop, value) {
                try {
                    console.log(target)
                    const targetProp = _prop as keyof typeof DEFAULT_CONFIG;
                    target[targetProp] = value;
                    fs.writeFileSync(configPath, JSON.stringify(target, null, 4));
                    console.log(target)

                    return true;
                } catch {
                    return false;
                }
            }
        });

        return x;
    } else {
        // Create config file
        if (logMissing) console.log("No config file found; creating one for you...");
        fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 4));
        return DEFAULT_CONFIG;
    }
}

// #region Helper Functions
function isObject(item: any): boolean {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function readConfig<T>(path: string): T {
    let target: T;
    try {
        target = JSON.parse(fs.readFileSync(path, "utf8"));
    } catch {
        // @ts-ignore
        target = {};
    }
    return target;
}

function mergeDeep<T = object>(target: object, ...sources: object[]): T {
    if (!sources.length) return target as unknown as T;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            // @ts-ignore
            if (isObject(source[key])) {
                // @ts-ignore
                if (!target[key]) Object.assign(target, { [key]: {} });
                // @ts-ignore
                mergeDeep(target[key], source[key]);
            } else {
                // @ts-ignore
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function checkFields<T>(obj: Partial<T>, defaultObj: T) {
    let appendObj = {};
    for (const key in defaultObj) {
        if (!(key in obj)) {
            // @ts-ignore
            appendObj[key] = defaultObj[key];
        } else {
            if (typeof obj[key] === "object") {
                if (Array.isArray(obj[key]) && typeof (<any[]>obj[key])[0] === "object") {
                    // @ts-ignore
                    appendObj[key] = obj[key].map((x, i) => checkFields(x, defaultObj[key][i]));
                } else {
                    // @ts-ignore
                    const x = checkFields(obj[key], defaultObj[key]);
                    if (x && Object.keys(x).length > 0) {
                        // Append to obj
                        // @ts-ignore
                        appendObj[key] = x;
                    }
                }
            }
        }
    }

    return Object.keys(appendObj).length > 0 ? appendObj : null;
}
// #endregion

export default acfg;