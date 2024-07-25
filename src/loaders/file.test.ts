import * as FileLoader from './file'
import fs from 'fs'
import { assert, describe, expect, it } from 'vitest'

describe('file loader', () => {
	it('loads this file', async () => {
		const actual = await FileLoader.load({
			uri: `file://${__filename}`,
			url: __filename,
			schema: 'file://',
		})

		assert.equal(actual, fs.readFileSync(__filename, 'utf-8'))
	})
})

describe('file buffer loader', () => {
	it('loads this file', async () => {
		const actual = await FileLoader.loadBuffer({
			uri: `bfile://${__filename}`,
			url: __filename,
			schema: 'bfile://',
		})

		assert.equal(Buffer.compare(actual, fs.readFileSync(__filename)), 0)
	})
})
