import BaseTransform from './base'
import type { Value } from '../value'
import { get } from 'lodash'

export class PathTransform<T> extends BaseTransform<Record<string, any>, T> {
	constructor(wrapped: Value<Record<string, any>>, readonly path: string) {
		super(wrapped)
	}

	protected wrapValue(value: Record<string, any>) {
		return get(value, this.path) as T
	}

	static apply<T>(wrapped: Value<Record<string, any>>, path: string) {
		return new PathTransform<T>(wrapped, path)
	}
}

export default PathTransform.apply
