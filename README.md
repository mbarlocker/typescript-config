# typescript-config

[![CI](https://github.com/mbarlocker/typescript-config/actions/workflows/ci.yml/badge.svg)](https://github.com/mbarlocker/typescript-config/actions/workflows/ci.yml)
[![NPM version](http://img.shields.io/npm/v/@mbarlocker/typescript-config.svg)](https://www.npmjs.com/package/@mbarlocker/typescript-config)
[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/mbarlocker/typescript-config/main/LICENSE)

Type-safe configuration.
Simplified date parsing and formatting from strings. This project wraps the `parse` and `format` functions of [date-fns](https://github.com/date-fns/date-fns).

## Installation

```sh
yarn add @mbarlocker/typescript-config
```

## Current State

This project has never been tested or ran. It was abandoned after some rethinking was done. It probably works in the current state, but I didn't actually get to any working examples to share.

I used [HOCON Parser](https://github.com/josephtzeng/hocon-parser) instead.

Features include:

* type safety for config values
* reloadability. not so valuable for constant values, very valuable for retrieved files, urls, and cloud parameters
* environment branching
* transforms

## TODO

* NPM publishing
* Test cases
* Documentation & examples

## Design

The API was designed for a config file that looks like this:

```typescript
import { Config } from '@mbarlocker/typescript-config'
import { ConstantSource } from '@mbarlocker/typescript-config'
import { EnvironmentBranch } from '@mbarlocker/typescript-config'

export const config = new Config()

export default {
	db: {
		hostname: new EnvironmentBranch({
			dev: new ConstantSource('localhost'),
			prod: new ConstantSource('1.1.1.1'),
		}),
		user: new EnvironmentBranch({
			default: 'myuser',
		}),
		password: new EnvironmentBranch({
			dev: new ConstantSource('dev'),
			prod: new HttpSource('https://secrets.and.other.stuff.com/mysecret.txt'),
		}),
		...
	},
	...
}
```

## License
Copyright © 2023-present Matthew Barlocker.

@mbarlocker/typescript-config is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
