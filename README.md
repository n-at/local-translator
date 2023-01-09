# local translator

Translation web application with support of dictation. 
Works 100% on-device.

## Build

Required:

* nodejs + npm
* git + git-lfs

```bash
#install dependencies
npm install

#download bergamot models
./models-bergamot.sh

#download vosk models
./models-vosk.sh
```

## docker

Dockerfile available in the repository: https://github.com/n-at/dockerfiles/blob/master/local-translator/Dockerfile

## Uses

* [Bootstrap 5](https://github.com/twbs/bootstrap) - MIT
* [Bootstrap Icons](https://github.com/twbs/icons) - MIT
* [SpinKit](https://github.com/tobiasahlin/SpinKit) - MIT
* [Bergamot Translator](https://github.com/browsermt/bergamot-translator) - MPL-2.0
* [vosk-browser](https://github.com/ccoreilly/vosk-browser) - Apache-2.0
* [Vosk models](https://alphacephei.com/vosk/models) - Apache-2.0
* [wasm-feature-detect](https://github.com/GoogleChromeLabs/wasm-feature-detect) - Apache-2.0
