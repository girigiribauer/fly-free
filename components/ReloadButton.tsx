import iconRefresh from 'data-base64:~/assets/icon-refresh.svg'

import style from '~/components/ReloadButton.module.css'

export type ReloadButtonProps = {
  disabled: boolean
  handleReload: () => void
}

export const ReloadButton = ({ disabled, handleReload }: ReloadButtonProps) => {
  return (
    <button
      type="button"
      className={style.reloadButton}
      disabled={disabled}
      onClick={handleReload}>
      <img src={iconRefresh} alt="reload" width="20" height="20" />
    </button>
  )
}
