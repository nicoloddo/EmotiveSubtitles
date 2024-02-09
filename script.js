// Stores the job id
let currentJobId = '';

// Stores the predictions locally
let analysisResults = {
  prosodyPredictions: [],
  burstPredictions: []
};

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
                "prosody": {
                    "granularity": "utterance",
                    "window": {
                        "length": 4,
                        "step": 4
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
                currentJobId = response.job_id;
            })
            .catch(err => {
                console.error(err);
                document.getElementById('result').textContent = 'Error: ' + err.message;
            });
    });
});

// Function to retrieve job results
function retrieveJobResults() {
    const apiKey = document.getElementById('apiKey').value; // Get the API key from the input
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json; charset=utf-8',
            'X-Hume-Api-Key': apiKey
        }
    };

    fetch(`https://j1xvsqp6g0.execute-api.eu-west-3.amazonaws.com/Prod/${currentJobId}`, options)
        .then(response => response.json())
        .then(response => {
            console.log(response);

            // SELECTION PATTERN INSIDE THE RETURNED RESPONSE FROM HUME AI
            // The first item in the array is the one we're interested in
            let firstResult = response[0];
            if (firstResult && firstResult.results && firstResult.results.predictions) {
                let firstPrediction = firstResult.results.predictions[0];
                
                // Access prosody predictions if available
                if (firstPrediction.models.prosody && firstPrediction.models.prosody.grouped_predictions.length > 0) {
                    let prosodyPredictions = firstPrediction.models.prosody.grouped_predictions[0].predictions;
                    prosodyPredictions.forEach(prediction => {
                        analysisResults.prosodyPredictions.push(prediction);
                    });
                }
                
                // Access burst predictions if available
                if (firstPrediction.models.burst && firstPrediction.models.burst.grouped_predictions.length > 0) {
                    let burstPredictions = firstPrediction.models.burst.grouped_predictions[0].predictions;
                    burstPredictions.forEach(prediction => {
                        analysisResults.burstPredictions.push(prediction);
                    });
                }
            }

            // For demonstration purposes, log the saved predictions
            console.log('Prosody Predictions:', analysisResults.prosodyPredictions);
            //console.log('Burst Predictions:', analysisResults.burstPredictions);
            
            // Build the string for prosody predictions
            let prosodyResultText = 'Prosody:\n' + analysisResults.prosodyPredictions.map(p => JSON.stringify(p, null, 2)).join('\n');

            // Set the result text content
            document.getElementById('result').textContent = prosodyResultText;
        })
        .catch(err => {
            console.error(err);
            document.getElementById('result').textContent = 'Error: ' + err.message;
        });
}

document.addEventListener("DOMContentLoaded", function() {
    // Other code for the uploadForm event listener...
    
    // Add event listener for the retrieve button
    const retrieveButton = document.getElementById('retrieveButton');
    retrieveButton.addEventListener('click', retrieveJobResults);
});