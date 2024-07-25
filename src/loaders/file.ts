import fsp from 'fs/promises'
import type { Loader } from '../types'

export const load: Loader<string> = (data) => {
	return loadBuffer(data).then(x => x.toString('utf-8'))
}

export const loadBuffer: Loader<Buffer> = (data) => {
	return fsp.readFile(data.url)
}
