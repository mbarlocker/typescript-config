
export interface Value<T> {
	get loaded(): boolean
	get updated(): Date | undefined
	get age(): number | undefined

	value(): T
	promise(): Promise<T>
	clear(): void
	load(): Promise<T>
	reset(): Promise<T>
	refresh(): Promise<T>

	activateBranch(key: string, name: string): void
	lockBranches(): void
}
