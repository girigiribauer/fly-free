import { useCallback } from 'react'

import type { RecipientState } from '~/models/RecipientState'
import { backupDelivery } from '~/models/Store'

export const useDeliveryStorage = () => {
    const saveDeliveryState = useCallback(async (recipients: RecipientState[]) => {
        await backupDelivery(recipients)
    }, [])

    return {
        saveDeliveryState,
    }
}
