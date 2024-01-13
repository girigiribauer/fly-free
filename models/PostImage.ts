import { imageDimensionsFromData } from 'image-dimensions'

export type PostImage = {
  binary: Uint8Array
  mimetype: string
  filesize: number
}

export const convertImageURL2PostImage = async (
  imageURL: string,
): Promise<PostImage> => {
  const fetchResponse = await fetch(imageURL)
  const blobObject = await fetchResponse.blob()
  const mimetype = blobObject.type
  const binary = new Uint8Array(await blobObject.arrayBuffer())
  const filesize = binary.byteLength

  return {
    binary,
    mimetype,
    filesize,
  }
}
