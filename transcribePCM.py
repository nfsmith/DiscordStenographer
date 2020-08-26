import speech_recognition as sr
import wave
import sys
import os
import uuid

pcmfn = sys.argv[1]
wavefn = os.path.join(str(uuid.uuid4().hex))


with open(pcmfn, 'rb') as pcm:
    pcmdata = pcm.read()

with wave.open(wavefn, 'wb') as wavfile: #convert pcm to wav
    wavfile.setparams((2, 2, 48000, 0, 'NONE', 'NONE'))
    wavfile.writeframes(pcmdata)

try:
    r = sr.Recognizer()
    with sr.AudioFile(wavefn) as source:
        audio = r.record(source)
except:
    print('SR failed')


os.remove(wavefn)
try:
    print(r.recognize_google(audio))
except:
    print('!Unrecognizable')
