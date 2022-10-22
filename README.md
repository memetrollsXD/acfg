# ACFG

Manage your configuration files and keep them up to date.

ACFG detects missing configuration files and creates them from templates. It also detects live changes in configuration files and updates them.

## Usage
Install the package first
```bash
npm i acfg
```

Add it to your project

```ts
import Config from "acfg";

// Create a new config
// The configuration file gets stored in ./config.json by default
const config = new Config({
  // Default fields go here
  HTTP_PORT: 8080,
  MONGODB_URI: "mongodb://localhost:27017",
});

mongoose.connect(config.MONGODB_URI);
app.listen(config.HTTP_PORT);
```

Alternatively, you can define another path for the configuration file:

```ts
import { resolve as r } from "path";
const config = new Config({
  // Default fields go here
  HTTP_PORT: 8080,
  MONGODB_URI: "mongodb://localhost:27017",
}, {
    path: r(__dirname, "config.json"),
    logMissing: true // Log when ACFG finds and fixes a missing field
});
```