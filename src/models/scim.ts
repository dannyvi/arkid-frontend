import {AccessPermData, OAuthData, PermOwnerData, SamlData} from '@/models/oneid'

export interface ScimAppData {
    id: number
    uid: string
    name: string
    remark: string
    logo: string
    index: string
    oauth_app: OAuthData|null
    ldap_app?: object|null
    http_app?: object|null
    saml_app?: SamlData|null
    auth_protocols: string[]
    access_perm: AccessPermData
    refresh_url: string
    inteval: number
}

export class App {
    static fromData(data?: ScimAppData) {
        const obj = new this()
        if (!data) {
            return obj
        }
        obj.uid = data.uid
        obj.name = data.name
        obj.remark = data.remark
        obj.logo = data.logo
        obj.oauth_app = data.oauth_app
        obj.index = data.index
        obj.ldap_app = data.ldap_app
        obj.http_app = data.http_app
        obj.saml_app = data.saml_app
        obj.auth_protocols = data.auth_protocols
        obj.refresh_url = data.refresh_url
        obj.inteval = data.inteval
        if (data.access_perm) {
            obj.permit_owners = data.access_perm.permit_owners.results
            obj.reject_owners = data.access_perm.reject_owners.results
        }

        return obj
    }
    uid: string = ''
    name: string = ''
    remark: string = ''
    logo: string = ''
    index: string = ''
    oauth_app?: OAuthData|null = null
    ldap_app?: object|null = null
    http_app?: object|null = null
    saml_app?: SamlData|null = null
    auth_protocols: string[] = []
    permit_owners: PermOwnerData[] = []// 白名单
    reject_owners: PermOwnerData[] = []// 黑名单
}
