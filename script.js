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

        // Read the file as a base64 encoded string
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // Add the necessary prefix to the base64 string
            const base64String = reader.result;
            const base64Data = base64String.replace(/^data:.*\/.*;base64,/, '');

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
            formData.append('file', 'data:audio/wav;name=' + file.name + ';base64,' + base64Data);

            // Options for the fetch request
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'X-Hume-Api-Key': apiKey
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
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    });
});
