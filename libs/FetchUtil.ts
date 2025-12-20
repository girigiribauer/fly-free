
export const fetchWithTimeout = async (
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> => {
    const urlString = input.toString()

    let timeoutMs = 60000

    if (urlString.includes('/com.atproto.repo.uploadBlob')) {
        timeoutMs = 60000 // 1 minute for images (User agreed limit)
    } else if (urlString.includes('/com.atproto.repo.createRecord')) {
        timeoutMs = 30000 // 30 seconds for posting text (Fail fast, retry fast)
    }

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const response = await fetch(input, {
            ...init,
            signal: controller.signal,
        })
        clearTimeout(id)
        return response
    } catch (error) {
        clearTimeout(id)
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs}ms: ${urlString}`)
        }
        throw error
    }
}
