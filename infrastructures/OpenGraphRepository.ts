import { parseHTML, type OpenGraph } from '~/libs/OpenGraphParser'

export const fetchOpenGraph = async (linkcardURL: string): Promise<OpenGraph | null> => {
    let res: Response
    try {
        res = await fetch(linkcardURL, {
            redirect: 'follow',
        })
    } catch (_) {
        return null
    }
    const arrayBuffer = await res.arrayBuffer()
    const html = new TextDecoder('utf-8').decode(arrayBuffer)

    return parseHTML(html, arrayBuffer, linkcardURL)
}
