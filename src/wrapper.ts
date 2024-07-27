import type { Value } from './types.js'

export class Wrapper {
	constructor(readonly path: string, readonly value: Value) {
	}

	private require<T>(value: T | undefined): T {
		if (value === undefined) {
			throw new Error(`Configuration value ${this.path} is undefined`)
		}

		return value
	}

	public string(): string {
		return this.require(this.stringSafe())
	}

	public stringSafe(): string | undefined {
		if (this.value === undefined || typeof this.value === 'string') {
			return this.value
		}

		if (typeof this.value === 'number' || typeof this.value === 'boolean') {
			return this.value.toString()
		}

		if (Buffer.isBuffer(this.value)) {
			return this.value.toString('utf-8')
		}
	}

	public int(): number {
		return this.require(this.intSafe())
	}

	public intSafe(): number | undefined {
		if (this.value === undefined) {
			return this.value
		}

		if (typeof this.value === 'number') {
			return Math.round(this.value)
		}

		if (typeof this.value === 'string') {
			return parseInt(this.value, 10)
		}

		if (typeof this.value === 'boolean') {
			return this.value ? 1 : 0
		}

		if (Buffer.isBuffer(this.value)) {
			throw new Error('Cannot convert a buffer to an int. Get a Buffer or a string and do the conversion depending on how the int is encoded')
		}
	}

	public float(): number {
		return this.require(this.floatSafe())
	}

	public floatSafe(): number | undefined {
		if (this.value === undefined || typeof this.value === 'number') {
			return this.value
		}

		if (typeof this.value === 'string') {
			return parseFloat(this.value)
		}

		if (typeof this.value === 'boolean') {
			return this.value ? 1 : 0
		}

		if (Buffer.isBuffer(this.value)) {
			throw new Error('Cannot convert a buffer to an float. Get a Buffer or a string and do the conversion depending on how the float is encoded')
		}
	}

	public buffer(): Buffer {
		return this.require(this.bufferSafe())
	}

	public bufferSafe(): Buffer | undefined {
		if (this.value === undefined || Buffer.isBuffer(this.value)) {
			return this.value
		}

		if (typeof this.value === 'string' || typeof this.value === 'number' || typeof this.value === 'boolean') {
			return Buffer.from(this.value.toString(), 'utf-8')
		}
	}

	public boolean(): boolean {
		return this.require(this.booleanSafe())
	}

	public booleanSafe(): boolean | undefined {
		if (this.value === undefined || typeof this.value === 'boolean') {
			return this.value
		}

		if (typeof this.value === 'number') {
			return this.value !== 0
		}

		if (typeof this.value === 'string' || Buffer.isBuffer(this.value)) {
			const string = typeof this.value === 'string'
				? this.value
				: this.value.toString('utf-8')

			const lower = string.toLowerCase()

			return lower === 'true'
				|| lower === 't'
				|| lower === '1'
				|| lower === 'yes'
		}
	}

	public get(): Value {
		return this.require(this.getSafe())
	}

	public getSafe(): Value | undefined {
		return this.value
	}
}

export default Wrapper
