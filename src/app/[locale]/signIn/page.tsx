import { LocaleProps } from '@/config/types'
import SignInRedirect from '@/components/signInRedirect'
// eslint-disable-next-line camelcase
import { setRequestLocale } from 'next-intl/server'

const Page = ({ params: { locale } }: LocaleProps): React.JSX.Element => {
  setRequestLocale(locale)
  
  return <SignInRedirect />
}
export default Page