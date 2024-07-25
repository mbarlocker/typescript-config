import * as HttpLoader from './http'
import { assert, describe, expect, it } from 'vitest'

describe('http loader', () => {
	it('loads google', async () => {
		const actual = await HttpLoader.load({
			uri: `https://www.google.com/`,
			url: 'www.google.com/',
			schema: 'https://',
		})

		assert.isTrue(actual.startsWith('<!doctype'))
	})
})
