document.addEventListener("DOMContentLoaded", function () {
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    const synth = window.speechSynthesis;
    const userInput = document.getElementById("userInput");
    const chatbox = document.getElementById("chatbox");
    const languageDropdown = document.getElementById("languageDropdown");
    const optionsDropdown = document.getElementById("optionsDropdown");

    function sendMessage() {
        const message = userInput.value.trim();
        if (message !== "") {
            displayMessage(`You: ${message}`, 'user');
            const selectedOption = optionsDropdown.value;

            if (selectedOption === 'textToSpeech') {
                speakMessage(message, languageDropdown.value);
            } else if (selectedOption === 'talkToBot') {
                handleBotQuery(message);
            }

            userInput.value = "";
        }
    }
    function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;

        const messageText = document.createElement('span');
        messageText.textContent = message.substring(message.indexOf(':') + 2);
        messageDiv.appendChild(messageText);

        chatbox.appendChild(messageDiv);
    }

    function startVoiceRecognition() {
        recognition.start();

        recognition.onresult = function (event) {
            const userVoiceMessage = event.results[0][0].transcript;
            displayMessage(`You (Voice): ${userVoiceMessage}`, 'user');
            handleBotQuery(userVoiceMessage);
        };
    }

    function speakMessage(text, language) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
    
        // Get the list of available voices
        const voices = synth.getVoices();
    
        // Find a female voice for the selected language (Hindi)
        const hindiFemaleVoice = voices.find(voice => voice.lang === 'hi-IN' && voice.name.includes('female'));
    
        // If a female voice is found, set it for the utterance
        if (hindiFemaleVoice) {
            utterance.voice = hindiFemaleVoice;
        } else {
            // If no female voice is found, fallback to any available Hindi voice
            const hindiVoice = voices.find(voice => voice.lang === 'hi');
            utterance.voice = hindiVoice;
        }
    
        // Adjust rate and pitch for better pronunciation
        utterance.rate = 1.0;  // Adjust the rate as needed
        utterance.pitch = 1.0; // Adjust the pitch as needed
    
        // Speak the utterance
        synth.speak(utterance);
    }

    document.getElementById("voiceButton").addEventListener("click", startVoiceRecognition);
    document.querySelector(".btn-primary").addEventListener("click", sendMessage);
const apiKey = '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';
function handleBotQuery(query) {
    const endpoint = 'https://api.openai.com/v1/completions';

    const requestData = {
        model: 'text-davinci-003', // Specify the model you want to use
        prompt: query,
        max_tokens: 150,
        temperature: 0.7,
    };
    

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
            const botResponse = data.choices[0].text.trim();
            displayMessage(`Bot: ${botResponse}`, 'bot');
            speakMessage(botResponse, languageDropdown.value);
        } else {
            console.error('Unexpected response format from OpenAI API:', data);
            displayMessage('Error communicating with the bot.', 'bot');
        }
    })
    .catch(error => {
        console.error('Error communicating with the OpenAI API:', error);
        displayMessage('Error communicating with the bot.', 'bot');
    });
}
});
