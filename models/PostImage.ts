import { Buffer } from 'buffer/'
import { imageDimensionsFromData } from 'image-dimensions'
import Image from 'image-js'

export type PostImage = {
  binary: Uint8Array
  mimetype: string
  width: number
  height: number
  filesize: number
}

export const MAX_IMAGE_SIZE = 1_000_000

export const convertImageURL2PostImage = async (
  imageURL: string,
): Promise<PostImage> => {
  const fetchResponse = await fetch(imageURL)
  const blobObject = await fetchResponse.blob()
  const mimetype = blobObject.type
  const binary = new Uint8Array(await blobObject.arrayBuffer())
  const filesize = binary.byteLength
  const dimensions = imageDimensionsFromData(binary)

  const image = {
    binary,
    mimetype,
    width: dimensions.width,
    height: dimensions.height,
    filesize,
  }

  const resized = await convertReductionPostImage(image)

  return resized
}

export const convertReductionPostImage = async (
  image: PostImage,
): Promise<PostImage> => {
  if (image.filesize <= MAX_IMAGE_SIZE) {
    return image
  }

  let ratio = estimateReductionRatio(image.filesize)
  let resizedImage = await resizePostImage(image, ratio)

  while (resizedImage.filesize > MAX_IMAGE_SIZE && ratio > 0.05) {
    ratio = ratio - 0.05
    resizedImage = await resizePostImage(image, ratio)
  }

  return resizedImage
}

export const estimateReductionRatio = (filesize: number): number => {
  if (filesize <= MAX_IMAGE_SIZE) {
    return 1
  }

  return Math.sqrt(MAX_IMAGE_SIZE / filesize)
}

export const resizePostImage = async (
  image: PostImage,
  ratio: number,
): Promise<PostImage> => {
  let binaryString = ''
  for (let i = 0; i < image.binary.byteLength; i++) {
    binaryString += String.fromCharCode(image.binary[i])
  }
  const b64encoded = Buffer.from(binaryString, 'binary').toString('base64')
  const mimetype = image.mimetype
  const dataURL = 'data:' + mimetype + ';base64,' + b64encoded

  const src = await Image.load(dataURL)
  const dest = src.resize({ width: Math.floor(image.width * ratio) })
  const newBinary = dest.toBuffer()
  const newDimensions = imageDimensionsFromData(newBinary)

  const newImage: PostImage = {
    binary: newBinary,
    mimetype: image.mimetype,
    width: newDimensions.width,
    height: newDimensions.height,
    filesize: newBinary.byteLength,
  }

  return newImage
}
