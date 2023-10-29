import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import '@testing-library/jest-dom'

import { PostResultView } from '~/components/PostResultView'

describe('Initialize state', () => {
  test('shows empty', async () => {
    const { container } = render(
      <PostResultView postStatus={{ type: 'Initialize' }} services={[]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Process state', () => {
  test('should show service icon', async () => {
    render(
      <PostResultView
        postStatus={{
          type: 'Process',
          results: [{ service: 'Twitter', type: 'Posting' }],
        }}
        services={[]}
      />,
    )
    screen.debug()
    expect(screen.getByAltText('Twitter')).toBeInTheDocument()
  })
})

describe('Output state', () => {
  test('should show service icon and success message', async () => {
    render(
      <PostResultView
        postStatus={{
          type: 'Output',
          results: [
            {
              service: 'Twitter',
              type: 'Success',
              url: 'https://twitter.com/',
            },
          ],
        }}
        services={[]}
      />,
    )
    screen.debug()
    expect(screen.getByAltText('Twitter')).toBeInTheDocument()
    expect(screen.getByText('Success!')).toBeInTheDocument()
  })
})
