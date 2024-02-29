import iconRefresh from 'data-base64:~/assets/icon-refresh.svg'

import style from '~/components/ReloadButton.module.css'

export type ReloadButtonProps = {
  disabled: boolean
}

export const ReloadButton = ({ disabled }: ReloadButtonProps) => {
  return (
    <button
      type="button"
      className={style.reloadButton}
      disabled={disabled}
      onClick={() => location.reload()}>
      <img src={iconRefresh} alt="reload" width="20" height="20" />
    </button>
  )
}
