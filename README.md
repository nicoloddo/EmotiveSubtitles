# EmotiveSubtitles

This is a prototype of emotional subtitle transcription for deaf people and children with emotion recognition problems.

The valence of the speaker (how negative or positive the emotion is) is indicated by the color of the subtitle. The arousal, is indicated by how big the subtitle is.

Transcription and emotion predictions are done with Hume AI. I perform a simple dimensionality reduction in JavaScript to obtain Valence and Arousal. I do not store any data. Everything is sent to Hume AI or processed in your own browser locally. For now it supports only audio files, and under 1MB.

I did this small project in 2 days to try Hume AI API for emotion recognition. The idea of emotional subtitles is something that jumped in my mind while watching a movie some time ago!

The requests are passed through my proxy api on AWS because Hume does not allow CORS. I do not save any data though. If too much traffic is going through my API, it will shut down.

Finally, here's a link to use the project: [nicoloddo.github.io/EmotiveSubtitles/](https://nicoloddo.github.io/EmotiveSubtitles/)
