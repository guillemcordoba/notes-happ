import { GroupInvitesContext } from "./lobby/group-invites/elements/group-invites-context.js";
import "./lobby/group-invites/elements/group-invites-context.js";

import { ActionHash, AppClient, AppWebsocket, decodeHashFromBase64, encodeHashToBase64 } from "@holochain/client";
import { ResizeController } from "@lit-labs/observers/resize-controller.js";
import { provide } from "@lit/context";
import { localized, msg } from "@lit/localize";
import { mdiArrowLeft } from "@mdi/js";
import { hashState, Router, wrapPathInSvg } from "@tnesh-stack/elements";
import { SignalWatcher } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@tnesh-stack/elements/dist/elements/display-error.js";
import "@tnesh-stack/elements/dist/elements/app-client-context.js";
// TODO: uncomment this if you choose the profiles-zome as your profiles provider
// import '@darksoil-studio/profiles-zome/dist/elements/profile-prompt.js';
import "@darksoil-studio/profiles-provider/dist/elements/my-profile.js";

import { appStyles } from "./app-styles.js";
import { isMobileContext } from "./context.js";
import "./home-page.js";
import "./overlay-page.js";
import '@darksoil-studio/friends-zome/dist/elements/friends-context.js';
import '@darksoil-studio/file-storage-zome/dist/elements/file-storage-context.js';

export const MOBILE_WIDTH_PX = 600;

@localized()
@customElement("holochain-app")
export class HolochainApp extends SignalWatcher(LitElement) {
  @state()
  _loading = true;
  @state()
  _view = { view: "main" };
  @state()
  _error: unknown | undefined;

  _client!: AppClient;

  router = new Router(this, [
    {
      path: "/",
      enter: () => {
        // Redirect to "/home/"
        this.router.goto("/home/");
        return false;
      },
    },
    {
      path: "/home/*",
      render: () =>
        html`<home-page
          @profile-clicked=${() => this.router.goto("/my-profile")}
        ></home-page>`,
    },
    {
      path: "/my-profile",
      render: () =>
        html`<overlay-page
          .title=${msg("My Profile")}
          icon="back"
          @close-requested=${() => this.router.goto("/home/")}
        >
          <sl-card>
            <my-profile style="flex: 1"></my-profile>
          </sl-card>
        </overlay-page>`,
    },
  ]);

  @provide({ context: isMobileContext })
  @property()
  _isMobile: boolean = false;

  async firstUpdated() {
    new ResizeController(this, {
      callback: () => {
        this._isMobile = this.getBoundingClientRect().width < MOBILE_WIDTH_PX;
      },
    });

    try {
      this._client = await AppWebsocket.connect();
    } catch (e: unknown) {
      this._error = e;
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this._loading) {
      return html`<div
        class="row"
        style="flex: 1; height: 100%; align-items: center; justify-content: center;"
      >
        <sl-spinner style="font-size: 2rem"></sl-spinner>
      </div>`;
    }

    if (this._error) {
      return html`
        <div style="flex: 1; height: 100%; align-items: center; justify-content: center;">
          <display-error .error=${this._error} .headline=${msg("Error connecting to holochain")}>
          </display-error>
        </div>
      `;
    }

    return html`
      <app-client-context .client=${this._client}>
        <file-storage-context role="group">
          <friends-context role="lobby">
          <group-invites-context role="lobby">
            <profile-prompt style="flex: 1;">
              ${this.router.outlet()}
            </profile-prompt>
          </group-invites-context>
    </friends-context>
        </file-storage-context>
      </app-client-context>
    `;
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex: 1;
      }
    `,
    ...appStyles,
  ];
}
