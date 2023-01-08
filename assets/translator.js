(() => {
    const languages = {};
    const pivotLanguage = 'en';

    let translatorInitializing = false;
    let translatorReady = false;
    let translatorReadyCallbacks = [];

    let initializedLanguagePair = null;
    const requestedLanguagePairs = {};
    let initializationCallbacks = {};

    let translationQueue = [];
    let translationQueueCurrent = null;

    ///////////////////////////////////////////////////////////////////////////

    const worker = new Worker("assets/bergamot/worker.js");

    worker.onmessage = function (e) {
        if (e.data[0] === "translate_reply") {
            _translationDone(e.data[1]);
        } else if (e.data[0] === "load_model_reply" && e.data[1]) {
            _loadDone(`${e.data[2]}${e.data[3]}`);
        } else if (e.data[0] === "import_reply" && e.data[1]) {
            _importDone(e.data[1]);
        }
    };

    function _importDone(languages) {
        prepareLanguages(languages);
        translatorReady = true;
        translatorInitializing = false;
        translatorReadyCallbacks.forEach(callback => callback());
        translatorReadyCallbacks = [];
    }

    function _loadDone(pair) {
        initializedLanguagePair = pair;

        if (initializationCallbacks[pair]) {
            initializationCallbacks[pair].forEach(callback => callback());
        }
        delete initializationCallbacks[pair];
        delete requestedLanguagePairs[pair];
    }

    function _translationDone(lines) {
        if (translationQueueCurrent !== null && translationQueueCurrent.callback) {
            translationQueueCurrent.callback(lines);
        }
        translationQueueCurrent = null;
        translationQueueNext();
    }

    ///////////////////////////////////////////////////////////////////////////

    function prepareLanguages(registry) {
        for (let pair in registry) {
            if (!registry.hasOwnProperty(pair)) continue;
            const from = pair.substring(0, 2);
            const to = pair.substring(2);
            languages[pair] = {from, to};
        }
    }

    function ready() {
        return new Promise(resolve => {
            if (translatorReady) {
                resolve();
                return;
            }
            translatorReadyCallbacks.push(resolve);
            if (!translatorInitializing) {
                translatorInitializing = true;
                worker.postMessage(["import"]);
            }
        });
    }

    function languagePairExists(from, to) {
        if (from === to) {
            return false;
        }

        const rawPair = `${from}${to}`;
        if (languages[rawPair]) {
            return true;
        }

        const pivot1 = `${from}${pivotLanguage}`
        const pivot2 = `${pivotLanguage}${to}`;
        return !!(languages[pivot1] && languages[pivot2]);
    }

    function languagePairInit(from, to) {
        return new Promise((resolve, error) => {
            ready().then(() => {
                if (!languagePairExists(from, to)) {
                    error('language pair does not exist');
                    return;
                }

                const pair = `${from}${to}`;

                if (initializedLanguagePair === pair) {
                    resolve();
                    return;
                }

                if (!initializationCallbacks[pair]) {
                    initializationCallbacks[pair] = [];
                }

                initializationCallbacks[pair].push(resolve);

                if (!requestedLanguagePairs[pair]) {
                    requestedLanguagePairs[pair] = true;
                    worker.postMessage(["load_model", from, to]);
                }
            }).catch(error);
        });
    }

    function translate(from, to, textLines, options) {
        return new Promise((resolve, error) => {
            ready().then(() => {
                languagePairInit(from, to).then(() => {
                    const translateOptions = [{
                        isHtml: options && !!options.isHtml,
                        isQualityScores: options && !!options.isQualityScores,
                    }];
                    translationQueue.push({
                        from,
                        to,
                        text: textLines,
                        options: translateOptions,
                        callback: resolve,
                    });
                    translationQueueNext();
                }).catch(error);
            }).catch(error);
        });
    }

    function translationQueueNext() {
        if (translationQueue.length === 0) {
            return;
        }
        if (translationQueueCurrent !== null) {
            return;
        }
        translationQueueCurrent = translationQueue.splice(0, 1)[0];
        worker.postMessage([
            "translate",
            translationQueueCurrent.from,
            translationQueueCurrent.to,
            translationQueueCurrent.text,
            translationQueueCurrent.options
        ]);
    }

    ///////////////////////////////////////////////////////////////////////////

    window.Translator = {
        isReady() {
            return translatorReady;
        },
        isLanguagePairInitialized(from, to) {
            const pair = `${from}${to}`;
            return initializedLanguagePair === pair;
        },

        ready,
        languagePairExists,
        languagePairInit,
        translate,
    };
})();
