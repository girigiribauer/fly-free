import styleTextEnableServices from 'data-text:~/components/EnableServices.module.css'
import styleTextPostResultView from 'data-text:~/components/PostResultView.module.css'
import styleTextReloadButton from 'data-text:~/components/ReloadButton.module.css'
import styleTextServiceIcon from 'data-text:~/components/ServiceIcon.module.css'
import styleTextSubmitButton from 'data-text:~/components/SubmitButton.module.css'
import styleTextContent from 'data-text:~/content.module.css'
import type { PlasmoCSConfig } from 'plasmo'
import { useCallback, useEffect, useRef, useState } from 'react'

import { EnableServices } from '~/components/EnableServices'
import { PostResultView } from '~/components/PostResultView'
import { SubmitButton } from '~/components/SubmitButton'
import style from '~/content.module.css'
import { SelectorTweetButton } from '~/definitions'
import { useReplaceTitle } from '~/hooks/useReplaceTitle'
import { useScanDraft } from '~/hooks/useScanDraft'
import type { Draft } from '~/models/Draft'
import type { Message } from '~/models/Message'
import type {
  PostStatus,
  PostStatusOutput,
  PostStatusProcess,
} from '~/models/PostStatus'
import { createBlueskyFrontend } from '~/models/ServiceBluesky'
import type { ServiceResult } from '~/models/ServiceResult'
import { createTwitterFrontend } from '~/models/ServiceTwitter'
import { createStore, resumeTweeting, suspendTweeting } from '~/models/Store'
import { ReloadButton } from '~components/ReloadButton'

export const getStyle = () => {
  const styleElement = document.createElement('style')
  const textContent = [
    styleTextContent, // for content.tsx
    styleTextEnableServices, // for EnableServices.tsx
    styleTextPostResultView, // for PostResultView.tsx
    styleTextReloadButton, // for ReloadButton.tsx
    styleTextServiceIcon, // for ServiceIcon.tsx
    styleTextSubmitButton, // for SubmitButton.tsx
  ].join('\n')
  styleElement.textContent = textContent
  return styleElement
}

export const config: PlasmoCSConfig = {
  matches: ['https://twitter.com/intent/tweet*', 'https://x.com/intent/tweet*'],
  run_at: 'document_idle',
}

const Overlay = () => {
  const submitRef = useRef<HTMLButtonElement>()

  const [postStatus, setPostStatus] = useState<PostStatus>({
    type: 'Initialize',
  })
  const stores = {
    Twitter: createStore('Twitter'),
    Bluesky: createStore('Bluesky'),
  }
  const services = [
    createTwitterFrontend(stores['Twitter']),
    createBlueskyFrontend(stores['Bluesky']),
  ]

  const handleSubmit = useCallback(
    (draft: Draft) => {
      if (!draft) return
      if (postStatus.type !== 'Input') return

      const targetServices = postStatus.statuses
        .filter((s) => s.type !== 'Paused')
        .map((s) => s.service)

      setPostStatus(() => {
        const results = targetServices.map<ServiceResult>((service) => ({
          type: 'Posting',
          service,
        }))
        return { type: 'Process', results }
      })

      const message: Message = {
        type: 'Post',
        draft: JSON.stringify(draft),
        services: targetServices,
      }
      chrome.runtime.sendMessage(message)
    },
    [postStatus],
  )

  const handleSubmitProxy = () => {
    if (!submitRef.current) return

    const button: HTMLButtonElement = submitRef.current
    if (button.disabled) return

    button.click()
  }

  const draft = useScanDraft(handleSubmitProxy)

  useReplaceTitle()

  const handleReceiveMessage = useCallback(
    (message: unknown) => {
      if (postStatus.type !== 'Process') return

      const receivedMessage = message as Message

      let newPostStatus: PostStatusProcess | PostStatusOutput
      switch (receivedMessage.type) {
        case 'Success':
        case 'Error':
          const results = postStatus.results.map((s) => {
            if (s.service === receivedMessage.service) {
              return receivedMessage as ServiceResult
            }
            return s
          })

          newPostStatus = {
            type: 'Process',
            results,
          }
          break

        case 'Tweet':
          const button = document.querySelector(
            SelectorTweetButton,
          ) as HTMLDivElement

          ;(async () => {
            // I don't know about Twitter UI behavior...
            // Suspend => Refresh(or Initialize) => Resume
            await suspendTweeting(postStatus)
            button.click()

            setPostStatus({ type: 'Initialize' })
            return
          })()
          break

        default:
          console.warn('mismatch message')
          return
      }

      const allPosted = !newPostStatus.results.some((a) => a.type === 'Posting')
      if (allPosted) {
        newPostStatus = {
          ...newPostStatus,
          type: 'Output',
        }
      }
      setPostStatus(newPostStatus)
    },
    [postStatus],
  )

  // TODO: brushup...

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleReceiveMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleReceiveMessage)
    }
  }, [postStatus])

  useEffect(() => {
    if (postStatus.type !== 'Initialize') return

    void (async () => {
      const resumedPostStatus = await resumeTweeting()

      if (resumedPostStatus) {
        setPostStatus({
          type: 'Output',
          results: resumedPostStatus.results.map((r) =>
            r.service === 'Twitter'
              ? {
                  type: 'Success',
                  service: 'Twitter',
                  url: 'https://twitter.com', // cannot post URL
                }
              : r,
          ),
        })
      } else if (draft) {
        setPostStatus({
          type: 'Input',
          draft,
          statuses: services.map((s) => s.getStatus(draft)),
        })
      }
    })()
  }, [postStatus, draft])

  useEffect(() => {
    if (postStatus.type !== 'Input') return

    setPostStatus({
      type: 'Input',
      draft,
      statuses: services.map((s) => s.getStatus(draft)),
    })
  }, [draft])

  const isBeforePost =
    postStatus.type === 'Initialize' || postStatus.type === 'Input'

  return (
    <>
      <div className={style.header}>
        <div className={style.serviceArea}>
          <ReloadButton disabled={!isBeforePost} />
          {isBeforePost ? (
            <EnableServices services={services} draft={draft} />
          ) : null}
        </div>

        <div className={style.buttonsArea}>
          <SubmitButton
            innerRef={submitRef}
            postStatus={postStatus}
            handleSubmit={() => handleSubmit(draft)}
          />
          <a
            className={style.optionLink}
            href={chrome.runtime.getURL('options.html')}
            target="_blank">
            Options
          </a>
        </div>
      </div>
      <PostResultView services={services} postStatus={postStatus} />
    </>
  )
}

export default Overlay
