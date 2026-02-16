import { LocaleProps } from '@/config/types'
import SignUp from './SignUp'
// eslint-disable-next-line camelcase
import { unstable_setRequestLocale } from 'next-intl/server'

const Page = ({ params: { locale } }: LocaleProps): React.JSX.Element => {
  unstable_setRequestLocale(locale)

  return <SignUp></SignUp>
}

export default Page