import BaseSource from './base'

export class AnonymousSource<T> extends BaseSource<T> {
	constructor(readonly fn: () => Promise<T>) {
		super()
	}

	protected fetch() {
		return this.fn()
	}
}

export default AnonymousSource
