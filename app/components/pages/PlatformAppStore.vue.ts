import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { UserService } from 'services/user';
import { Inject } from 'util/injector';
import { GuestApiService } from 'services/guest-api';
import { I18nService } from 'services/i18n';
import electron from 'electron';
import { PlatformAppsService, EAppPageSlot } from 'services/platform-apps';
import { PlatformAppStoreService } from 'services/platform-app-store';
import Utils from 'services/utils';

@Component({})
export default class PlatformAppStore extends Vue {
  @Inject() userService: UserService;
  @Inject() platformAppsService: PlatformAppsService;
  @Inject() platformAppStoreService: PlatformAppStoreService;
  @Inject() guestApiService: GuestApiService;
  @Inject() i18nService: I18nService;

  $refs: {
    appStoreWebview: Electron.WebviewTag;
  };

  mounted() {
    this.$refs.appStoreWebview.addEventListener('dom-ready', () => {
      if (Utils.isDevMode()) {
        this.$refs.appStoreWebview.openDevTools();
      }
      this.guestApiService.exposeApi(
        this.$refs.appStoreWebview.getWebContents().id,
        {
          reloadProductionApps: this.reloadProductionApps,
          openLinkInBrowser: this.openLinkInBrowser,
          onPaypalAuthSuccess: this.onPaypalAuthSuccessHandler
        }
      );
    });
  }

  async onPaypalAuthSuccessHandler(callback: Function) {
    this.platformAppStoreService.bindsPaypalSuccessCallback(callback);
  }

  async openLinkInBrowser(url: string) {
    electron.remote.shell.openExternal(url);
  }

  async reloadProductionApps() {
    this.platformAppsService.installProductionApps();
  }

  get loggedIn() {
    return this.userService.isLoggedIn();
  }

  get appStoreUrl() {
    return this.userService.appStoreUrl();
  }
}
