import { useCallback, useRef } from 'react'

import { SocialMediaIcon } from '~/components/SocialMediaIcon'
import { ToggleButton } from '~/components/ToggleButton'
import { usePreference } from '~/hooks/usePreference'
import { debounce } from '~/libs/debounce'
import { updateStore } from '~/stores/PreferenceStore'
import style from './options.module.css'

const Options = () => {
  const pref = usePreference()
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
        <span>{chrome.i18n.getMessage('optionsTitle')}</span>
      </h1>
      <p className={style.textBlock}>
        {chrome.i18n.getMessage('description')}
      </p>

      <div className={style.block}>
        <h2 className={style.blockTitle}>
          <SocialMediaIcon media="Twitter" type="Valid" />
          <span>X(Twitter)</span>
        </h2>

        <div className={style.blockContent}>
          <p className={style.elementText}>
            <span>{chrome.i18n.getMessage('twitterLoginNote')}</span><br />
            <a href="https://x.com/login" target="_blank">
              X(Twitter)
            </a>
          </p>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="TwitterPaused">
              {chrome.i18n.getMessage('enabled')}
            </label>
            <div className={style.elementValue}>
              <ToggleButton
                id="TwitterPaused"
                state={!pref.twitterPaused}
                handleToggle={(s) => handleUpdate('twitterPaused', !s)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={style.block}>
        <h2 className={style.blockTitle}>
          <SocialMediaIcon media="Bluesky" type="Valid" />
          <span>Bluesky</span>
        </h2>

        <div className={style.blockContent}>
          <p className={style.elementText}>
            <span>{chrome.i18n.getMessage('blueskyAppPasswordNote')}</span><br />
            <a href="https://bsky.app/settings/app-passwords" target="_blank">
              {chrome.i18n.getMessage('appPasswords')}
            </a>
          </p>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="BlueskyPaused">
              {chrome.i18n.getMessage('enabled')}
            </label>
            <div className={style.elementValue}>
              <ToggleButton
                id="BlueskyPaused"
                state={!pref.blueskyPaused}
                handleToggle={(s) => handleUpdate('blueskyPaused', !s)}
              />
            </div>
          </div>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="blueskyUsername">
              {chrome.i18n.getMessage('username')}
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
              {chrome.i18n.getMessage('password')}
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
        <h2 className={style.blockTitle}>{chrome.i18n.getMessage('globalPreferences')}</h2>

        <div className={style.blockContent}>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="globalAutoclosing">
              {chrome.i18n.getMessage('autoClosing')}
            </label>
            <div className={style.elementValue}>
              <ToggleButton
                id="GlobalAutoclosing"
                state={pref.globalAutoclosing}
                handleToggle={(s) => handleUpdate('globalAutoclosing', s)}
              />
            </div>
          </div>
          <div className={style.elementPair}>
            <label className={style.elementKey} htmlFor="globalForceblank">
              {chrome.i18n.getMessage('forceBlank')}
            </label>
            <div className={style.elementValue}>
              <ToggleButton
                id="GlobalForceblank"
                state={pref.globalForceblank}
                handleToggle={(s) => handleUpdate('globalForceblank', s)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={style.block}>
        <h2 className={style.blockTitle}>{chrome.i18n.getMessage('links')}</h2>

        <div className={style.blockContent}>
          <ul className={style.blockElementList}>
            <li>
              <a
                href="https://github.com/girigiribauer/fly-free"
                target="_blank">
                {chrome.i18n.getMessage('repository')}
              </a>
            </li>
            <li>
              <a
                href="https://chrome.google.com/webstore/detail/flyfree/mjlfkhenobdjdonefhdbpigopndgeogm"
                target="_blank">
                {chrome.i18n.getMessage('extensionPage')}
              </a>
            </li>
            <li>
              <a
                href="https://bsky.app/profile/girigiribauer.com"
                target="_blank">
                @girigiribauer.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className={style.textBlock}>
        {chrome.i18n.getMessage('maintenanceNote')}
      </p>

      <span ref={updatedRef} className={style.updatedFeedback}>
        updated!
      </span>
    </main>
  )
}

export default Options
