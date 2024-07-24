import BaseSource from './base'
import fs from 'fs/promises'

export class FileSource extends BaseSource<Buffer> {
	constructor(readonly path: string) {
		super()
	}

	protected fetch() {
		return fs.readFile(this.path)
	}
}

export default FileSource
