import { BlockComponent } from '../BlockComponent/BlockComponent.js';
import { uploadFileDirect } from '../../common-utils/UploadClientLight.js';
import { resizeImage } from '../../common-utils/resizeImage.js';
import { ACT } from '../dictionary.js';

export class FileItem extends BlockComponent {
  constructor() {
    super();

    this.initLocalState({
      fileName: '',
      thumb: '',
      notImage: true,
      badgeIcon: 'check',
      'on.edit': () => {
        this.externalState.multiPub({
          modalCaption: 'Edit file',
          focusedEntry: this.entry,
          currentActivity: ACT.UPLOAD_DETAILS,
        });
      },
    });
  }

  set 'entry-id'(id) {
    /** @type {import('../../symbiote/core/TypedState.js').TypedState} */
    this.entry = this.collection?.read(id);

    this.entry.subscribe('uuid', (uuid) => {
      if (uuid) {
        this.setAttribute('loaded', '');
      }
    });

    this.entry.subscribe('fileName', (name) => {
      this.localState.pub('fileName', name || 'No name...');
    });

    this.file = this.entry.getValue('file');
    
    if (this.file?.type.includes('image')) {
      resizeImage(this.file, 76).then((img) => {
        this.ref.thumb.style.backgroundImage = `url(${img})`;
      });
    }
  }

  get 'entry-id'() {
    return this.entry.__ctxId;
  }

  initCallback() {
    this.addToExternalState({
      focusedEntry: null,
      uploadTrigger: null,
    });
    this.externalState.sub('uploadCollection', (collection) => {
      /** @type {import('../../symbiote/core/TypedCollection.js').TypedCollection} */
      this.collection = collection;
    });
    this.externalState.pub('uploadTrigger', null);
    FileItem.activeInstances.add(this);

    this.externalState.sub('uploadTrigger', (val) => {
      if (!val || !this.isConnected) {
        return;
      }
      this.upload();
    });
    this.onclick = () => {
      FileItem.activeInstances.forEach((inst) => {
        if (inst === this) {
          inst.setAttribute('focused', '');
        } else {
          inst.removeAttribute('focused');
        }
      });
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    FileItem.activeInstances.delete(this);
  }

  async upload() {
    if (this.hasAttribute('loaded') || this.entry.getValue('uuid')) {
      return;
    }
    this.ref.progress.style.width = '0';
    this.removeAttribute('focused');
    this.removeAttribute('error');
    this.setAttribute('uploading', '');
    await uploadFileDirect(this.file, this.externalState.read('pubkey'), async (info) => {
      if (info.type === 'progress') {
        this.ref.progress.style.width = info.progress + '%';
        this.entry.setValue('uploadProgress', info.progress);
      }
      if (info.type === 'success') {
        this.ref.progress.style.opacity = '0';
        this.setAttribute('loaded', '');
        this.removeAttribute('uploading');
        this.localState.pub('badgeIcon', 'check');
        this.entry.setValue('uuid', info.uuid);
        this.entry.setValue('uploadProgress', 100);
      }
      if (info.type === 'error') {
        this.setAttribute('error', '');
        this.removeAttribute('uploading');
        this.localState.multiPub({
          badgeIcon: 'upload-error',
        });
        this.externalState.pub('message', {
          caption: 'Upload error: ' + this.file.name,
          text: info.error,
          isError: true,
        });
        this.entry.setValue('uploadErrorMsg', info.error);
      }
    });
  }
}

FileItem.template = /*html*/ `
<div -thumb- ref="thumb"></div>
<div file-name loc="textContent: fileName"></div>
<div -badge->
  <icon-ui loc="@name: badgeIcon"></icon-ui>
</div>
<button -edit-btn- loc="onclick: on.edit;">
  <icon-ui name="edit-file"></icon-ui>
</button>
<div ref="progress" -progress-></div>
`;
FileItem.activeInstances = new Set();

FileItem.bindAttributes({
  'entry-id': ['property'],
});