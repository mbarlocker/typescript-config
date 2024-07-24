import BaseTransform from './base'
import type { Primitive } from 'ts-essentials'
import type { Value } from '../value'

export type Options = {
	charset?: BufferEncoding
}

export class StringTransform<W extends any> extends BaseTransform<W, string> {
	constructor(wrapped: Value<W>, private readonly options?: Options) {
		super(wrapped)
	}

	protected wrapValue(value: W) {
		if (Buffer.isBuffer(value)) {
			return value.toString(this.options?.charset ?? 'utf8')
		}

		if (value === undefined || value === null) {
			return ''
		}

		if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
			return value.toString()
		}

		if (typeof value === 'string') {
			return value
		}

		return JSON.stringify(value)
	}

	static apply<W extends Buffer | number | string>(wrapped: Value<W>) {
		return new StringTransform(wrapped)
	}
}

export default StringTransform.apply
