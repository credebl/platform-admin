import { LocaleProps } from '@/config/types'
import VerificationList from './VerificationList'
import Dashboard from './Dashboard'
// eslint-disable-next-line camelcase

const Page = ({ params: { locale } }: LocaleProps): React.JSX.Element => {

  return <div><Dashboard/></div>
}

export default Page
