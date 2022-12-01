# ACFG

Manage your configuration files and keep them up to date.

ACFG detects missing configuration keys and creates them from the given default config. It can also detect live changes in the config file.

## Usage
Install the package first
```bash
npm i acfg
```

Add it to your project

```ts
import acfg from "acfg";

// Create a new config
// The configuration file gets stored in ./config.json by default
const Config = acfg({
  // Default fields go here
  HTTP_PORT: 8080,
  MONGODB_URI: "mongodb://localhost:27017",
});

mongoose.connect(Config.MONGODB_URI);
app.listen(Config.HTTP_PORT);

// Optional: export it to use it in other files
export default Config;
```

Alternatively, you can define another path for the configuration file:

```ts
import { resolve as r } from "path";
const Config = acfg({
  // Default fields go here
  HTTP_PORT: 8080,
  MONGODB_URI: "mongodb://localhost:27017",
}, {
    path: r(__dirname, "config.json"),
    logMissing: true // Log when ACFG finds and fixes a missing field
});
```