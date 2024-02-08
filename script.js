document.addEventListener("DOMContentLoaded", function() {
    // Get the form element
    const form = document.getElementById('uploadForm');

    // Add event listener for form submission
    form.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the file and API key from the form
        const fileInput = document.getElementById('audio');
        const apiKey = document.getElementById('apiKey').value;
        const file = fileInput.files[0];

        // Create a FormData object and append the file and the JSON payload
        const formData = new FormData();
        formData.append('json', JSON.stringify({
            "models": {
                "burst": {},
                "prosody": {
                    "granularity": "utterance",
                    "window": {
                        "length": 4,
                        "step": 1
                    }
                }
            },
            "transcription": null,
            "notify": false
        }));
        formData.append('file', file, file.name);

        // Options for the fetch request
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'X-Hume-Api-Key': apiKey
                // Do not set Content-Type here, it will be set automatically by the browser when FormData is used
            },
            body: formData
        };

        // Make the fetch request
        fetch('https://j1xvsqp6g0.execute-api.eu-west-3.amazonaws.com/Prod/proxy', options)
            .then(response => response.json())
            .then(response => {
                // Process the response
                console.log(response);
                document.getElementById('result').textContent = JSON.stringify(response, null, 2);
            })
            .catch(err => {
                console.error(err);
                document.getElementById('result').textContent = 'Error: ' + err.message;
            });
    });
});
