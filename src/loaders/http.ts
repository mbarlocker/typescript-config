import http from 'http'
import https from 'https'
import type { Loader } from '../types'

export const load: Loader<string> = (data) => {
	return loadBuffer(data).then(x => x.toString('utf-8'))
}

export const loadBuffer: Loader<Buffer> = (data) => {
	return new Promise<Buffer>((success, failure) => {
		const mod = data.uri.includes('https://') ? https : http

		mod
			.get(data.uri, response => {
					const { statusCode } = response

					let error: Error | undefined = undefined

					if (statusCode === undefined || statusCode < 200 || statusCode > 299) {
							error = new Error(`HTTP loader failed with status code ${statusCode}`)
					}

					if (error !== undefined) {
							failure(error)
							response.resume()
							return
					}

					const chunks: Buffer[] = []

					response.on('data', (chunk) => {
							chunks.push(Buffer.from(chunk, 'binary'))
					})

					response.on('end', () => {
							success(Buffer.concat(chunks))
					})
			})
			.on('error', error => {
					failure(error)
			})
	})
}
