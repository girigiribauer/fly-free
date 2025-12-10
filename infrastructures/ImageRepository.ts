export const fetchImageFromURL = async (
    imageURL: string,
): Promise<Uint8Array> => {
    const fetchResponse = await fetch(imageURL)
    const blobObject = await fetchResponse.blob()
    const binary = new Uint8Array(await blobObject.arrayBuffer())
    return binary
}
