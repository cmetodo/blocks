import { LiveHtmlElement } from '../../live-html-element/live-html-element.js';

const LIVE_HTML_TAG = 'live-html';
LiveHtmlElement.reg(LIVE_HTML_TAG);

let target = document.location.search.replace('?', '');

if (target) {
  window.onload = () => {
    let liveEl = document.querySelector(LIVE_HTML_TAG);
    liveEl.setAttribute('src', target);
  };
}