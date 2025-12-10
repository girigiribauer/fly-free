import { useCallback } from 'react'

import type { SocialMedia } from '~/models/SocialMedia'
import { updateStore } from '~/stores/PreferenceStore'

export const useRecipientSwitch = () => {
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

    return { handleSwitch }
}
