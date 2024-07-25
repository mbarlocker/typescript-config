import { Wrapper } from './wrapper'
import { assert, describe, expect, it } from 'vitest'

describe('wrapper', () => {
	it('Converts strings', () => {
		assert.isTrue(new Wrapper('', 'abc').string() === 'abc')
		assert.isTrue(new Wrapper('', '123').int() === 123)
		assert.isTrue(new Wrapper('', '123.45').int() === 123)
		assert.isTrue(new Wrapper('', '123.45').float() === 123.45)
		assert.isTrue(new Wrapper('', '1').boolean() === true)
		assert.isTrue(new Wrapper('', 'true').boolean() === true)
		assert.isTrue(new Wrapper('', 'TRUE').boolean() === true)
		assert.isTrue(new Wrapper('', 'false').boolean() === false)
		assert.isTrue(new Wrapper('', 'NO').boolean() === false)
	})

	it('Converts numbers', () => {
		assert.isTrue(new Wrapper('', 123).string() === '123')
		assert.isTrue(new Wrapper('', 123).int() === 123)
		assert.isTrue(new Wrapper('', 123).boolean() === true)
		assert.isTrue(new Wrapper('', -5).boolean() === true)
		assert.isTrue(new Wrapper('', 0).boolean() === false)
		assert.isTrue(new Wrapper('', 1.234).string() === '1.234')
		assert.equal(0, Buffer.compare(new Wrapper('', 999).buffer(), Buffer.from('999', 'utf-8')))
	})

	it('Converts booleans', () => {
		assert.isTrue(new Wrapper('', true).string() === 'true')
		assert.isTrue(new Wrapper('', false).string() === 'false')
		assert.isTrue(new Wrapper('', true).int() === 1)
		assert.isTrue(new Wrapper('', false).int() === 0)
		assert.isTrue(new Wrapper('', true).float() === 1)
		assert.isTrue(new Wrapper('', false).float() === 0)
	})

	it('Exposes raw', () => {
		assert.isTrue(new Wrapper('', true).get() === true)
		assert.isTrue(new Wrapper('', '123').get() === '123')
		assert.isTrue(new Wrapper('', 123).get() === 123)
	})

	it('Handles undefined', () => {
		assert.isTrue(new Wrapper('', undefined).stringSafe() === undefined)
		assert.isTrue(new Wrapper('', undefined).intSafe() === undefined)
		assert.isTrue(new Wrapper('', undefined).floatSafe() === undefined)
		assert.isTrue(new Wrapper('', undefined).booleanSafe() === undefined)
		assert.isTrue(new Wrapper('', undefined).bufferSafe() === undefined)
	})
})
