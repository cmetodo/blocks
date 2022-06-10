import { Block } from '../../abstract/Block.js';
import { uploadFileGroup } from '../../submodules/upload-client/upload-client.js';

/** @typedef {import('../../submodules/upload-client/upload-client.js').UploadcareFile[]} FileList} */

export class DataOutput extends Block {
  processInnerHtml = true;

  init$ = {
    output: null,
  };

  get dict() {
    return DataOutput.dict;
  }

  initCallback() {
    this.sub('output', (data) => {
      if (!data) {
        return;
      }
      this.value = data;

      if (this.hasAttribute(this.dict.FIRE_EVENT_ATTR)) {
        this.dispatchEvent(
          new CustomEvent(this.dict.EVENT_NAME, {
            bubbles: true,
            composed: true,
            detail: {
              timestamp: Date.now(),
              ctxName: this.ctxName,
              data,
            },
          })
        );
      }

      if (this.hasAttribute(this.dict.FORM_VALUE_ATTR)) {
        if (!this._input) {
          /** @private */
          this._input = document.createElement('input');
          this._input.type = 'text';
          this._input.hidden = true;
          this.appendChild(this._input);
        }
        this._input.value = JSON.stringify(data);
      }

      if (this.hasAttribute(this.dict.CONSOLE_ATTR)) {
        console.log(data);
      }
    });

    this.sub(this.dict.SRC_CTX_KEY, async (/** @type {FileList} */ data) => {
      if (!data) {
        this.$.output = null;
        return;
      }
      if (this.getCssData('--cfg-group-output') || this.hasAttribute(this.dict.GROUP_ATTR)) {
        let uuidList = data.map((fileDesc) => {
          return fileDesc.uuid;
        });
        let resp = await uploadFileGroup(uuidList, {
          ...this.getUploadClientOptions(),
        });
        this.$.output = {
          groupData: resp,
          files: data,
        };
      } else {
        this.$.output = data;
      }
    });
  }
}

/** @enum {Object<[x: string], string>} */
DataOutput.dict = {
  SRC_CTX_KEY: '*outputData',
  EVENT_NAME: 'lr-data-output',
  FIRE_EVENT_ATTR: 'use-event',
  CONSOLE_ATTR: 'use-console',
  GROUP_ATTR: 'use-group',
  FORM_VALUE_ATTR: 'form-value',
};
