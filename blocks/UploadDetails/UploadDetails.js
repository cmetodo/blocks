import { Block } from '../../abstract/Block.js';
import { fileCssBg } from '../svg-backgrounds/svg-backgrounds.js';

/**
 * @typedef {{
 *   checkerboard: Boolean;
 *   fileSize: String;
 *   fileName: String;
 *   cdnUrl: String;
 *   errorTxt: String;
 *   cloudEditBtnHidden: Boolean;
 *   onNameInput: () => void;
 *   onBack: () => void;
 *   onRemove: () => void;
 *   onCloudEdit: () => void;
 * }} State
 */

/** @extends {Block<State & Partial<import('../ActivityCaption/ActivityCaption').State>>} */
export class UploadDetails extends Block {
  activityType = Block.activities.DETAILS;

  pauseRender = true;

  /** @type {State} */
  init$ = {
    checkerboard: false,
    fileSize: null,
    fileName: '',
    cdnUrl: '',
    errorTxt: '',
    cloudEditBtnHidden: true,
    onNameInput: null,
    onBack: () => {
      this.historyBack();
    },
    onRemove: () => {
      /** @type {File[]} */
      this.uploadCollection.remove(this.entry.uid);
      this.historyBack();
    },
    onCloudEdit: () => {
      if (this.entry.getValue('uuid')) {
        this.$['*currentActivity'] = Block.activities.CLOUD_IMG_EDIT;
      }
    },
  };

  showNonImageThumb() {
    let color = window.getComputedStyle(this).getPropertyValue('--clr-generic-file-icon');
    let url = fileCssBg(color, 108, 108);
    this.eCanvas.setImageUrl(url);
    this.set$({
      checkerboard: false,
    });
  }

  initCallback() {
    this.bindCssData('--cfg-use-local-image-editor');
    this.bindCssData('--cfg-use-cloud-image-editor');
    // Rendering is postponed for the CSS-context-properties usage in template:
    this.render();
    this.$.fileSize = this.l10n('file-size-unknown');
    this.registerActivity(this.activityType, () => {
      this.set$({
        '*activityCaption': this.l10n('caption-edit-file'),
      });
    });
    /** @type {import('../EditableCanvas/EditableCanvas.js').EditableCanvas} */
    // @ts-ignore
    this.eCanvas = this.ref.canvas;
    this.sub('*focusedEntry', (/** @type {import('../../submodules/symbiote/core/symbiote.js').TypedData} */ entry) => {
      if (!entry) {
        return;
      }
      if (this._entrySubs) {
        this._entrySubs.forEach((sub) => {
          this._entrySubs.delete(sub);
          sub.remove();
        });
      } else {
        /** @private */
        this._entrySubs = new Set();
      }
      this.entry = entry;
      /** @type {File} */
      let file = entry.getValue('file');
      this.eCanvas.clear();
      if (file) {
        /**
         * @private
         * @type {File}
         */
        this._file = file;
        let isImage = this._file.type.includes('image');
        if (isImage && !entry.getValue('cdnUrl')) {
          this.eCanvas.setImageFile(this._file);
          this.set$({
            checkerboard: true,
          });
        }
        if (!isImage) {
          this.showNonImageThumb();
        }
      }
      let tmpSub = (prop, callback) => {
        this._entrySubs.add(this.entry.subscribe(prop, callback));
      };
      tmpSub('fileName', (name) => {
        this.$.fileName = name;
        this.$.onNameInput = () => {
          let value = this.ref.file_name_input['value'];
          Object.defineProperty(this._file, 'name', {
            writable: true,
            value: value,
          });
          this.entry.setValue('fileName', value);
        };
      });
      tmpSub('fileSize', (size) => {
        this.$.fileSize = Number.isFinite(size) ? this.fileSizeFmt(size) : this.l10n('file-size-unknown');
      });
      tmpSub('uuid', (uuid) => {
        if (uuid) {
          this.eCanvas.clear();
          this.set$({
            cdnUrl: `https://ucarecdn.com/${uuid}/`,
            cloudEditBtnHidden: !this.entry.getValue('isImage') || !this.$['*--cfg-use-cloud-image-editor'],
          });
          this.entry.getValue('isImage') && this.eCanvas.setImageUrl(this.$.cdnUrl);
        } else {
          this.$.cdnUrl = '';
        }
      });
      tmpSub('uploadError', (error) => {
        this.$.errorTxt = error?.message;
      });

      tmpSub('externalUrl', (url) => {
        if (!url) {
          return;
        }
        if (!this.entry.getValue('uuid')) {
          this.showNonImageThumb();
        }
      });
      tmpSub('cdnUrl', (url) => {
        if (!url) {
          return;
        }
        if (this.entry.getValue('isImage')) {
          this.eCanvas.setImageUrl(url);
        }
      });
    });
  }
}

UploadDetails.template = /*html*/ `
<lr-tabs
  tab-list="tab-view, tab-details">

  <div
    tab-ctx="tab-details"
    class="details">

    <div class="info-block">
      <div class="info-block_name" l10n="file-name"></div>
      <input
        name="name-input"
        ref="file_name_input"
        set="value: fileName; oninput: onNameInput; @disabled: !!cdnUrl"
        type="text" />
    </div>

    <div class="info-block">
      <div class="info-block_name" l10n="file-size"></div>
      <div>{{fileSize}}</div>
    </div>

    <div class="info-block">
      <div class="info-block_name" l10n="cdn-url"></div>
      <a
        class="cdn-link"
        target="_blank"
        set="@href: cdnUrl; @disabled: !cdnUrl">{{cdnUrl}}</a>
    </div>

    <div>{{errorTxt}}</div>

  </div>

  <lr-editable-canvas
    tab-ctx="tab-view"
    set="@disabled: !*--cfg-use-local-image-editor; @checkerboard: checkerboard;"
    ref="canvas">
  </lr-editable-canvas>
</lr-tabs>

<div class="toolbar" set="@edit-disabled: cloudEditBtnHidden">
  <button
    class="edit-btn secondary-btn"
    set="onclick: onCloudEdit; @hidden: cloudEditBtnHidden;">
    <lr-icon name="edit"></lr-icon>
    <span l10n="edit-image"></span>
  </button>
  <button
    class="remove-btn secondary-btn"
    set="onclick: onRemove">
    <lr-icon name="remove"></lr-icon>
    <span l10n="remove-from-list"></span>
  </button>
  <div></div>
  <button
    class="back-btn primary-btn"
    set="onclick: onBack">
    <span l10n="ok"></span>
  </button>
</div>
`;
