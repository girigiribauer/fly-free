export const TwitterTweetURL = 'https://x.com/intent/post'

export const getTwitterIntentURL = (
    text: string | undefined,
    url: string | undefined,
    isForceBlank: boolean,
): string => {
    const urlParams = new URLSearchParams({
        ff: '1',
    })

    if (isForceBlank) {
        return `${TwitterTweetURL}?${urlParams}`
    }

    if (text) {
        urlParams.append('text', text)
    }
    if (url) {
        urlParams.append('url', url)
    }

    return `${TwitterTweetURL}?${urlParams}`
}
