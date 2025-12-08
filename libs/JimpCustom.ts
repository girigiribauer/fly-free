import { createJimp } from '@jimp/core'
import Jpeg from '@jimp/js-jpeg'
import Png from '@jimp/js-png'
// Force CommonJS import to ensure compatibility with bundles
import { methods as resizeMethods } from '@jimp/plugin-resize/dist/commonjs/index.js'



// Cast to any to bypass strict plugin type check that fails with CJS import
const plugins = [{ methods: resizeMethods }] as any

export const Jimp = createJimp({
    formats: [Jpeg, Png],
    plugins: plugins,
})

// Brute-force: Manually inject methods into prototype to ensure they exist
// This bypasses any potential failure in createJimp's plugin registration logic in the bundle
// Brute-force: Manually inject methods into prototype to ensure they exist
// This bypasses any potential failure in createJimp's plugin registration logic in the bundle
if (resizeMethods) {
    Object.keys(resizeMethods).forEach((methodName) => {
        const method = (resizeMethods as any)[methodName]
        if (typeof method === 'function') {
            ; (Jimp.prototype as any)[methodName] = function (
                ...args: any[]
            ) {
                return method(this, ...args)
            }
        }
    })
}
