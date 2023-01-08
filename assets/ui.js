(() => {

    const languages = [
        {
            code: "en",
            name: "English",
        },
        {
            code: "ru",
            name: "Russian (dev)",
        },
        {
            code: "bg",
            name: "Bulgarian",
        },
        {
            code: "cs",
            name: "Czech",
        },
        {
            code: "de",
            name: "German",
        },
        {
            code: "es",
            name: "Spanish",
        },
        {
            code: "et",
            name: "Estonian",
        },
        {
            code: "fa",
            name: "Farsi (dev)",
        },
        {
            code: "fr",
            name: "French",
        },
        // {
        //     code: "is",
        //     name: "Icelandic (dev)",
        // },
        {
            code: "it",
            name: "Italian",
        },
        // {
        //     code: "bn",
        //     name: "Norwegian Bokmål (dev)",
        // },
        // {
        //     code: "nn",
        //     name: "Norwegian Nynorsk (dev)",
        // },
        {
            code: "nl",
            name: "Dutch (dev)",
        },
        {
            code: "pl",
            name: "Polish",
        },
        {
            code: "pt",
            name: "Portugal",
        },
        // {
        //     code: "uk",
        //     name: "Ukrainian (dev)",
        // },
    ];

    ///////////////////////////////////////////////////////////////////////////

    Translator.ready().then(() => console.log('translator ready'));

    const translationTimeoutValue = 500;
    let translationTimeout = null;

    const langSrc = document.getElementById('lang-src');
    langSrc.addEventListener('change', () => {
        console.log('src language', langSrc.value);
        if (langSrc.value === langDest.value) {
            langSrc.value = '';
        }
        localStorage.localTranslatorSrc = langSrc.value;
        if (langSrc.value === '') {
            return;
        }
        toggleSpeakButtonsVisibility();
        toggleDictationButtonVisibility();
        translate();
    });

    const langDest = document.getElementById('lang-dest');
    langDest.addEventListener('change', () => {
        console.log('dest language', langDest.value);
        if (langDest.value === langSrc.value) {
            langDest.value = '';
        }
        localStorage.localTranslatorDest = langDest.value;
        if (langDest.value === '') {
            return;
        }
        toggleSpeakButtonsVisibility();
        toggleDictationButtonVisibility();
        translate();
    });

    loadLanguages(langSrc);
    loadLanguages(langDest);

    const textSrc = document.getElementById('text-src');
    textSrc.addEventListener('keyup', scheduleTranslation);
    textSrc.addEventListener('change', scheduleTranslation);
    textSrc.value = '';

    const textDest = document.getElementById('text-dest');
    textDest.value = '';

    const errorText = document.getElementById('error-text');
    const dictationPartialResult = document.getElementById('dictation-partial-result');

    let languageModalShow = false;
    const languageModalEl = document.getElementById('modal-load-language')
    const languageModal = new bootstrap.Modal(languageModalEl);
    languageModalEl.addEventListener('shown.bs.modal', () => {
        if (!languageModalShow) {
            languageModal.hide();
        }
    });
    languageModalEl.addEventListener('hidden.bs.modal', () => {
        if (languageModalShow) {
            languageModal.show();
        }
    });

    let dictationModalShow = false;
    const dictationModalEl = document.getElementById('modal-load-dictation');
    const dictationModal = new bootstrap.Modal(dictationModalEl);
    dictationModalEl.addEventListener('shown.bs.modal', () => {
        if (!dictationModalShow) {
            dictationModal.hide();
        }
    });
    dictationModalEl.addEventListener('hidden.bs.modal', () => {
        if (dictationModalShow) {
            dictationModal.show();
        }
    });

    const btnSpeakSrcWrapper = document.getElementById('btn-speak-src').parentElement;
    const voiceListSrc = document.getElementById('voice-list-src');
    const btnSpeakDestWrapper = document.getElementById('btn-speak-dest').parentElement;
    const voiceListDest = document.getElementById('voice-list-dest');

    const btnDictation = document.getElementById('btn-dictation');
    const btnDictationWrapper = btnDictation;
    btnDictation.addEventListener('click', dictationToggle);

    window.addEventListener('load', () => {
        langSrc.value = localStorage.localTranslatorSrc || '';
        langSrc.dispatchEvent(new Event('change'));

        langDest.value = localStorage.localTranslatorDest || '';
        langDest.dispatchEvent(new Event('change'));
    });

    ///////////////////////////////////////////////////////////////////////////

    function loadLanguages(el) {
        for (let lang of languages) {
            const option = document.createElement('option');
            option.value = lang.code;
            option.text = lang.name;
            el.appendChild(option);
        }
        el.value = '';
    }

    function languageLoadModal(show) {
        languageModalShow = show;
        if (show) {
            languageModal.show();
        } else {
            languageModal.hide();
        }
    }

    function dictationLoadModal(show) {
        dictationModalShow = show;
        if (show) {
            dictationModal.show();
        } else {
            dictationModal.hide();
        }
    }

    function getSrcText() {
        return textSrc.value;
    }

    function setSrcText(text) {
        textSrc.value = text;
    }

    function getDestText() {
        return textDest.value;
    }

    function setDestText(text) {
        if (!text) {
            textDest.value = '';
            return;
        }
        if (text instanceof String) {
            textDest.value = text;
        } else {
            textDest.value = text.join('\\n');
        }
    }

    function showErrorMessage(text) {
        errorText.innerText = text;
    }

    function showDictationPartialResult(text) {
        dictationPartialResult.innerText = text;
    }

    function scheduleTranslation() {
        if (translationTimeout) {
            clearTimeout(translationTimeout);
        }
        translationTimeout = setTimeout(translate, translationTimeoutValue);
    }

    function translate() {
        if (translationTimeout) {
            clearTimeout(translationTimeout);
            translationTimeout = null;
        }

        const src = langSrc.value;
        const dest = langDest.value;
        if (!src || !dest) {
            return;
        }

        if (!Translator.languagePairExists(src, dest)) {
            return;
        }

        if (!Translator.isLanguagePairInitialized(src, dest)) {
            languageLoadModal(true);
            Translator.languagePairInit(src, dest).then(() => {
                languageLoadModal(false);
                showErrorMessage(null);
                _translateImpl(src, dest);
            }).catch(error => {
                console.log('language init error', error);
                showErrorMessage(`Language initialization error: ${error.message}`);
                languageLoadModal(false);
            });
        } else {
            _translateImpl(src, dest);
        }
    }

    function _translateImpl(src, dest) {
        Translator.translate(src, dest, getSrcText().split('\\n'))
            .then(translated => {
                setDestText(translated);
                showErrorMessage(null);
            })
            .catch(error => {
                console.log('translation error', error);
                showErrorMessage(`Translation error: ${error.message}`);
            });
    }

    ///////////////////////////////////////////////////////////////////////////

    function toggleSpeakButtonsVisibility() {
        if (!TTS.prepared()) {
            TTS.ready();
        }

        if (TTS.voiceExists(langSrc.value)) {
            const voices = TTS.getVoices(langSrc.value);
            initializeVoiceList(voiceListSrc, voices, idx => TTS.speak(langSrc.value, idx, getSrcText()));
            btnSpeakSrcWrapper.classList.remove('d-none');
        } else {
            btnSpeakSrcWrapper.classList.add('d-none');
        }

        if (TTS.voiceExists(langDest.value)) {
            const voices = TTS.getVoices(langDest.value);
            initializeVoiceList(voiceListDest, voices, idx => TTS.speak(langDest.value, idx, getDestText()));
            btnSpeakDestWrapper.classList.remove('d-none');
        } else {
            btnSpeakDestWrapper.classList.add('d-none');
        }
    }

    function initializeVoiceList(el, voices, clickCallback) {
        el.innerHTML = '';

        for (let voiceIdx = 0; voiceIdx < voices.length; voiceIdx++) {
            const btn = document.createElement('button');
            btn.classList.add('dropdown-item');
            btn.type = 'button';
            btn.innerText = voices[voiceIdx].name;
            btn.addEventListener('click', () => clickCallback(voiceIdx));

            const li = document.createElement('li');
            li.appendChild(btn);

            el.appendChild(li);
        }
    }

    ///////////////////////////////////////////////////////////////////////////

    function toggleDictationButtonVisibility() {
        if (Dictation.modelAvailable(langSrc.value)) {
            btnDictationWrapper.classList.remove('d-none');
        } else {
            btnDictationWrapper.classList.add('d-none');
        }

        dictationStop();
    }

    function dictationToggle() {
        if (Dictation.recording()) {
            dictationStop();
        } else {
            dictationLoadModal(true);
            Dictation.start(langSrc.value)
                .then(recognizer => {
                    dictationLoadModal(false);

                    recognizer.on('result', result => {
                        const text = getSrcText();
                        setSrcText(text + " " + result.result.text);
                        translate();
                    });
                    recognizer.on('partialresult', result => {
                        showDictationPartialResult(result.result.partial);
                    });

                    btnDictation.classList.add('btn-primary');
                    btnDictation.classList.remove('btn-outline-primary');
                })
                .catch(error => {
                    dictationLoadModal(false);
                    console.log(`Dictation error: ${error.message}`);
                });
        }
    }

    function dictationStop() {
        Dictation.stop();
        btnDictation.classList.remove('btn-primary');
        btnDictation.classList.add('btn-outline-primary');
        showDictationPartialResult('');
    }

})();
