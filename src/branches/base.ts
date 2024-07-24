import type { Branch } from '../branch'
import type { Value } from '../value'
import { forOwn } from 'lodash'

export abstract class BaseBranch<T> implements Branch<T> {
	private _activeBranchName: string | undefined
	private _locked: boolean

	constructor(readonly key: string, readonly branches: Record<string, Value<T>>) {
		this._activeBranchName = undefined
		this._locked = false
	}

	private resolveBranch(name: string | undefined): Value<T> | undefined {
		return name === undefined ? undefined : this.branches[name]
	}

	protected get activeBranch(): Value<T> {
		const resolved = this.resolveBranch(this._activeBranchName) ?? this.resolveBranch('default')

		if (resolved === undefined) {
			throw new Error(`Unresolved branch ${this._activeBranchName}`)
		}

		return resolved
	}

	get locked(): boolean {
		return this._locked
	}

	get loaded() {
		return this.activeBranch.loaded
	}

	get updated() {
		return this.activeBranch.updated
	}

	get age() {
		return this.activeBranch.age
	}

	value() {
		return this.activeBranch.value()
	}

	promise() {
		return this.activeBranch.promise()
	}

	clear() {
		this.activeBranch.clear()
	}

	load() {
		return this.activeBranch.load()
	}

	reset() {
		return this.activeBranch.reset()
	}

	refresh() {
		return this.activeBranch.refresh()
	}

	activateBranch(key: string, name: string): void {
		if (this._locked) {
			throw new Error(`Branches have been locked. Cannot set ${key} to ${name}`)
		}

		if (this.key === key) {
			if (!(name in this.branches) && !('default' in this.branches)) {
				throw new Error(`Invalid branch for ${key}: ${name}`)
			}

			this._activeBranchName = name
		}

		forOwn(this.branches, child => child.activateBranch(key, name))
	}

	lockBranches() {
		this._locked = true
	}
}

export default BaseBranch
