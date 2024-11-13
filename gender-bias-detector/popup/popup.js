document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultSection = document.getElementById('resultSection');
    const biasScore = document.getElementById('biasScore');
    const biasMessage = document.getElementById('biasMessage');
    const spinner = analyzeBtn.querySelector('.spinner');
    const btnText = analyzeBtn.querySelector('.btn-text');

    // Get the current tab's text when popup opens
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: getPageText
        }, function(results) {
            if (results && results[0]) {
                textInput.value = results[0].result;
            }
        });
    });

    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze');
            return;
        }

        // Show loading state
        spinner.classList.remove('hidden');
        btnText.textContent = 'Analyzing...';
        analyzeBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:8000/detect-bias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            resultSection.classList.remove('hidden');
            setTimeout(() => {
                resultSection.classList.add('visible');
                biasScore.textContent = `Bias Score: ${(data.bias_score * 100).toFixed(1)}%`;
                biasMessage.textContent = data.has_bias 
                    ? 'Gender bias detected in the text.'
                    : 'No significant gender bias detected.';
                biasScore.style.color = data.has_bias ? '#dc3545' : '#28a745';
            }, 100);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to analyze text. Please try again.');
        } finally {
            spinner.classList.add('hidden');
            btnText.textContent = 'Analyze';
            analyzeBtn.disabled = false;
        }
    });
});

// Function to get page text
function getPageText() {
    return document.body.innerText;
}