import BaseTransform from './base'
import type { Value } from '../value'

export class AnonymousTransform<W, T> extends BaseTransform<W, T> {
	constructor(wrapped: Value<W>, private readonly fn: (value: W) => T) {
		super(wrapped)
	}

	protected wrapValue(value: W) {
		return this.fn(value)
	}

	static apply<W, T>(wrapped: Value<W>, fn: (value: W) => T) {
		return new AnonymousTransform<W, T>(wrapped, fn)
	}
}

export default AnonymousTransform.apply
