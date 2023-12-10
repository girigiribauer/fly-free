import { useCallback, useRef } from 'react'

import { SocialMediaIcon } from '~/components/SocialMediaIcon'
import { ToggleButton } from '~/components/ToggleButton'
import { useStore } from '~/hooks/useStore'
import { debounce } from '~/libs/debounce'
import { updateStore } from '~/models/Store'
import style from '~/options.module.css'

const OptionsPage = () => {
  const pref = useStore()
  const updatedRef = useRef<HTMLElement>()

  const showUpdatedFeedback = useCallback(
    debounce(() => {
      if (!updatedRef.current) return

      updatedRef.current.classList.add('active')
      setTimeout(() => {
        updatedRef.current.classList.remove('active')
      }, 2000)
    }, 1000),
    [],
  )

  const handleUpdate = useCallback(
    async (key: string, value: string | number | boolean) => {
      await updateStore({ [key]: value })

      showUpdatedFeedback()
    },
    [],
  )

  return (
    <main className={style.main}>
      <h1 className={style.mainTitle}>
        <img src="/assets/icon.png" alt="FlyFree" width="40" height="40" />
        <span>FlyFree Preferences</span>
      </h1>

      <div className={style.block}>
        <h2 className={style.blockTitle}>
          <SocialMediaIcon media="Twitter" type="Valid" />
          <span>Twitter</span>
          <ToggleButton
            id="TwitterEnabled"
            state={pref.twitterEnabled}
            handleToggle={(s) => handleUpdate('twitterEnabled', s)}
          />
        </h2>

        <div className={style.blockContent}>
          <p className={style.elementText}>
            <span>You just login at </span>
            <a href="https://twitter.com/login" target="_blank">
              Twitter
            </a>
          </p>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="TwitterPaused">
              Paused
            </label>
            <div className={style.elementValue}>
              <ToggleButton
                id="TwitterPaused"
                state={pref.twitterPaused}
                handleToggle={(s) => handleUpdate('twitterPaused', s)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={style.block}>
        <h2 className={style.blockTitle}>
          <SocialMediaIcon media="Bluesky" type="Valid" />
          <span>Bluesky</span>
          <ToggleButton
            id="BlueskyEnabled"
            state={pref.blueskyEnabled}
            handleToggle={(s) => handleUpdate('blueskyEnabled', s)}
          />
        </h2>

        <div className={style.blockContent}>
          <p className={style.elementText}>
            <span>You must use </span>
            <a href="https://bsky.app/settings/app-passwords" target="_blank">
              App Passwords
            </a>
          </p>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="BlueskyPaused">
              Paused
            </label>
            <div className={style.elementValue}>
              <ToggleButton
                id="BlueskyPaused"
                state={pref.blueskyPaused}
                handleToggle={(s) => handleUpdate('blueskyPaused', s)}
              />
            </div>
          </div>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="blueskyUsername">
              Username
            </label>
            <div className={style.elementValue}>
              <input
                type="text"
                id="BlueskyUsername"
                name="BlueskyUsername"
                placeholder="bluesky.bsky.social"
                value={pref.blueskyUsername}
                onChange={(e) =>
                  handleUpdate('blueskyUsername', e.target.value)
                }
              />
            </div>
          </div>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="blueskyPassword">
              Password
            </label>
            <div className={style.elementValue}>
              <input
                type="password"
                id="BlueskyPassword"
                name="BlueskyPassword"
                value={pref.blueskyPassword}
                onChange={(e) => {
                  handleUpdate('blueskyPassword', e.target.value)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={style.block}>
        <h2 className={style.blockTitle}>
          <SocialMediaIcon media="Taittsuu" type="Valid" />
          <span>Taittsu</span>
        </h2>

        <div className={style.blockContent}>
          <p className={style.blockElementText}>
            Soon! (After Taittsuu Auth API release...)
          </p>
        </div>
      </div>

      <div className={style.block}>
        <h2 className={style.blockTitle}>Links</h2>

        <div className={style.blockContent}>
          <ul className={style.blockElementList}>
            <li>
              <a
                href="https://github.com/girigiribauer/fly-free"
                target="_blank">
                Repository (GitHub)
              </a>
            </li>
            <li>
              <a
                href="https://chrome.google.com/webstore/detail/flyfree/mjlfkhenobdjdonefhdbpigopndgeogm"
                target="_blank">
                Extension Page
              </a>
            </li>
          </ul>
        </div>
      </div>
      <span ref={updatedRef} className={style.updatedFeedback}>
        updated!
      </span>
    </main>
  )
}

export default OptionsPage
