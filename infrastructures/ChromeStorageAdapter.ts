import type { StorageAdapter } from '~/interfaces/StorageAdapter'

export class ChromeStorageAdapter implements StorageAdapter {
    async get(keys: string[]): Promise<Record<string, any>> {
        return await chrome.storage.local.get(keys)
    }

    async set(items: Record<string, any>): Promise<void> {
        await chrome.storage.local.set(items)
    }
}
