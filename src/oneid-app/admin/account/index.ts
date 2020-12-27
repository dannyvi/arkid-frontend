import Perm from '../group/perm/Perm'
import Account from './Account'
import Provision from './Provision'
import Settings from './Settings'
import ThirdParty from './ThirdParty'

export const routes = [
  {path: '/admin/account', name: 'admin.account', component: Account},
  {path: '/admin/account/perm', name: 'admin.account.perm', component: Perm},
  {path: '/admin/account/settings', name: 'admin.account.settings', component: Settings},
  {path: '/admin/account/thirdparty', name: 'admin.account.thirdparty', component: ThirdParty},
  {path: '/admin/account/provision', name: 'admin.account.provision', component: Provision},
].map((c) => ({...c, meta: {title: '账号管理', matchNav: 'admin.account'}}))
