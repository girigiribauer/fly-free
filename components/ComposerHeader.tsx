import type { DeliveryAgentState } from '~/models/DeliveryAgentState'
import type { PostMessageState } from '~/models/PostMessageState'
import type { SocialMedia } from '~/models/SocialMedia'
import { RecipientList } from '~/components/RecipientList'
import { ReloadButton } from '~/components/ReloadButton'
import { SubmitButton } from '~/components/SubmitButton'
import style from '~/content.module.css'

export type ComposerHeaderProps = {
    submitRef: React.RefObject<HTMLButtonElement>
    delivery: DeliveryAgentState
    recipients: PostMessageState[]
    validRecipients: SocialMedia[]
    forceBlank: boolean
    handleSwitch: (media: SocialMedia, paused: boolean) => Promise<void>
    handleSubmit: () => void
    dryRun: boolean
    handleDryRunChange: (checked: boolean) => void
}

export const ComposerHeader = ({
    submitRef,
    delivery,
    recipients,
    validRecipients,
    forceBlank,
    handleSwitch,
    handleSubmit,
    dryRun,
    handleDryRunChange,
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
                    <>
                        <RecipientList
                            recipients={recipients}
                            handleSwitch={handleSwitch}
                        />
                        {process.env.NODE_ENV === 'development' ? (
                            <label
                                title="Dry Run Mode"
                                style={{ display: 'flex', alignItems: 'center', margin: '0 8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={dryRun}
                                    onChange={(e) => handleDryRunChange(e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                            </label>
                        ) : null}
                    </>
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
