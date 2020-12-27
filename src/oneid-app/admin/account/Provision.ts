import * as model from '@/models/scim'
import * as api from '@/services/scim'
import {Component, Vue, Watch} from 'vue-property-decorator'
import './Provision.less'

@Component({
    template: html`
  <div class="ui-account-thirdparty-page">
    <div class="ui-account-thirdparty-page-wrapper">
      <div class="ui-account-thirdparty-page-subtitle">
        <h5>添加应用</h5>
      </div>
      <div class="ui-account-thirdparty-page-content">
        <div class="third-party-list-wrapper">
          <ul class="third-party-list">
            <li v-for="item in apps"
              :key="item.name"
              :class="item.name === activeName ? 'active' : ''"
              @click="activeName = item.name; currentApp = item"
            >
              <span>
                <Icon :type="item.icon" color="#006064" size="22" class="icon"></Icon>
                <span class="name">{{ item.name }}</span>
<!--                 <span :class="'status status-' + item.status"></span> -->
              </span>
              <!-- <span class="action action-activate" v-if="item.status === 'no'">激活</span>
              <span class="action action-deactivate" v-else>取消激活</span> -->
            </li>
          </ul>
        </div>
        <div class="form-wrapper" v-if="form && fields">
          <div class="upbtns">
            <Button type="primary" @click="doSync" :loading="isSaveLoading" class="submit-btn">手动同步</Button>
          </div>
          <Form :model="form" class="form">
            <FormItem v-for="item in fields"
              :key="item.key"
              :prop="item.key"
              :label="item.label"
              :labelWidth="158"
            >
              <Input :value="Array.from({length: 32}, () => 'x').join()" v-if="item.key === 'appSecret'"
                type="password"
                @on-focus="(e) => {e.target.value = form[item.key];e.target.type = 'text'}"
                @on-blur="(e) => form[item.key] = e.target.value"
              />
              <Input v-model="form[item.key]" v-else/>
            </FormItem>
          </Form>
          <div class="upbtns">
            <span>每5分钟同步更新</span>
          </div>
          <div class="btns">
            <Button type="primary" @click="doSave" :loading="isSaveLoading" class="submit-btn">保存配置</Button>
          </div>
        </div>
        <div class="no-data" v-else>
          <XIcon name="account-synchronization" class="no-data-icon"/>
          <span class="no-data-info">账号同步</span>
          <span class="no-data-help">账号同步可以让您与主流企业管理平台进行信息同步，减少操作成本，从而提升效率</span>
        </div>
      </div>
    </div>
  </div>
  `,
})
export default class Provision extends Vue {
    apps: model.ScimAppData[] | null = null

    activeName: string | null = null
    currentApp: model.ScimAppData | null = null
    data: Array<{
        icon: string;
        name: string;
        status: 'no' | 'ok';
    }> = [
        {icon: 'logo-github', name: 'APP', status: 'no'},
    ]

    form: any | null = null
    fields: Array<{ key: string, label: string }> | null = null
    isSaveLoading = false

    taskId: string = ''
    interval: any | null = null
    isImporting = false

    @Watch('activeName')
    onActiveNameChange(val: string) {
        console.log('activeName', val)
        if (val) {
            this.initForm()
        }
        this.form = null
    }

    async loadApps() {
        this.apps = await api.ScimApp.list()
        console.log('get config', this.apps)
    }

    initForm() {
        console.log('init form', this.activeName)
        if (this.activeName!) {
            const fields = [
                {key: 'refresh_url', label: '接口入口'},
                // {key: 'appSecret', label: 'appSecret'},
                // {key: 'corpId', label: 'corpId'},
                // {key: 'corpSecret', label: 'corpSecret'},
            ]
            const app = this.currentApp as model.ScimAppData
            const form = {
                refresh_url: app.refresh_url,// ding.appKey,
                // appSecret: '',
                // corpId: ding.corpId,
                // corpSecret: ding.corpSecret,
            }

            this.$nextTick(() => {
                this.fields = fields
                this.form = form
            })
        }
    }

    async doSave() {
        const {currentApp} = this
        currentApp!.refresh_url = this.form.refresh_url

        this.$Loading.start()
        try {
            await api.ScimApp.partialUpdate(currentApp!.id.toString(), currentApp)
            this.$Loading.finish()
        } catch (e) {
            console.log(e)
            this.$Loading.error()
        }
    }

    async doSync() {
        const {currentApp} = this
        currentApp!.refresh_url = this.form.refresh_url

        this.$Loading.start()
        try {
            const result = await api.ScimApp.doSync(currentApp!.id.toString())
            this.$Message.success('同步成功')
            this.$Loading.finish()
        } catch (e) {
            console.log(e)
            this.$Loading.error()
        }
    }

    // async doImport() {
    //     this.$Loading.start();
    //     try {
    //         const {task_id: taskId} = await api.Config.importDing();
    //         this.taskId = taskId;
    //         this.pollImportResult();
    //
    //         this.$Loading.finish();
    //     } catch (e) {
    //         this.$Loading.error();
    //     }
    // }

    // pollImportResult() {
    //     this.isImporting = true;
    //     this.interval = setInterval(this.importResult, 2000);
    // }
    //
    // async importResult() {
    //     try {
    //         const {status} = await api.Config.importResult(this.taskId);
    //         this.onImportResult(status);
    //     } catch (e) {
    //         console.log('polling');
    //     }
    // }

    onImportResult(status: number) {
        if (status === 1 || status === 2) {
            return
        }

        clearInterval(this.interval)
        this.interval = null
        this.isImporting = false

        if (status === 3) {
            this.$Message.error('同步失败')
        }
        if (status === 4) {
            this.$Message.success('同步成功')
        }
    }

    mounted() {
        this.loadApps()
    }
}
