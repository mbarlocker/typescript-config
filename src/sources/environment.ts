import BaseSource from './base'

export class EnvironmentSource extends BaseSource<string> {
	constructor(readonly name: string) {
		super()
	}

	protected fetch() {
		return new Promise<string>((success, failure) => {
			const value = process.env[this.name]
			if (value !== undefined) {
				success(value)
			}
			else {
				failure(new Error(`Environment not set: ${this.name}`))
			}
		})
	}
}

export default EnvironmentSource
