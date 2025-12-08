import { useCallback } from 'react'

import type { DeliveryAgentStateOnDelivery } from '~/models/DeliveryAgentState'
import type { RecipientState } from '~/models/RecipientState'
import { backupDelivery } from '~/stores/PreferenceStore'

export const useDeliveryStorage = () => {
    const saveDeliveryState = useCallback(async (recipients: RecipientState[]) => {
        await backupDelivery({ type: 'OnDelivery', recipients } as DeliveryAgentStateOnDelivery)
    }, [])

    return {
        saveDeliveryState,
    }
}
