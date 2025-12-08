import { useEffect, useRef, useState } from 'react'

import type { Draft } from '~/models/Draft'
import type { Preference } from '~/models/Preference'
import type { PostingStatus } from '~/models/PostingStatus'
import type { RecipientState } from '~/models/RecipientState'
import { restoreDelivery, save, updateStore } from '~/stores/PreferenceStore'

/**
 * 初期状態の復元と Draft 検出を行うフック
 *
 * @param draft - 現在の Draft
 * @param pref - ユーザー設定
 * @param status - 現在の投稿状態
 * @param setRecipients - Recipients を更新する関数
 *
 * @description
 * 1. 初回マウント時に前回の投稿状態を復元
 * 2. Draft が検出されたら Writing 状態に遷移
 */
export const useInitialState = (
    draft: Draft | null,
    pref: Preference,
    status: PostingStatus,
    setRecipients: (recipients: RecipientState[]) => void,
) => {
    const [isRestored, setIsRestored] = useState(false)

    // 状態復元（初回のみ）
    useEffect(() => {
        if (status !== 'Initial') return

        void (async () => {
            const restored = await restoreDelivery()

            if (restored) {
                // 復元された状態を recipients にセット
                setRecipients(
                    restored.recipients.map((r) =>
                        r.recipient === 'Twitter'
                            ? {
                                type: 'Success',
                                recipient: 'Twitter',
                                url: 'https://twitter.com', // cannot post URL
                            }
                            : r,
                    ),
                )
            }

            setIsRestored(true)
        })()
    }, []) // ✅ 初回のみ実行

    // Draft 検出（復元完了後）
    useEffect(() => {
        if (status !== 'Initial') return
        if (!isRestored) return // 復元完了まで待つ
        if (!draft) return

        // Draft が検出されたら Writing 状態に
        setRecipients([
            {
                type: 'Writing',
                recipient: 'Twitter',
                paused: pref.twitterPaused,
            },
            {
                type: 'Writing',
                recipient: 'Bluesky',
                paused: pref.blueskyPaused,
            },
        ])
    }, [draft, pref, status, isRestored]) // ✅ draft, pref に依存
}
