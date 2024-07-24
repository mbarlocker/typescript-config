import BaseTransform from './base'
import type { Primitive } from 'ts-essentials'
import type { Value } from '../value'

export type Options = {
	base?: number
}

export class IntTransform<W extends Primitive> extends BaseTransform<W, number> {
	constructor(wrapped: Value<W>, private readonly options?: Options) {
		super(wrapped)
	}

	protected wrapValue(value: W) {
		if (value === undefined || value === null) {
			return 0
		}

		if (typeof value === 'number' || typeof value === 'bigint') {
			return Math.round(Number(value))
		}

		if (typeof value === 'boolean') {
			return value ? 1 : 0
		}

		return parseInt(value.toString(), this.options?.base ?? 10)
	}

	static apply<W extends Primitive>(wrapped: Value<W>) {
		return new IntTransform(wrapped)
	}
}

export default IntTransform.apply
