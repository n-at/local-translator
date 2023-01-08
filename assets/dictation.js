(() => {

    const AudioChannelCount = 1;
    const AudioSampleRate = 16000;

    const modelsAvailable = {
        cs: true,
        de: true,
        en: true,
        fa: true,
        fr: true,
        it: true,
        nl: true,
        pl: true,
        pt: true,
        ru: true,
        uk: true,
    };

    let dictationMediaStream = null;
    let dictationAudioContext = null;
    let dictationModel = null;
    let dictationRecognizer = null;
    let channel = null;

    ///////////////////////////////////////////////////////////////////////////

    function getMediaStream() {
        return navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                channelCount: AudioChannelCount,
                sampleRate: AudioSampleRate,
            },
        });
    }

    function mediaStreamStop(mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }

    ///////////////////////////////////////////////////////////////////////////

    function loadModel(lang) {
        return new Promise((resolve, reject) => {
            const modelUrl = `assets/vosk/models/${lang}.zip`;
            Vosk.createModel(modelUrl).then(resolve).catch(reject);
        });
    }

    function start(lang) {
        if (dictationMediaStream !== null || dictationModel !== null || dictationRecognizer !== null) {
            stop();
        }
        return new Promise((resolve, reject) => {
            loadModel(lang)
                .then(model => {
                    getMediaStream()
                        .then(stream => {
                            dictationMediaStream = stream;
                            dictationModel = model;

                            channel = new MessageChannel();
                            dictationModel.registerPort(channel.port1);

                            dictationRecognizer = new model.KaldiRecognizer(AudioSampleRate);
                            dictationRecognizer.setWords(false);

                            dictationAudioContext = new AudioContext();
                            dictationAudioContext.audioWorklet.addModule('assets/vosk/recognizer-processor.js')
                                .then(() => {
                                    const recognizerProcessor = new AudioWorkletNode(dictationAudioContext, 'recognizer-processor', { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 });
                                    recognizerProcessor.port.postMessage({
                                        action: 'init',
                                        recognizerId: dictationRecognizer.id
                                    }, [ channel.port2 ]);
                                    recognizerProcessor.connect(dictationAudioContext.destination);

                                    const source = dictationAudioContext.createMediaStreamSource(dictationMediaStream);
                                    source.connect(recognizerProcessor);

                                    resolve(dictationRecognizer);
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    function stop() {
        if (dictationMediaStream !== null) {
            mediaStreamStop(dictationMediaStream);
            dictationMediaStream = null;
        }
        if (dictationAudioContext !== null) {
            dictationAudioContext.close();
            dictationAudioContext = null;
        }
        if (dictationRecognizer !== null) {
            dictationRecognizer.remove();
            dictationRecognizer = null;
        }
        if (dictationModel !== null) {
            dictationModel.terminate();
            dictationModel = null;
        }
    }

    ///////////////////////////////////////////////////////////////////////////

    window.Dictation = {
        modelAvailable(lang) {
            return !!modelsAvailable[lang];
        },

        start,
        stop,

        recording() {
            return dictationMediaStream !== null;
        },
    };

})();
