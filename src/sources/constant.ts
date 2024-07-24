import BaseSource from './base'

export class ConstantSource<T> extends BaseSource<T> {
	constructor(readonly constant: T) {
		super()
	}

	protected fetch() {
		return Promise.resolve(this.constant)
	}
}

export default ConstantSource
