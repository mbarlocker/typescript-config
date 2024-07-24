import type { Source } from '../source'

export abstract class BaseSource<T> implements Source<T> {
	private _value: T | undefined
	private _promise: Promise<T> | undefined
	private _updated: Date | undefined

	protected abstract fetch(): Promise<T>

	constructor() {
		this._value = undefined
		this._promise = undefined
		this._updated = undefined
	}

	get loaded() {
		return this._value !== undefined
	}

	get updated() {
		return this._updated
	}

	get age() {
		if (this._updated === undefined) {
			return undefined
		}

		return new Date().getTime() - this._updated.getTime()
	}

	value() {
		if (!this._value) { throw new Error('Value is not set') }
		return this._value
	}

	promise() {
		return this.load()
	}

	clear() {
		this._value = undefined
		this._promise = undefined
		this._updated = undefined
	}

	load() {
		return this._promise ?? this.refresh()
	}

	reset() {
		this.clear()
		return this.load()
	}

	refresh() {
		const promise = this.fetch()
		this._promise = promise

		promise
			.then(value => {
				// if we've been reset, don't keep the value
				if (promise === this._promise) {
					this._value = value
					this._updated = new Date()
				}
			})

		return promise
	}

	activateBranch(key: string, name: string) {
		// do nothing
	}

	lockBranches() {
		// do nothing
	}
}

export default BaseSource
