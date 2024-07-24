import HttpSource from './http'
import WrappedSource from './wrapped'

export class Ec2Source extends WrappedSource<Buffer, string> {
	constructor(readonly path: string) {
		super(new HttpSource(`http://169.254.169.254/latest/meta-data${path}`))
	}

	protected wrapValue(value: Buffer): string {
		return value.toString('utf8')
	}
}

export default Ec2Source
