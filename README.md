# typescript-config

[![CI](https://github.com/mbarlocker/typescript-config/actions/workflows/ci.yml/badge.svg)](https://github.com/mbarlocker/typescript-config/actions/workflows/ci.yml)
[![NPM version](http://img.shields.io/npm/v/@mbarlocker/typescript-config.svg)](https://www.npmjs.com/package/@mbarlocker/typescript-config)
[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/mbarlocker/typescript-config/main/LICENSE)

A configuration utility that can load and reload values from remote sources.

## Installation

```sh
yarn add @mbarlocker/typescript-config
```

## Features

The entire purpose for this project is to get simple, promise-based, pre-cached configuration capable of loading from
remote data stores like files, ec2 instance metadata, AWS secrets manager, and AWS Parameter Store.

* Object like configuration
* Branch for environments, roles, etc
* Promise-based with local caching
* Reload individual or all values
* Remote data stores
* Custom data stores

Things that it doesn't do:

* Local override files (although you can accomplish this by using any of the remote loaders to store a local file)

## Usage

The API was designed for a config file that looks like this:

```typescript
import { Config } from '@mbarlocker/typescript-config'

export const config = new Config({
	db: {
		hostname: {
			$env_production: '1.1.1.1',
			$env_development: 'localhost',
		},
		user: 'myuser',
		password: {
			$env_production: '${file:///secrets/db.password}',
			$default: 'dev',
		},
		port: {
			$default: 3306,
		},
	},
	...
})

config.branch('env', 'development' /* would likely use process.env.NODE_ENV or similar */)
await config.load()

const hostname = config.value('db.hostname').string() // localhost
const user = config.value('db.user').string() // myuser
const password = config.value('db.password').string() // dev
const port = config.value('db.port').int() // 3306
```

It also works with promises and reloading
```typescript
export const config = new Config({ ...fromAbove })

config.branch('env', 'production')
// waiting isn't necessary if you're using promises
// await config.load() 

const password = (await config.promise('db.password')).string() // whatever the contents of /secrets/db.password are, as text
```

## Supported Loaders

Built in loaders support the following schemas.

| Schema | Description | Example |
| :----- | :---------- | :------ |
| `file://` | Read the contents of a file on the local filesystem with the utf-8 encoding | `file:///a/b/c` will read `/a/b/c` |
| `bfile://` | Read the contents of a file on the local filesystem as a buffer | `bfile:///a/b/c` will read `/a/b/c` as a buffer |
| `http://` | Make an HTTP GET request to the specified location and return the body as a string using utf-8 encoding | `http://www.google.com/` will return Google's homepage as a string |
| `https://` | Same as `http://` but for HTTPS | `https://www.google.com/` will return Google's homepage as a string |
| `bhttp://` | Same as `http://` but return a Buffer | `bhttp://www.google.com/` will return Google's homepage as a Buffer |
| `bhttps://` | Same as `https://` but return a Buffer | `bhttps://www.google.com/` will return Google's homepage as a Buffer |

Custom loaders can be registered with the Config *prior to the .load() call*.

```typescript
import { Loader } from '@mbarlocker/typescript-config'
import { Config } from '@mbarlocker/typescript-config'

const config = new Config({
	host: {
		ipv4: {
			$ENV_local: '127.0.0.1',
			$default: '${ec2://latest/meta-data/public-ipv4}',
		},
	},
})

config.branch('ENV', process.env.NODE_ENV)
config.registerLoader('ec2://', (data) => fetch(`http://169.254.169.254/${data.url}`))
await config.load()

config.value('host.ipv4') // returns either 127.0.0.1 or the response from the EC2 metadata server
```

## Remote Values

All values that are to be loaded by the registered loaders have to be designated. The way to
do this is to use `${url}`. This has the potential to conflict and cause errors if you surround them
with backticks, but is meant to indicate to your brain that these are variables. Just be careful when
using quotes and backticks and you shouldn't have an issue.

```typescript
// GOOD values - notice the single quotes
const config = new Config({
	db: {
		url: 'mysql://user:pass@host:port/db',
		key: '${http://secrets.host.com/db/key.txt}',
	},
})

// BAD values - notice the backticks
const config = new Config({
	db: {
		url: 'mysql://user:pass@host:port/db',
		key: `${http://secrets.host.com/db/key.txt}`,
	},
})
```

## Reloading

It's easy to set up configuration reloading. Just remember that you'll need to `await` the response if
you want to verify that all of them have been loaded. Entries that fail to refresh will continue to be
cached.

```typescript
await config.refresh()
```

While the values are being refreshed, the old cached values will continue to be served. If you'd like to make sure
that the new values are being used, get the `.promise('path.to.my.value')` version. That will always return the newest
value, even if that value hasn't been finished or will end with an error.

## License

Copyright © 2023-present Matthew Barlocker.

@mbarlocker/typescript-config is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
