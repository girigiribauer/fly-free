import { readFile } from 'fs/promises'
import path from 'path'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach } from 'node:test'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import {
  convertImageURL2PostImage,
  convertReductionPostImage,
  estimateReductionRatio,
  MAX_IMAGE_SIZE,
} from '~/models/PostImage'
import type { PostImage } from '~/models/PostImage'

const resourceHandlers = [
  http.get('http://localhost/:imageFile', async ({ params }) => {
    const binary = await readBinaryFromPath(`../resources/${params.imageFile}`)

    return HttpResponse.arrayBuffer(binary.buffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  }),
]
const resourceServer = setupServer(...resourceHandlers)

const readBinaryFromPath = async (filepath: string): Promise<Uint8Array> => {
  const buffer = await readFile(path.join(__dirname, filepath))
  return Uint8Array.from(buffer)
}

describe('convertImageURL2PostImage', () => {
  beforeAll(() => {
    resourceServer.listen()
  })

  afterEach(() => {
    resourceServer.resetHandlers()
  })

  afterAll(() => {
    resourceServer.close()
  })

  test('1mbless image converts same size PostImage', async () => {
    const binary = await readBinaryFromPath('../resources/random1mbless.png')
    const expected: PostImage = {
      binary,
      mimetype: 'image/png',
      width: 407,
      height: 407,
      filesize: binary.byteLength,
    }

    const imageURL = 'http://localhost/random1mbless.png'
    const actual = await convertImageURL2PostImage(imageURL)

    expect(actual.filesize).toBe(expected.filesize)
  })

  test('2mb image converts less than equal 1mb', async () => {
    const binary = await readBinaryFromPath('../resources/random2mb.png')
    const expected: PostImage = {
      binary,
      mimetype: 'image/png',
      width: 577,
      height: 577,
      filesize: binary.byteLength,
    }

    const imageURL = 'http://localhost/random2mb.png'
    const actual = await convertImageURL2PostImage(imageURL)

    expect(actual.filesize).not.toBe(expected.filesize)
    expect(actual.filesize).toBeLessThanOrEqual(MAX_IMAGE_SIZE)
  })
})

describe('convertReductionPostImage', () => {
  test('random1mbless file is not resizing', async () => {
    const binary = await readBinaryFromPath('../resources/random1mbless.png')

    const expected: PostImage = {
      binary,
      mimetype: 'image/png',
      width: 407,
      height: 407,
      filesize: binary.byteLength,
    }
    const actual = await convertReductionPostImage(expected)

    expect(actual.filesize).toBe(expected.filesize)
  })

  test('random2mb file is resizing', async () => {
    const binary = await readBinaryFromPath('../resources/random2mb.png')

    const image: PostImage = {
      binary,
      mimetype: 'image/png',
      width: 577,
      height: 577,
      filesize: binary.byteLength,
    }
    const actual = await convertReductionPostImage(image)

    expect(actual.filesize).toBeLessThanOrEqual(MAX_IMAGE_SIZE)
  })
})

describe('estimateReductionRatio', () => {
  test('Return 1 when the file size is less than 1MB', async () => {
    const expected = 1

    const actual = estimateReductionRatio(999_999)

    expect(actual).toBe(expected)
  })

  test('Return 0.5 when the file size is exactly 4MB', async () => {
    const expected = 0.5

    const actual = estimateReductionRatio(4_000_000)

    expect(actual).toBe(expected)
  })

  test('Return a decimal equivalent to the square root of 2 when the file size is exactly 2MB', async () => {
    const expected = 0.7071 // Approximately 1 / √2

    const actual = estimateReductionRatio(2_000_000)

    expect(actual).toBeCloseTo(expected, 4)
  })
})
