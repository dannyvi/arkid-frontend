import {http} from '@/services/base'

export class ScimApp {
    static url({detail = false, id, action}: {detail?: boolean; id?: string; action?: string;} = {}) {
        let url = '/siteapi/oneid/scim'
        if (detail) {
            url += `/${id}`
        }
        if (action) {
            url += `/${action}`
        }

        return `${url}/`
    }

    static async list(
        params?: {
            keyword: string,
            pageSize?: number;
            page?: number;
            nodeId?: string,
            username?: string,
            ownerAccess?: boolean,
        },
    ) {
        const data = params ? {params: {
                name: params.keyword,
                node_uid: params.nodeId,
                user_uid: params.username,
                page: params.page || 1,
                page_size: params.pageSize || 10,
                owner_access: params.ownerAccess,
            }} : {}
        const resp = await http.get(this.url(), data)
        return resp.data
    }
    static async fetch(id: string) {
        return http.get(this.url({detail: true, id})).then(x => x.data)
    }
    static async create(data) {
        return http.post(this.url(), data).then(x => x.data)
    }
    static async partialUpdate(id: string, data) {
        return http.patch(this.url({detail: true, id}), data).then(x => x.data)
    }
    static async remove(id: string) {
        return http.delete(this.url({detail: true, id})).then(x => x.data)
    }
    static async doSync(id: string) {
        return http.get(this.url({detail: true, id, action: 'doSync' })).then(x => x.data)
    }
}