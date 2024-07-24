import BaseTransform from './base'
import type { Primitive } from 'ts-essentials'
import type { Value } from '../value'
import { round } from 'lodash'

export type Options = {
	precision?: number
}

export class FloatTransform<W extends Primitive> extends BaseTransform<W, number> {
	constructor(wrapped: Value<W>, private readonly options?: Options) {
		super(wrapped)
	}

	private extract(value: W): number {
		if (value === undefined || value === null) {
			return 0
		}

		if (typeof value === 'number' || typeof value === 'bigint') {
			return Number(value)
		}

		if (typeof value === 'boolean') {
			return value ? 1 : 0
		}

		return parseFloat(value.toString())
	}

	protected wrapValue(value: W) {
		const extracted = this.extract(value)
		const precision = this.options?.precision

		if (precision === undefined) {
			return extracted
		}

		return round(extracted, precision)
	}

	static apply<W extends Primitive>(wrapped: Value<W>) {
		return new FloatTransform(wrapped)
	}
}

export default FloatTransform.apply
