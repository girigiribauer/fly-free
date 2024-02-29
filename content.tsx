import styleTextDeliveryView from 'data-text:~/components/DeliveryView.module.css'
import styleTextRecipientList from 'data-text:~/components/RecipientList.module.css'
import styleTextReloadButton from 'data-text:~/components/ReloadButton.module.css'
import styleTextSocialMediaIcon from 'data-text:~/components/SocialMediaIcon.module.css'
import styleTextSubmitButton from 'data-text:~/components/SubmitButton.module.css'
import styleTextContent from 'data-text:~/content.module.css'
import type { PlasmoCSConfig } from 'plasmo'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DeliveryView } from '~/components/DeliveryView'
import { RecipientList } from '~/components/RecipientList'
import { ReloadButton } from '~/components/ReloadButton'
import { SubmitButton } from '~/components/SubmitButton'
import style from '~/content.module.css'
import { SelectorTweetButton } from '~/definitions'
import { useReplaceTitle } from '~/hooks/useReplaceTitle'
import { useResizeAndReload } from '~/hooks/useResizeAndReload'
import { useScanDraft } from '~/hooks/useScanDraft'
import { useStore } from '~/hooks/useStore'
import { captureDraft, queryFromUnstableDOM } from '~/libs/twitterDOM'
import type {
  DeliveryAgentState,
  DeliveryAgentStateDelivered,
  DeliveryAgentStateOnDelivery,
} from '~/models/DeliveryAgentState'
import type { PostMessageState } from '~/models/PostMessageState'
import type { ProcessMessage } from '~/models/ProcessMessage'
import type { SocialMedia } from '~/models/SocialMedia'
import { backupDelivery, restoreDelivery, updateStore } from '~/models/Store'
import { checkValidation as checkValidationBluesky } from '~/services/Bluesky'
import { checkValidation as checkValidationTwitter } from '~/services/Twitter'

export const getStyle = () => {
  const styleElement = document.createElement('style')
  const textContent = [
    styleTextContent, // for content.tsx
    styleTextRecipientList, // for RecipientList.tsx
    styleTextDeliveryView, // for DeliveryView.tsx
    styleTextReloadButton, // for ReloadButton.tsx
    styleTextSocialMediaIcon, // for SocialMediaIcon.tsx
    styleTextSubmitButton, // for SubmitButton.tsx
  ].join('\n')
  styleElement.textContent = textContent
  return styleElement
}

export const config: PlasmoCSConfig = {
  matches: [
    'https://twitter.com/intent/post?ff=1*',
    'https://x.com/intent/post?ff=1*',
  ],
  run_at: 'document_end',
}

const Overlay = () => {
  const submitRef = useRef<HTMLButtonElement>()

  const [delivery, setDelivery] = useState<DeliveryAgentState>({
    type: 'Initial',
  })
  const pref = useStore()

  const handleSwitch = useCallback(
    async (media: SocialMedia, paused: boolean) => {
      let key: string | null = null
      switch (media) {
        case 'Twitter':
          key = `twitterPaused`
          break
        case 'Bluesky':
          key = `blueskyPaused`
          break
      }
      if (!key) return

      await updateStore({ [key]: paused })
    },
    [],
  )

  const handleSubmit = useCallback(() => {
    if (delivery.type !== 'Writing') return

    // Sentences are cut off in the middle (only Bluesky)
    const draft = captureDraft(queryFromUnstableDOM())
    if (!draft) return

    const validRecipients = delivery.recipients
      .filter(
        (r) =>
          r.type === 'Writing' &&
          r.postValidate.type === 'Valid' &&
          r.enabled &&
          !r.paused,
      )
      .map<PostMessageState>((r) => ({
        type: 'Posting',
        recipient: r.recipient,
      }))

    setDelivery({ type: 'OnDelivery', recipients: validRecipients })

    const message: ProcessMessage = {
      type: 'Post',
      draft: JSON.stringify(draft),
      recipients: validRecipients,
    }
    chrome.runtime.sendMessage(message)
  }, [delivery])

  const handleSubmitProxy = () => {
    if (!submitRef.current) return

    const button: HTMLButtonElement = submitRef.current
    if (button.disabled) return

    button.click()
  }

  const containerRef = useRef(document.body)
  const draft = useScanDraft(containerRef.current, handleSubmitProxy)

  const recipients: PostMessageState[] = useMemo(() => {
    const socialMedia: SocialMedia[] = ['Twitter', 'Bluesky']

    if (delivery.type === 'Initial') {
      return socialMedia.map<PostMessageState>((recipient) => ({
        type: 'Initial',
        recipient,
      }))
    }

    return [
      {
        type: 'Writing',
        recipient: 'Twitter',
        enabled: pref.twitterEnabled,
        paused: pref.twitterPaused,
        postValidate: checkValidationTwitter(draft, pref),
      },
      {
        type: 'Writing',
        recipient: 'Bluesky',
        enabled: pref.blueskyEnabled,
        paused: pref.blueskyPaused,
        postValidate: checkValidationBluesky(draft, pref),
      },
    ]
  }, [delivery, pref])

  const validRecipients: SocialMedia[] = useMemo(
    () =>
      recipients
        .filter(
          (r) =>
            r.type === 'Writing' &&
            r.postValidate.type === 'Valid' &&
            r.enabled &&
            !r.paused,
        )
        .map((r) => r.recipient),
    [recipients],
  )

  useReplaceTitle()
  useResizeAndReload()

  const handleReceiveMessage = useCallback(
    (message: unknown) => {
      if (delivery.type !== 'OnDelivery') return

      const receivedMessage = message as ProcessMessage

      let newDeliveryAgent:
        | DeliveryAgentStateOnDelivery
        | DeliveryAgentStateDelivered

      switch (receivedMessage.type) {
        case 'Success':
        case 'Error':
          const recipients = delivery.recipients.map((r) => {
            if (r.recipient === receivedMessage.recipient) {
              return receivedMessage as PostMessageState
            }
            return r
          })

          newDeliveryAgent = {
            type: 'OnDelivery',
            recipients,
          }
          break

        case 'Tweet':
          const button = document.querySelector(
            SelectorTweetButton,
          ) as HTMLDivElement

          ;(async () => {
            await backupDelivery(delivery)
            button.click()

            setDelivery({ type: 'Initial' })
            return
          })()
          break

        default:
          console.warn('mismatch message')
          return
      }

      const allPosted = !newDeliveryAgent.recipients.some(
        (a) => a.type === 'Posting',
      )
      if (allPosted) {
        newDeliveryAgent = {
          ...newDeliveryAgent,
          type: 'Delivered',
        }
      }
      setDelivery(newDeliveryAgent)
    },
    [delivery],
  )

  // TODO: improvement
  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleReceiveMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleReceiveMessage)
    }
  }, [delivery])

  // TODO: improvement
  useEffect(() => {
    if (delivery.type !== 'Initial') return

    void (async () => {
      const restored = await restoreDelivery()

      if (restored) {
        setDelivery({
          type: 'Delivered',
          recipients: restored.recipients.map((r) =>
            r.recipient === 'Twitter'
              ? {
                  type: 'Success',
                  recipient: 'Twitter',
                  url: 'https://twitter.com', // cannot post URL
                }
              : r,
          ),
        })
      } else if (draft) {
        setDelivery({
          type: 'Writing',
          recipients,
        })
      }
    })()
  }, [draft])

  // TODO: improvement
  useEffect(() => {
    if (delivery.type !== 'Writing') return

    setDelivery({
      type: 'Writing',
      recipients,
    })
  }, [draft])

  const isBeforePost =
    delivery.type === 'Initial' || delivery.type === 'Writing'

  return (
    <>
      <div className={style.header}>
        <div className={style.recipientsArea}>
          <ReloadButton disabled={!isBeforePost} />
          {isBeforePost ? (
            <RecipientList
              recipients={recipients}
              handleSwitch={handleSwitch}
            />
          ) : null}
        </div>

        <div className={style.buttonsArea}>
          <SubmitButton
            innerRef={submitRef}
            delivery={delivery}
            validRecipients={validRecipients}
            handleSubmit={handleSubmit}
          />
          <a
            className={style.optionLink}
            href={chrome.runtime.getURL('options.html')}
            target="_blank">
            Options
          </a>
        </div>
      </div>
      <DeliveryView delivery={delivery} />
    </>
  )
}

export default Overlay
