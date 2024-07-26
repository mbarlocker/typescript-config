import type { Definition } from './types'
import type { Loader } from './types'
import type { Logger } from './types'
import type { Value } from './types'
import { load as FileLoader } from './loaders/file'
import { load as HttpLoader } from './loaders/http'
import { loadBuffer as FileBufferLoader } from './loaders/file'
import { loadBuffer as HttpBufferLoader } from './loaders/http'
import { Wrapper } from './wrapper'

interface ResolvedItem {
	path: string
	definition: Value
	promise: Promise<Value>
	value: Value | undefined
	version: number
	request: number
	loader?: {
		schema: string
		uri: string
		url: string
		fn: Loader
	}
}

const defaultKey = '$default'

export class Config {
	private _loaders: Record<string, Loader> = {}
	private _branches: Record<string, string> = {}
	private _resolved: Map<string, ResolvedItem> = new Map()
	private _logger: Logger | undefined = undefined
	private _loaded: boolean = false

	constructor(readonly definition: Definition) {
		this.reset()
	}

	public reset(): void {
		this._loaders = {}
		this._branches = {}
		this._resolved = new Map()
		this._logger = undefined
		this._loaded = false

		this.registerLoader('file://', FileLoader)
		this.registerLoader('http://', HttpLoader)
		this.registerLoader('https://', HttpLoader)
		this.registerLoader('bfile://', FileBufferLoader)
		this.registerLoader('bhttp://', HttpBufferLoader)
		this.registerLoader('bhttps://', HttpBufferLoader)
	}

	private requireLoaded(loaded: boolean): void {
		if (this._loaded && !loaded) {
			throw new Error(`Configuration has already been loaded. Once loaded, processing is set in place. Use config.reset() to start over or config.refresh() to reload values.`)
		}

		if (!this._loaded && loaded) {
			throw new Error(`Configuration has not been loaded yet. You must call config.load() before using the accessors.`)
		}
	}

	private requireItem(path: string): ResolvedItem {
		const item = this._resolved.get(path)

		if (item === undefined) {
			throw new Error(`Unknown config item ${path}`)
		}

		return item
	}

	public load(): Promise<void> {
		this.requireLoaded(false)

		const branchKeyRegex = /^\$(.*)_.*$/

		const findItems = (definition: Definition, paths: string[]) => {
			if (typeof definition === 'object' && !Buffer.isBuffer(definition)) {
				const keys = Object.keys(definition)
				const isBranch = keys.every(x => branchKeyRegex.test(x) || x === defaultKey)

				if (isBranch) {
					const branchKey = keys
						.filter(x => x !== defaultKey)
						.map(x => x.match(branchKeyRegex))
						.reduce(
							(acc, one) => {
								const key = one?.[1]

								if (key === undefined) {
									throw new Error(`Branch key missing`)
								}

								if (acc !== '' && acc !== key) {
									throw new Error(`Conflicting branch names in the same object [${acc}] [${key}]`)
								}

								return key
							},
							'',
						)

					const branchValue = this._branches[branchKey]
					const childKey = `$${branchKey}_${branchValue}`

					if (childKey in definition) {
						this._logger?.debug(`Branching into ${childKey} at ${paths.join('.')}`)
						findItems(definition[childKey], paths)
					}
					else if (defaultKey in definition) {
						this._logger?.debug(`Branching into default key [${defaultKey}] at ${paths.join('.')}`)
						findItems(definition[defaultKey], paths)
					}
					else {
						this._logger?.warn(`Missing branch for ${childKey} at ${paths.join('.')}`)
					}
				}
				else {
					for (const [key, value] of Object.entries(definition)) {
						findItems(value, [...paths, key])
					}
				}
			}
			else {
				const path = paths.join('.')

				const loader = (() => {
					if (typeof definition !== 'string') {
						return {}
					}

					if (!/^\w+:\/\/.*/.test(definition)) {
						return {}
					}

					const uri = definition
					const schema = Object.keys(this._loaders).find(x => definition.startsWith(x))
					if (schema === undefined) {
						this._logger?.warn(`Unknown loader schema ${definition}. Use config.registerLoader() to add custom loaders`)
						return {}
					}

					const url = uri.substring(schema.length)
					const fn = this._loaders[schema]

					return {
						loader: {
							fn,
							uri,
							schema,
							url,
						},
					}
				})()

				this._logger?.info(`Found config ${path} ${loader.loader?.schema ? `with loader [${Buffer.isBuffer(definition) ? '(buffer)' : definition}]` : ''}`)

				const item: ResolvedItem = {
					path,
					definition,
					promise: Promise.resolve(definition), // overwritten by the first refresh
					value: undefined,
					version: -1,
					request: -1,
					...loader,
				}

				this._resolved.set(path, item)
				this.refreshItem(item)
			}
		}

		findItems(this.definition, [])

		this._loaded = true
		return this.allPromises()
	}

	private allPromises(): Promise<void> {
		return Promise
			.all([...this._resolved.values()].map(x => x.promise))
			.then(() => {})
	}

	private refreshItem(item: ResolvedItem): Promise<Value> {
		if (item.loader !== undefined) {
			this._logger?.trace(`Updating value for ${item.path}`)
		}

		item.promise = item.loader === undefined
			? Promise.resolve(item.definition)
			: item.loader.fn({
					uri: item.loader.uri,
					schema: item.loader.schema,
					url: item.loader.url,
				})

		const request = ++item.request

		item.promise
			.then(value => {
				if (request > item.version) {
					this._logger?.info(`Updated value for ${item.path}`)
					item.version = request
					item.value = value
				}
			})

		item.promise
			.catch(error => {
				this._logger?.error(`Updating value failed ${item.path}`, error)
			})

		return item.promise
	}

	public refresh(path?: string): Promise<void> {
		this.requireLoaded(true)

		if (path !== undefined) {
			return this.refreshItem(this.requireItem(path)).then(() => {})
		}

		for (const item of this._resolved.values()) {
			this.refreshItem(item)
		}

		return this.allPromises()
	}

	public value(path: string): Wrapper | undefined {
		this.requireLoaded(true)

		const item = this.requireItem(path)

		if (item.value === undefined) {
			return undefined
		}

		return new Wrapper(item.path, item.value)
	}

	public valueSafe(path: string): Wrapper {
		this.requireLoaded(true)

		const item = this.requireItem(path)
		return new Wrapper(item.path, item.value)
	}

	public promise(path: string): Promise<Wrapper> {
		this.requireLoaded(true)

		return this.requireItem(path).promise.then(x => new Wrapper(path, x))
	}

	public branch(key: string, value: string, overwrite: boolean = true): this {
		this.requireLoaded(false)

		if (!overwrite && key in this._branches) {
			throw new Error(`Branch already specified for ${key} [${value}]`)
		}

		this._branches[key] = value

		return this
	}

	public registerLoader<T extends Value>(schema: string, loader: Loader<T>, overwrite: boolean = true): this {
		this.requireLoaded(false)

		if (!overwrite && schema in this._loaders) {
			throw new Error(`Loader already registered for schema ${schema}`)
		}

		this._loaders[schema] = loader

		return this
	}

	public logger(logger: Logger, overwrite: boolean = true): this {
		this.requireLoaded(false)

		if (!overwrite && this._logger !== undefined) {
			throw new Error(`Logger already registered`)
		}

		this._logger = logger

		return this
	}
}
