import fs from 'node:fs'
import { assert, describe, expect, it } from 'vitest'
import { Config } from './config.js'

describe('config', () => {
	it('loads simple config', async () => {
		const config = new Config({
			db: {
				host: 'localhost',
				port: 1234,
			},
		})

		await config.load()

		assert.equal(config.value('db.host').string(), 'localhost')
		assert.equal(config.value('db.port').string(), '1234')
		assert.equal(config.value('db.port').int(), 1234)
	})

	it('loads remote config and converts to string', async () => {
		const config = new Config({
			file: `bfile://${__filename}`,
		})

		await config.load()

		assert.equal(config.value('file').string(), fs.readFileSync(__filename, 'utf-8'))
	})

	it('handles custom loaders', async () => {
		const config = new Config({
			a: {
				b: {
					c: 'random://anything',
				},
			},
		})

		const random = Math.random()
		const myloader: Loader<string> = (data) => Promise.resolve(`${random}${data.url}`)

		config.registerLoader('random://', myloader)
		await config.load()

		assert.equal((await config.promise('a.b.c')).string(), `${random}anything`)
	})

	it('handles leaf branching', async () => {
		const config = new Config({
			service: {
				host: {
					$ENV_production: '1.1.1.1',
					$ENV_development: 'localhost',
					$default: '2.2.2.2',
				},
				port: {
					$ENV_production: 1,
					$default: 3,
				},
			},
		})

		config.branch('ENV', 'development')
		await config.load()

		assert.equal(config.value('service.host').string(), 'localhost')
		assert.equal(config.value('service.port').int(), 3)
	})

	it('handles complex branching', async () => {
		const config = new Config({
			logging: {
				$ENV_prod: {
					host: {
						$HOST_local: {
							service: {
								http: true,
							},
						},
						$HOST_remote: {
							service: {
								http: false,
							},
						},
					},
				},
				$ENV_PROD: {
					host: {
						service: {
							http: false,
						},
					},
				},
			},
		})

		config.branch('ENV', 'prod')
		config.branch('HOST', 'local')
		await config.load()

		assert.equal(config.value('logging.host.service.http').boolean(), true)
	})

	it('refreshes', async () => {
		const config = new Config({
			value: 'fresh://ignore',
		})

		let value = 0
		const myloader: Loader<number> = (data) => Promise.resolve(++value)

		config.registerLoader('fresh://', myloader)
		await config.load()

		assert.equal(config.value('value').int(), 1)
		assert.equal(config.value('value').int(), 1)
		await config.refresh()
		assert.equal(config.value('value').int(), 2)
		assert.equal(config.value('value').int(), 2)
		await config.refresh()
		assert.equal(config.value('value').int(), 3)
		assert.equal(config.value('value').int(), 3)
	})

	it('serves stale during refresh', async () => {
		const config = new Config({
			value: 'fresh://ignore',
		})

		let value = 0
		const myloader: Loader<number> = (data) => new Promise((yes, no) => {
			setTimeout(() => yes(++value), 500)
		})

		config.registerLoader('fresh://', myloader)
		await config.load()

		assert.equal(config.value('value').int(), 1)
		assert.equal(config.value('value').int(), 1)
		config.refresh()
		assert.equal(config.value('value').int(), 1)
		assert.equal((await config.promise('value')).int(), 2)
		assert.equal(config.value('value').int(), 2)
	})

	it('accepts a logger', async () => {
		const config = new Config({
			a: {
				b: {
					c: 'asdf',
				},
			},
		})

		let messages = 0
		const updater = (...args: any[]) => ++messages

		config.logger({
			trace: updater,
			debug: updater,
			info: updater,
			warn: updater,
			error: updater,
		})

		await config.load()

		assert.isTrue(messages > 0)
	})
})
