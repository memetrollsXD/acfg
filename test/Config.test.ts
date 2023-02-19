import { writeFileSync, readFileSync, unlinkSync } from "fs";
import acfg from "../src/Config";

const c = acfg({
    TEST_FIELD: true,
    NESTED_TEST: {
        TEST_FIELD: true,
        MORE_NESTED: {
            TEST_FIELD: true
        }
    },
    ARRAY_TEST: [
        {
            TEST_FIELD: true,
            MORE_NESTED: {
                TEST_FIELD: true,
                NEW_FIELD: "new"
            }
        },
        {
            TEST_FIELD: false,
            MORE_NESTED: {
                TEST_FIELD: false
            }
        }
    ]
}, { logMissing: true });

test('1st layer keys', () => {
    expect(c.TEST_FIELD).toBe(true);
});

test('2nd layer keys', () => {
    expect(c.NESTED_TEST.TEST_FIELD).toBe(true);
});

test('Array 1st layer keys', () => {
    expect(c.ARRAY_TEST[0].TEST_FIELD).toBe(true);
});

test('Array 2nd layer keys', () => {
    expect(c.ARRAY_TEST[0].MORE_NESTED.TEST_FIELD).toBe(true);
});

test('Missing 1st layer keys', () => {
    // @ts-ignore
    expect(c.MISSING_FIELD).toBe(undefined);
});

test('Add missing 1st layer keys', () => {
    writeFileSync("./fmtest.json", JSON.stringify({
        EXISTING_FIELD: true,
        // MISSING_FIELD: true
    }));

    const fmissingTest = acfg({
        EXISTING_FIELD: true,
        MISSING_FIELD: true
    }, { path: "./fmtest.json" });

    fmissingTest.MISSING_FIELD; // Trigger proxy getter

    const config = JSON.parse(readFileSync("./fmtest.json", "utf8"));
    console.log(config, fmissingTest);

    expect(config.MISSING_FIELD).toBe(true);
});

test('Add missing 2nd layer keys', () => {
    writeFileSync("./config.json", JSON.stringify({
        "TEST_FIELD": true,
        "NESTED_TEST": {
            // "TEST_FIELD": true,
            "MORE_NESTED": {
                "TEST_FIELD": true
            }
        },
        "ARRAY_TEST": [
            {
                "TEST_FIELD": true,
                "MORE_NESTED": {
                    "TEST_FIELD": true,
                    "NEW_FIELD": "new"
                }
            },
            {
                "TEST_FIELD": false,
                "MORE_NESTED": {
                    "TEST_FIELD": false
                }
            }
        ]
    }));

    c.NESTED_TEST.TEST_FIELD; // Trigger proxy getter

    const config = JSON.parse(readFileSync("./config.json", "utf8"));

    // @ts-ignore
    expect(config.NESTED_TEST.TEST_FIELD).toBe(true);
});

test('Add missing array keys', () => {
    writeFileSync("./config.json", JSON.stringify({
        "TEST_FIELD": true,
        "NESTED_TEST": {
            "TEST_FIELD": true,
            "MORE_NESTED": {
                "TEST_FIELD": true
            }
        },
        "ARRAY_TEST": [
            {
                "TEST_FIELD": true,
                "MORE_NESTED": {
                    "TEST_FIELD": true,
                    // "NEW_FIELD": "new"
                }
            },
            {
                "TEST_FIELD": false,
                "MORE_NESTED": {
                    "TEST_FIELD": false
                }
            }
        ]
    }));

    c.ARRAY_TEST[0].MORE_NESTED.NEW_FIELD; // Trigger proxy getter

    const config = JSON.parse(readFileSync("./config.json", "utf8"));

    // @ts-ignore
    expect(config.ARRAY_TEST[0].MORE_NESTED.NEW_FIELD).toBe("new");
});

test('Get whole config', () => {
    unlinkSync("./config.json");

    const config = {
        TEST_NAME: "WHOLE_CONFIG_TEST",
        TEST_FIELD: true
    };

    const c = acfg(config);

    expect(c).toEqual(config);
});

// Clean up
unlinkSync("./config.json");
unlinkSync("./fmtest.json");