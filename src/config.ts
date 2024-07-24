import type { Value } from './value'
import { forOwn } from 'lodash'

export class Config {
	private _branches: Record<string, string>
	private _branchesLocked: boolean
	private _values: Value<unknown>[]

	constructor() {
		this._branches = {}
		this._branchesLocked = false
		this._values = []
	}

	add<T>(value: Value<T>): Value<T> {
		forOwn(this._branches, (name, key) => {
			value.activateBranch(key, name)
		})

		if (this._branchesLocked) {
			value.lockBranches()
		}

		this._values.push(value)

		return value
	}

	get loaded(): boolean {
		return this._values.every(v => v.loaded)
	}

	clear(): void {
		for (const value of this._values) {
			value.clear()
		}
	}

	load(): Promise<unknown> {
		return Promise.all(this._values.map(x => x.load()))
	}

	reset() {
		return Promise.all(this._values.map(x => x.reset()))
	}

	refresh() {
		return Promise.all(this._values.map(x => x.refresh()))
	}

	getBranch(key: string): string | undefined {
		return this._branches[key]
	}

	activateBranch(key: string, name: string) {
		if (this._branchesLocked) {
			throw new Error(`Branches are locked. Cannot set ${key} to ${name}`)
		}

		this._branches[key] = name

		for (const value of this._values) {
			value.activateBranch(key, name)
		}
	}

	lockBranches(): void {
		this._branchesLocked = true

		for (const value of this._values) {
			value.lockBranches()
		}
	}

	get environment(): string | undefined {
		return this.getBranch('environment')
	}

	activateEnvironment(name: string) {
		this.activateBranch('environment', name)
	}
}
