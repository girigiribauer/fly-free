import styleTextDeliveryView from 'data-text:~/components/DeliveryView.module.css'
import styleTextRecipientList from 'data-text:~/components/RecipientList.module.css'
import styleTextReloadButton from 'data-text:~/components/ReloadButton.module.css'
import styleTextSocialMediaIcon from 'data-text:~/components/SocialMediaIcon.module.css'
import styleTextSubmitButton from 'data-text:~/components/SubmitButton.module.css'
import styleTextContent from 'data-text:~/content.module.css'

/**
 * Creates a style element containing all CSS for the content script
 * @returns HTMLStyleElement with all component styles
 */
export const getContentStyle = (): HTMLStyleElement => {
    const styleElement = document.createElement('style')
    const textContent = [
        styleTextContent,
        styleTextRecipientList,
        styleTextDeliveryView,
        styleTextReloadButton,
        styleTextSocialMediaIcon,
        styleTextSubmitButton,
    ].join('\n')
    styleElement.textContent = textContent
    return styleElement
}
