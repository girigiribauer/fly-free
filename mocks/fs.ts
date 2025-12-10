export const promises = {
    readFile: async () => { throw new Error('Not implemented in browser') },
    writeFile: async () => { throw new Error('Not implemented in browser') }
}
export const readFileSync = () => { throw new Error('Not implemented in browser') }
export const writeFileSync = () => { throw new Error('Not implemented in browser') }
export const existsSync = () => false
export default {
    promises,
    readFileSync,
    writeFileSync,
    existsSync
}
