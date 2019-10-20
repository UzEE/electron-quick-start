// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { desktopCapturer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  let srcObj = {};

  desktopCapturer.getSources({ types: ['window', 'screen'] })
    .then(async sources => {

      window.mSources = sources;

      for (let source of sources) {
        srcObj[source.id] = source.name;
      }

      setSelectOptions(srcObj);
      console.log(srcObj);

      showCapture(sources[0].id);
    });

  const select = document.getElementById('sourcesSelect');
  select.addEventListener('change', evt => {

    const target = evt.target;
    const selectedIndex = target.selectedIndex;
    const options = target.options;
    const selection = options[selectedIndex];

    console.log(selection.value);
    showCapture(selection.value);
  });
})

const setSelectOptions = (opts) => {
  const select = document.getElementById('sourcesSelect');

  for (let index in opts) {
    select.options[select.options.length] = new Option(opts[index], index);
  }
}

const showCapture = async id => {

  const video = document.getElementById('capture');

  try {

    const stream = await navigator.mediaDevices.getUserMedia({

      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: id,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        }
      }
    });

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', e => video.play());
  }

  catch (e) {
    console.error(e);
  }
}
