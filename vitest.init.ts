import * as storage from 'mem-storage-area'
import * as chrome from 'vitest-chrome'

Object.assign(global, chrome)
global.chrome.storage = storage
