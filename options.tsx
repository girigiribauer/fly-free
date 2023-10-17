import type { KeyboardEvent } from 'react'

import { ServiceIcon } from '~/components/ServiceIcon'
import { ServiceToggle } from '~/components/ServiceToggle'
import { createStoreBluesky } from '~/models/frontend/StoreBluesky'
import { createStoreTaittsuu } from '~/models/frontend/StoreTaittsuu'
import { createStoreTwitter } from '~/models/frontend/StoreTwitter'
import type { ServiceName } from '~/models/ServiceName'
import style from '~/options.module.css'

const OptionsPage = () => {
  const stores = {
    Twitter: createStoreTwitter(),
    Bluesky: createStoreBluesky(),
    Taittsuu: createStoreTaittsuu(),
  }

  const handleUpdate = async (
    service: ServiceName,
    key: string,
    value: string | number | boolean,
  ) => {
    if (!(service in stores)) return

    await stores[service].set(key, value)
  }

  const handleEnter = (event: KeyboardEvent) => {
    if (event.code !== 'Enter') return

    const input = event.target as HTMLInputElement
    input.classList.add('update')
    setTimeout(() => {
      input.classList.remove('update')
    }, 1300)
  }

  return (
    <main className={style.main}>
      <h1 className={style.mainTitle}>
        <img src="/assets/icon.png" alt="FlyFree" width="40" height="40" />
        <span>FlyFree Preferences</span>
      </h1>

      {stores['Twitter'].data ? (
        <div className={style.block}>
          <h2 className={style.blockTitle}>
            <ServiceIcon
              service="Twitter"
              type="Valid"
              iconURL="/assets/icon-twitter.svg"
            />
            <span>Twitter</span>
            <ServiceToggle
              id="TwitterEnabled"
              state={stores['Twitter'].data.enabled}
              handleSwitch={(s) => handleUpdate('Twitter', 'enabled', s)}
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
                <ServiceToggle
                  id="TwitterPaused"
                  state={stores['Twitter'].data.paused}
                  handleSwitch={(s) => handleUpdate('Twitter', 'paused', s)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {stores['Bluesky'].data ? (
        <div className={style.block}>
          <h2 className={style.blockTitle}>
            <ServiceIcon
              service="Bluesky"
              type="Valid"
              iconURL="/assets/icon-bluesky.svg"
            />
            <span>Bluesky</span>
            <ServiceToggle
              id="BlueskyEnabled"
              state={stores['Bluesky'].data.enabled}
              handleSwitch={(s) => handleUpdate('Bluesky', 'enabled', s)}
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
                <ServiceToggle
                  id="BlueskyPaused"
                  state={stores['Bluesky'].data.paused}
                  handleSwitch={(s) => handleUpdate('Bluesky', 'paused', s)}
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
                  value={stores['Bluesky'].data.username}
                  onChange={(e) =>
                    handleUpdate('Bluesky', 'username', e.target.value)
                  }
                  onKeyDown={handleEnter}
                />
                <span className={style.updateFeedback}>updated!</span>
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
                  value={stores['Bluesky'].data.password}
                  onChange={(e) => {
                    handleUpdate('Bluesky', 'password', e.target.value)
                  }}
                  onKeyDown={handleEnter}
                />
                <span className={style.updateFeedback}>updated!</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {stores['Taittsuu'].data ? (
        <div className={style.block}>
          <h2 className={style.blockTitle}>
            <ServiceIcon
              service="Taittsuu"
              type="Valid"
              iconURL="/assets/icon-taittsuu.svg"
            />
            <span>Taittsu</span>
            <ServiceToggle id="TaittsuuEnabled" state={false} />
          </h2>

          <div className={style.blockContent}>
            <p className={style.blockElementText}>
              Soon! (After Taittsuu Auth API release...)
            </p>
          </div>
        </div>
      ) : null}

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
              <a href="https://google.com/" target="_blank">
                Extension Page
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default OptionsPage
