import os

for file in os.listdir(os.getcwd()):
    if file.endswith(".pcm"):
        os.remove(file)
