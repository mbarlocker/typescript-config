import type { Transform } from '../transform'
import type { Value } from '../value'

export abstract class BaseTransform<W, T> implements Transform<T> {
	protected abstract wrapValue(value: W): T

	constructor(readonly wrapped: Value<W>) {}

	get loaded() {
		return this.wrapped.loaded
	}

	get updated() {
		return this.wrapped.updated
	}

	get age() {
		return this.wrapped.age
	}

	value() {
		return this.wrapValue(this.wrapped.value())
	}

	promise() {
		return this.wrapped.promise().then(value => this.wrapValue(value))
	}

	clear() {
		this.wrapped.clear()
	}

	load() {
		return this.wrapped.load().then(value => this.wrapValue(value))
	}

	reset() {
		return this.wrapped.reset().then(value => this.wrapValue(value))
	}

	refresh() {
		return this.wrapped.refresh().then(value => this.wrapValue(value))
	}

	activateBranch(key: string, name: string) {
		this.wrapped.activateBranch(key, name)
	}

	lockBranches() {
		this.wrapped.lockBranches()
	}
}

export default BaseTransform
