// Define min and max size in rem of the Arousal
let arousalMinSize = 1.5; // rem
let arousalMaxSize = 5; // rem

// Set Retrieval attempts settings
let maxRetrievalAttempts = 5;
let attemptIntervalms = 8000;

// Stores the job id
let currentJobId = '';

// Stores the predictions locally
let analysisResults = {
  prosodyPredictions: [],
  burstPredictions: []
};
function initializeAnalysisResults() {
    analysisResults = {
        prosodyPredictions: [],
        burstPredictions: []
    };
}

// Subtitle index
let currentSubtitleIndex = 0;

// Emotion scores for each emotion. This is mostly arbitrary and generated by a language model. 
// It is just a try, I can base it on scientific research linked to Russel's circumplex of affect.
// I need a method to reduce the dimensionality to 2 in a way that can be intuitively meaningful.
let emotionScores = {
    "Admiration": {"valence": 0.6, "arousal": 0.3},
    "Adoration": {"valence": 0.7, "arousal": 0.4},
    "Aesthetic Appreciation": {"valence": 0.8, "arousal": 0.1},
    "Amusement": {"valence": 0.9, "arousal": 0.6},
    "Anger": {"valence": -0.7, "arousal": 0.9},
    "Anxiety": {"valence": -0.8, "arousal": 0.8},
    "Awe": {"valence": 0.8, "arousal": 0.4},
    "Awkwardness": {"valence": -0.3, "arousal": 0.2},
    "Boredom": {"valence": -0.6, "arousal": -0.8},
    "Calmness": {"valence": 0.7, "arousal": -1},
    "Concentration": {"valence": 0.1, "arousal": 0.6},
    "Confusion": {"valence": -0.2, "arousal": 0.3},
    "Contemplation": {"valence": 0.4, "arousal": -0.1},
    "Contempt": {"valence": -0.5, "arousal": 0.2},
    "Contentment": {"valence": 0.8, "arousal": -0.2},
    "Craving": {"valence": 0.2, "arousal": 0.5},
    "Desire": {"valence": 0.3, "arousal": 0.6},
    "Determination": {"valence": 0.2, "arousal": 0.8},
    "Disappointment": {"valence": -0.7, "arousal": -0.3},
    "Disgust": {"valence": -0.9, "arousal": 0.1},
    "Distress": {"valence": -0.8, "arousal": 0.7},
    "Doubt": {"valence": -0.3, "arousal": 0.1},
    "Ecstasy": {"valence": 1.0, "arousal": 0.9},
    "Embarrassment": {"valence": -0.4, "arousal": -0.2},
    "Empathic Pain": {"valence": -0.6, "arousal": 0.2},
    "Entrancement": {"valence": 0.6, "arousal": 0.1},
    "Envy": {"valence": -0.6, "arousal": 0.2},
    "Excitement": {"valence": 0.8, "arousal": 1},
    "Fear": {"valence": -0.8, "arousal": 1},
    "Guilt": {"valence": -0.6, "arousal": -0.2},
    "Horror": {"valence": -0.9, "arousal": 0.7},
    "Interest": {"valence": 0.6, "arousal": 0.5},
    "Joy": {"valence": 0.9, "arousal": 0.6},
    "Love": {"valence": 1.0, "arousal": 0.3},
    "Nostalgia": {"valence": 0.5, "arousal": -0.4},
    "Pain": {"valence": -0.9, "arousal": 0.5},
    "Pride": {"valence": 0.8, "arousal": 0.4},
    "Realization": {"valence": 0.1, "arousal": 0.4},
    "Relief": {"valence": 0.7, "arousal": 0.4},
    "Romance": {"valence": 0.7, "arousal": 0.3},
    "Sadness": {"valence": -0.9, "arousal": -0.5},
    "Satisfaction": {"valence": 0.8, "arousal": 0.2},
    "Shame": {"valence": -0.6, "arousal": -0.4},
    "Surprise (negative)": {"valence": -0.4, "arousal": 0.8},
    "Surprise (positive)": {"valence": 0.7, "arousal": 0.8},
    "Sympathy": {"valence": 0.5, "arousal": 0.1},
    "Tiredness": {"valence": -0.7, "arousal": -0.8},
    "Triumph": {"valence": 0.8, "arousal": 0.9}
}

document.addEventListener("DOMContentLoaded", function() {
    // Get the form element
    const form = document.getElementById('uploadForm');

    // Add event listener for form submission
    form.addEventListener('submit', function(event) {
        sendAudio(event);
    });

    document.getElementById('loadDemoButton').addEventListener('click', async function() {
        // Set the audio player source to the demo audio file
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = './demo.mp3';

        try {
            // Fetch the demo predictions JSON
            const response = await fetch('./demo.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const demoPredictions = await response.json();

            // Restore the analysis results
            initializeAnalysisResults();

            // Update the analysisResults with the fetched data
            analysisResults.prosodyPredictions = demoPredictions;

            console.log('Loaded Demo. Refresh the page if you want to upload your own.'); 

            enablePlayButton();
            syncSubtitles(); // Ensure this function is correctly set up to handle the new data
            showLoadedDemo();

        } catch (error) {
            console.error('Failed to load demo predictions:', error);
        }
    });

    document.getElementById('downloadAnalysisButton').addEventListener('click', function() {
        // Convert the data to a JSON string
        const dataStr = JSON.stringify(analysisResults.prosodyPredictions, null, 2);
        
        // Create a Blob from the JSON string
        const blob = new Blob([dataStr], { type: "application/json" });

        // Create a link element, set the filename, and start the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "analysisResults.json";
        document.body.appendChild(link); // Append to the document
        link.click(); // Trigger the download

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // Get the close button and the audio player elements
    var closeButton = document.getElementById('closePlayModal');
    var audioPlayer = document.getElementById('audioPlayer');

    // Add an event listener to the close button
    closeButton.addEventListener('click', function() {
        // Pause the audio player
        audioPlayer.pause();
        // Reset the current time to the beginning
        audioPlayer.currentTime = 0;
    });
});

function sendAudio(event) {
    // Prevent the default form submission
    event.preventDefault();

    // Update client
    disablePlayButton();
    restoreDemoButton();
    console.log("Uploading...");

    // Get the file from the form
    const fileInput = document.getElementById('audio');
    const file = fileInput.files[0];

    // Check if the file is selected
    if (!file) {
        console.error("No file selected.");
        showError('No file selected')
        return; // Exit the function if no file is selected
    }

    console.log("File to be uploaded:", file);

    // Set the audio player source to the uploaded file
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = URL.createObjectURL(file);

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
        "transcription":{"language":"en","identify_speakers":false,"confidence_threshold":0.5},
        "notify": false
    }));
    formData.append('file', file, file.name);

    // Options for the fetch request
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            // Do not set Content-Type here, it will be set automatically by the browser when FormData is used
        },
        body: formData
    };

    let attemptCount = 0;
    let intervalId;

    showLoading(); // Start loading display
    // Make the fetch request
    fetch('https://j1xvsqp6g0.execute-api.eu-west-3.amazonaws.com/Prod/proxy', options)
        .then(response => {
            if (response.ok) {
                console.log('Response was ok. ' + response.status + ' ' + response.statusText);
                return response.json();
            } else {
                console.log('Response was not ok. ' + response.status + ' ' + response.statusText);
                showError('Audio upload failed: ' + response.status + ' ' + response.statusText);
                throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText);
            }
        })
        .then(response => {
            console.log(response);
            currentJobId = response.job_id;
            intervalId = setInterval(() => {
                if (attemptCount < maxRetrievalAttempts) {
                    console.log('Attempt ' + (attemptCount + 1));
                    retrieveJobResults()
                        .then(result => {
                            console.log(result); // Job was successful
                            clearInterval(intervalId); // Clear the interval
                            enablePlayButton();
                            syncSubtitles();
                            restoreSubmitButton();
                        })
                        .catch(error => {
                            console.error('Attempt failed:', error);
                            // The interval will continue until maxRetrievalAttempts is reached
                        });
                    attemptCount++;
                } else {
                    console.log("Max attempts reached, stopping retries.");
                    clearInterval(intervalId);
                    showError('Timed out');
                }
            }, attemptIntervalms);
        })
        .catch(err => {
            console.error(err);
            showError(err.message + ', remember about file size limits!');
        });
}

function retrieveJobResults() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json; charset=utf-8',
            }
        };

        fetch(`https://j1xvsqp6g0.execute-api.eu-west-3.amazonaws.com/Prod/${currentJobId}`, options)
            .then(response => response.json())
            .then(response => {
                console.log(response);

                // Restore the analysis results
                initializeAnalysisResults();

                // Collect the predictions
                getPredictions(response);
                console.log('Prosody Predictions:', analysisResults.prosodyPredictions);
                //console.log('Burst Predictions:', analysisResults.burstPredictions);

                // Process each prediction in analysisResults.prosodyPredictions
                analysisResults.prosodyPredictions = analysisResults.prosodyPredictions.map(processPrediction);

                // Log the processed predictions
                console.log('Processed Prosody Predictions:', analysisResults.prosodyPredictions);  

                // If processing is successful:
                resolve("Job successful"); // Or pass any relevant data
            })
            .catch(err => {
                console.error(err);
                reject("Job failed: " + err.message); // Reject the promise on error
            });
    });
}

function getPredictions(response) {
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
}

function processPrediction(prediction) {
    // Compute valence and arousal
    const { valence, arousal } = calculateValenceArousal(prediction.emotions);

    // Find top 3 emotions based on intensity
    const topEmotions = prediction.emotions
        .sort((a, b) => b.score - a.score) // Sort emotions by descending intensity
        .slice(0, 3); // Take top 3 emotions

    return {
        time: prediction.time,
        text: prediction.text,
        valence: valence,
        arousal: arousal,
        topEmotions: topEmotions
    };
}

function syncSubtitles() {
    const audioPlayer = document.getElementById('audioPlayer');
    const subtitlesDiv = document.getElementById('subtitles');
    const emotionsDiv = document.getElementById('emotions');

    audioPlayer.addEventListener('timeupdate', () => {
        let currentTime = audioPlayer.currentTime;

        currentSubtitleIndex = analysisResults.prosodyPredictions.findIndex(subtitle => {
            return currentTime >= subtitle.time.begin && currentTime <= subtitle.time.end;
        });

        if (currentSubtitleIndex !== -1) {
            let currentSubtitle = analysisResults.prosodyPredictions[currentSubtitleIndex];
            subtitlesDiv.textContent = currentSubtitle.text;
            emotionsDiv.textContent = currentSubtitle.topEmotions.map(e => e.name).join(', ');

            // Set color based on valence and size based on arousal
            subtitlesDiv.style.color = getColorForValence(currentSubtitle.valence);
            subtitlesDiv.style.fontSize = getSizeForArousal(currentSubtitle.arousal);
            console.log('Valence: ' + currentSubtitle.valence);
            console.log('Arousal: ' + currentSubtitle.arousal);
        } else {
            subtitlesDiv.textContent = '';
            emotionsDiv.textContent = '';
        }
    });
}


function getColorForValence(valence) {
    // Normalize valence to a 0 - 1 range
    const normalizedValence = (valence + 1) / 2;

    // Define the gradient stops as percentages along with their colors
    const gradientStops = [
        { stop: 0.0, color: [35, 21, 87] },   // #231557 at 0%
        { stop: 0.29, color: [68, 16, 122] }, // #44107A at 29%
        { stop: 0.67, color: [255, 19, 97] }, // #FF1361 at 67%
        { stop: 1.0, color: [255, 248, 0] }   // #FFF800 at 100%
    ];

    // Find the two stops the valence is between and interpolate the color
    for (let i = 0; i < gradientStops.length - 1; i++) {
        const currentStop = gradientStops[i];
        const nextStop = gradientStops[i + 1];

        if (normalizedValence >= currentStop.stop && normalizedValence <= nextStop.stop) {
            // Calculate how far the valence is between the two stops
            const mix = (normalizedValence - currentStop.stop) / (nextStop.stop - currentStop.stop);

            // Interpolate the color
            const color = currentStop.color.map((component, index) => {
                return Math.round(component + mix * (nextStop.color[index] - component));
            });

            return `rgb(${color.join(',')})`;
        }
    }

    // Fallback color if valence is out of range
    return 'rgb(0, 0, 0)';
}

function getSizeForArousal(arousal) {
    // Normalize arousal to a 0 - 1 range (where -1 is 0, 1 is 1, and 0 is 0.5)
    const normalizedArousal = (arousal + 1) / 2;

    // Interpolate between min and max size based on normalized arousal
    const size = arousalMinSize + normalizedArousal * (arousalMaxSize - arousalMinSize);

    return size + 'rem'; // Return size in rem units
}

function calculateValenceArousal(emotions) {
    let totalValence = 0;
    let totalArousal = 0;
    let totalIntensity = 0;

    emotions.forEach(emotion => {
        const intensity = emotion.score;
        const valenceScore = emotionScores[emotion.name].valence;
        const arousalScore = emotionScores[emotion.name].arousal;

        totalValence += intensity * valenceScore;
        totalArousal += intensity * arousalScore;
        totalIntensity += intensity;
    });

    const averageValence = totalIntensity ? totalValence / totalIntensity : 0;
    const averageArousal = totalIntensity ? totalArousal / totalIntensity : 0;

    return { valence: averageValence, arousal: averageArousal };
}


// OTHER BUTTONS EVENT LISTENERS:
document.addEventListener("DOMContentLoaded", function() {
});