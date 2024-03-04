import iconBlank from 'data-base64:~/assets/icon-blank.svg'
import iconRefresh from 'data-base64:~/assets/icon-refresh.svg'

import style from '~/components/ReloadButton.module.css'

export type ReloadButtonProps = {
  disabled: boolean
  forceBlank: boolean
  handleReload: () => void
}

export const ReloadButton = ({
  disabled,
  forceBlank,
  handleReload,
}: ReloadButtonProps) => {
  return (
    <button
      type="button"
      className={style.reloadButton}
      disabled={disabled}
      onClick={handleReload}>
      <img
        src={forceBlank ? iconBlank : iconRefresh}
        alt="reload"
        width="20"
        height="20"
      />
    </button>
  )
}
