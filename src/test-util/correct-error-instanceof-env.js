// idea from https://github.com/facebook/jest/issues/2549#issuecomment-884451616
const NodeEnvironment = require('jest-environment-node').default;

class CustomEnvironment extends NodeEnvironment {
    constructor(config, context) {
        super(config, context);
    }

    async setup() {
        await super.setup();
        Object.getOwnPropertyNames(globalThis)
            .filter(name => name !== "wasi")
            .filter((name) => {
                const prop = globalThis[name];
                if (!prop) return false;
                if (!prop.prototype) return false;
                return prop.prototype instanceof globalThis.Error || prop=== globalThis.Error;

            })
            .forEach((name) => {
                this.global[name] = global[name];
            })

    }

}

module.exports = CustomEnvironment;