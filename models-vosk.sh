#!/bin/bash

cd assets/vosk

mkdir models
cd models

wget -O en.zip https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
wget -O ru.zip https://alphacephei.com/vosk/models/vosk-model-small-ru-0.22.zip
wget -O fr.zip https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip
wget -O de.zip https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
wget -O es.zip https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip
wget -O pt.zip https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip
wget -O it.zip https://alphacephei.com/vosk/models/vosk-model-small-it-0.22.zip
wget -O nl.zip https://alphacephei.com/vosk/models/vosk-model-small-nl-0.22.zip
wget -O fa.zip https://alphacephei.com/vosk/models/vosk-model-small-fa-0.4.zip
wget -O uk.zip https://alphacephei.com/vosk/models/vosk-model-small-uk-v3-nano.zip
wget -O cs.zip https://alphacephei.com/vosk/models/vosk-model-small-cs-0.4-rhasspy.zip
wget -O pl.zip https://alphacephei.com/vosk/models/vosk-model-small-pl-0.22.zip
