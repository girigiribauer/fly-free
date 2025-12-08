export interface StorageAdapter {
    get(keys: string[]): Promise<Record<string, any>>
    set(items: Record<string, any>): Promise<void>
}
