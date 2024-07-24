import BaseBranch from './base'
import type { Value } from '../value'

export class EnvironmentBranch<T> extends BaseBranch<T> {
	constructor(branches: Record<string, Value<T>>) {
		super('environment', branches)
	}
}
