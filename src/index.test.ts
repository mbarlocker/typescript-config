import Config from './index.js'
import fs from 'node:fs'
import { assert, describe, expect, it } from 'vitest'

describe('module index', () => {
	it('exports config', async () => {
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
})
