import * as fs from "fs";

interface ConfigOptions {
    path?: string;
    logMissing?: boolean;
}

function acfg<T = object>(DEFAULT_CONFIG: T, o?: ConfigOptions): T {
    const configPath = o?.path || "./config.json";
    const logMissing = o?.logMissing || false;

    if (fs.existsSync(configPath)) {
        const x = new Proxy({}, {
            get(_, _prop) {
                const prop = _prop as keyof typeof DEFAULT_CONFIG;
                let target = readConfig<typeof DEFAULT_CONFIG>(configPath);

                if (prop in target) {
                    // Check if all fields are present
                    const p = target[prop];
                    const d = DEFAULT_CONFIG[prop];

                    if (typeof p === "object") {
                        if (Array.isArray(p)) {
                            // @ts-ignore
                            target[prop] = p.map((x, i) => mergeDeep(x, checkFields(x, d[i])));
                        } else {
                            // @ts-ignore
                            const x = checkFields(p, d);
                            if (x && Object.keys(x).length > 0) {
                                // Append to obj
                                // @ts-ignore
                                target[prop] = mergeDeep(p, x);
                            }
                        }
                        fs.writeFileSync(configPath, JSON.stringify(target, null, 4));
                    }

                    return target[prop];
                }
                // If the property is not in the config, add to config and return the default value

                // @ts-ignore
                target[prop] = DEFAULT_CONFIG[prop];
                fs.writeFileSync(configPath, JSON.stringify(target, null, 4));
                if (logMissing) console.log(`Added missing config key: ${String(prop)}`);

                return DEFAULT_CONFIG[prop];
            }
        });

        return x as typeof DEFAULT_CONFIG;
    } else {
        // Create config file

        if (logMissing) console.log("No config file found; creating one for you...");
        fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 4));
        return DEFAULT_CONFIG;
    }
}

//* Helper Functions *//

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
                if (Array.isArray(obj[key])) {
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

export default acfg;