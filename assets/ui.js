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
        if (langSrc.value === '' || langSrc.value === langDest.value) {
            langSrc.value = '';
            return;
        }
        translate();
    });

    const langDest = document.getElementById('lang-dest');
    langDest.addEventListener('change', () => {
        console.log('dest language', langDest.value);
        if (langDest.value === '' || langDest.value === langSrc.value) {
            langDest.value = '';
            return
        }
        translate();
    });

    loadLanguages(langSrc);
    loadLanguages(langDest);

    const textSrc = document.getElementById('text-src');
    textSrc.addEventListener('keyup', () => {
        if (translationTimeout) {
            clearTimeout(translationTimeout);
        }
        translationTimeout = setTimeout(translate, translationTimeoutValue);
    });

    const textDest = document.getElementById('text-dest');
    const errorText = document.getElementById('error-text');

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

    ///////////////////////////////////////////////////////////////////////////

    function getLanguageCode(el) {
        return el.value;
    }

    function loadLanguages(el) {
        for (let lang of languages) {
            const option = document.createElement('option');
            option.value = lang.code;
            option.text = lang.name;
            el.appendChild(option);
        }
    }

    function languageLoadModal(show) {
        languageModalShow = show;
        if (show) {
            languageModal.show();
        } else {
            languageModal.hide();
        }
    }

    function getSrcText() {
        return textSrc.value;
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

})();
