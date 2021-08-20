import { UploadWidget } from './UploadWidget.js'
import { ACT } from '../dictionary.js'

export class UploadWidgetBtn extends UploadWidget {}
UploadWidgetBtn.template = /*html*/ `
<upload-data hidden></upload-data>
<simple-btn></simple-btn>
<system-call></system-call>
<modal-win>
  <activity-mngr>
    <drop-area activity="${ACT.SOURCE_SELECT}">
      <source-btn type="local"></source-btn>
      <source-btn type="url"></source-btn>
      <source-btn type="camera"></source-btn>
      <source-btn type="facebook"></source-btn>
      <source-btn type="dropbox"></source-btn>
      <source-btn type="gdrive"></source-btn>
      <source-btn type="gphotos"></source-btn>
      <source-btn type="instagram"></source-btn>
      <source-btn type="flickr"></source-btn>
      <source-btn type="vk"></source-btn>
      <source-btn type="evernote"></source-btn>
      <source-btn type="box"></source-btn>
      <source-btn type="onedrive"></source-btn>
      <source-btn type="huddle"></source-btn>
      <source-btn type="other"></source-btn>
    </drop-area>
    <upload-list activity="${ACT.UPLOAD_LIST}"></upload-list>
    <camera-source activity="${ACT.CAMERA}"></camera-source>
    <url-source activity="${ACT.URL}"></url-source>
    <upload-details activity="${ACT.UPLOAD_DETAILS}"></upload-details>
    <confirmation-dialog activity="${ACT.COMFIRMATION}"></confirmation-dialog>
    <cloud-image-editor activity="${ACT.CLOUD_IMAGE_EDIT}"></cloud-image-editor>
    <external-source activity="${ACT.EXTERNAL_SOURCE}"></external-source>
  </activity-mngr>
</modal-win>
<message-box></message-box>
<progress-bar></progress-bar>
`
UploadWidgetBtn.reg('upload-widget-btn')
