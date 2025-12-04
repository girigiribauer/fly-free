import type { DeliveryAgentState } from '~/models/DeliveryAgentState'
import type { PostMessageState } from '~/models/PostMessageState'
import type { SocialMedia } from '~/models/SocialMedia'
import { RecipientList } from '~/components/RecipientList'
import { ReloadButton } from '~/components/ReloadButton'
import { SubmitButton } from '~/components/SubmitButton'
import style from '~/content.module.css'

type ComposerHeaderProps = {
    submitRef: React.RefObject<HTMLButtonElement>
    delivery: DeliveryAgentState
    recipients: PostMessageState[]
    validRecipients: SocialMedia[]
    forceBlank: boolean
    dryRun: boolean
    handleSwitch: (media: SocialMedia, paused: boolean) => Promise<void>
    handleDryRunChange: (checked: boolean) => void
    handleSubmit: () => void
}

export const ComposerHeader = ({
    submitRef,
    delivery,
    recipients,
    validRecipients,
    forceBlank,
    dryRun,
    handleSwitch,
    handleDryRunChange,
    handleSubmit,
}: ComposerHeaderProps) => {
    const isBeforePost =
        delivery.type === 'Initial' || delivery.type === 'Writing'

    return (
        <div className={style.header}>
            <div className={style.recipientsArea}>
                <ReloadButton
                    disabled={!isBeforePost}
                    forceBlank={forceBlank}
                    handleReload={() => location.reload()}
                />

                {isBeforePost ? (
                    <RecipientList
                        recipients={recipients}
                        handleSwitch={handleSwitch}
                        dryRun={dryRun}
                        handleDryRunChange={handleDryRunChange}
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
    )
}
