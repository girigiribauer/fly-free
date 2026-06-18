import style from '~/components/MigrationBanner.module.css'

export const MigrationBanner = () => {
  return (
    <a
      className={style.banner}
      href={chrome.runtime.getURL('options.html')}
      target="_blank"
      rel="noopener noreferrer">
      <span className={style.label}>
        {chrome.i18n.getMessage('migrationBanner')}
      </span>
      <svg
        className={style.arrow}
        width="9"
        height="11"
        viewBox="0 0 9 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.25 4.567c.333.192.333.674 0 .866l-6.75 3.897C1.167 9.523.75 9.282.75 8.897V1.103c0-.385.417-.626.75-.433L8.25 4.567z"
          fill="white"
        />
      </svg>
    </a>
  )
}
