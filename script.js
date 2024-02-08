document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const apiKey = document.getElementById('apiKey').value;
    const audioFile = document.getElementById('audio').files[0];
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('json', JSON.stringify({
        models: {
            burst: {},
            prosody: { granularity: "utterance", window: { length: 4, step: 1 } },
            transcription: null,
            notify: false
        }
    }));
};

    fetch('https://api.hume.ai/v0/batch/jobs', {
        method: 'POST',
        headers: {
            'X-Hume-Api-Key': apiKey
            // 'Content-Type': 'multipart/form-data' is not needed, as it's set automatically when using FormData
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => console.error('error:' + err));
});
