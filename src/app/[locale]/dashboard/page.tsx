import { LocaleProps } from '@/config/types'
import VerificationList from './VerificationList'
// eslint-disable-next-line camelcase
import { unstable_setRequestLocale } from 'next-intl/server'

const Page = ({ params: { locale } }: LocaleProps): React.JSX.Element => {
  unstable_setRequestLocale(locale)

  return <div>Dashboard</div>
}

export default Page