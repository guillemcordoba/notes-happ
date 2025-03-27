import { ActionHash, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit/context";
import { hashProperty } from "@tnesh-stack/elements";
import { SignalWatcher } from "@tnesh-stack/signals";
import { EntryRecord } from "@tnesh-stack/utils";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { localized, msg } from "@lit/localize";

import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@tnesh-stack/elements/dist/elements/display-error.js";
import "@darksoil-studio/file-storage-zome/dist/elements/show-image.js";

import { appStyles } from "../../../app-styles.js";
import { notesStoreContext } from "../context.js";
import { NotesStore } from "../notes-store.js";
import { Note } from "../types.js";

/**
 * @element note-summary
 * @fires note-selected: detail will contain { noteHash }
 */
@localized()
@customElement("note-summary")
export class NoteSummary extends SignalWatcher(LitElement) {
  /**
   * REQUIRED. The hash of the Note to show
   */
  @property(hashProperty("note-hash"))
  noteHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: notesStoreContext, subscribe: true })
  notesStore!: NotesStore;

  renderSummary(entryRecord: EntryRecord<Note>) {
    return html`
      <div class="column" style="gap: 16px; flex: 1;">

        <div class="column" style="gap: 8px">
          <span><strong>${msg("Title")}</strong></span>
          <span style="white-space: pre-line">${entryRecord.entry.title}</span>
        </div>

        <div class="column" style="gap: 8px">
          <span><strong>${msg("Content")}</strong></span>
          <span style="white-space: pre-line">${entryRecord.entry.content}</span>
        </div>

        <div class="column" style="gap: 8px">
          <span><strong>${msg("Image Hash")}</strong></span>
          <span style="white-space: pre-line"><show-image .imageHash=${entryRecord.entry.image_hash} style="width: 300px; height: 200px"></show-image></span>
        </div>

      </div>
    `;
  }

  renderNote() {
    const note = this.notesStore.notes.get(this.noteHash).latestVersion.get();

    switch (note.status) {
      case "pending":
        return html`<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case "error":
        return html`<display-error
          .headline=${msg("Error fetching the note")}
          .error=${note.error}
        ></display-error>`;
      case "completed":
        return this.renderSummary(note.value);
    }
  }

  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() =>
      this.dispatchEvent(
        new CustomEvent("note-selected", {
          composed: true,
          bubbles: true,
          detail: {
            noteHash: this.noteHash,
          },
        }),
      )}>
      ${this.renderNote()}
    </sl-card>`;
  }

  static styles = [
    appStyles,
    css`
    :host {
      display: flex;
    }
  `,
  ];
}
