import BaseSource from './base'
import http from 'http'
import https from 'https'

export class HttpSource extends BaseSource<Buffer> {
	constructor(readonly url: string) {
		super()
	}

	protected fetch() {
		return new Promise<Buffer>((success, failure) => {
			const mod = this.url.startsWith('https://')
				? https
				: http

			mod
				.get(this.url, response => {
					const { statusCode } = response

					let error: Error | undefined = undefined

					if (statusCode === undefined || statusCode < 200 || statusCode > 299) {
						error = new Error(`HTTP Source failed with status code ${statusCode}`)
					}

					if (error !== undefined) {
						failure(error)
						response.resume()
						return
					}

					let chunks: Buffer[] = []

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
}

export default HttpSource
