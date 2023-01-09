(() => {

    let voices = {};
    let pitch = 1;
    let rate = 0.75;
    let volume = 1;
    let utterance = null;

    function init() {
        if (typeof speechSynthesis === 'undefined') {
            console.log('no speech synthesis');
            return;
        }

        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        loadVoices();
    }

    function loadVoices() {
        voices = {};
        for (let voice of speechSynthesis.getVoices()) {
            if (!voice.localService) {
                continue;
            }
            const lang = voice.lang.substring(0, 2);
            if (!voices[lang]) {
                voices[lang] = [];
            }
            voices[lang].push(voice);
        }
    }

    function voiceExists(lang) {
        return !!voices[lang];
    }

    function speak(lang, variant, text) {
        if (window.speechSynthesis.speaking) {
            stop();
        }
        if (!voiceExists(lang) || voices[lang].length <= variant) {
            return;
        }
        console.log('TTS', lang, variant);
        utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.volume = volume;
        utterance.voice = voices[lang][variant];
        utterance.lang = voices[lang][variant].lang;
        utterance.text = text;
        window.speechSynthesis.speak(utterance);
    }

    function stop() {
        window.speechSynthesis.cancel();
        utterance = null;
    }

    window.TTS = {
        init,
        voiceExists,
        speak,
        stop,

        setPitch(value) {
            pitch = value;
            if (utterance) {
                utterance.pitch = value;
            }
        },

        setRate(value) {
            rate = value;
            if (utterance) {
                utterance.rate = value;
            }
        },

        setVolume(value) {
            volume = value;
            if (utterance) {
                utterance.volume = value;
            }
        },

        getVoices(lang) {
            return voices[lang];
        },
    };

})();
