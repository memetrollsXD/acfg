import { writeFileSync, readFileSync } from "fs";
import Config from "./Config";

const c = Config({
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
    writeFileSync("./config.json", JSON.stringify({
        // "TEST_FIELD": true,
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

    c.TEST_FIELD; // Trigger proxy getter

    const config = JSON.parse(readFileSync("./config.json", "utf8"));

    // @ts-ignore
    expect(config.TEST_FIELD).toBe(true);
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