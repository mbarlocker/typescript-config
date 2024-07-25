
export type Value = string | number | boolean | Buffer

export type Definition = { [key: string]: Definition } | Value

export type LoaderArgs = { uri: string, schema: string, url: string }
export type Loader<T extends Value = Value> = (data: LoaderArgs) => Promise<T>

export type Logger = {
	trace: (...args: any[]) => void
	debug: (...args: any[]) => void
	info: (...args: any[]) => void
	warn: (...args: any[]) => void
	error: (...args: any[]) => void
}
