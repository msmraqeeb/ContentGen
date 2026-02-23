document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loader = generateBtn.querySelector('.loader');
    const errorMsg = document.getElementById('error-message');
    const outputArea = document.getElementById('output-area');
    const copyBtn = document.getElementById('copy-btn');
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const inputSection = document.querySelector('.input-section');
    const gridLayout = document.querySelector('.grid-layout');

    // Configure marked wrapper safely
    marked.setOptions({
        gfm: true,
        breaks: true,
    });

    // Toggle Calendar Options Visibility based on Content Type
    const contentTypeSelect = document.getElementById('contentType');
    const calendarOptions = document.getElementById('calendar-options');

    contentTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === '30-Day Content Calendar') {
            calendarOptions.classList.remove('hidden');
        } else {
            calendarOptions.classList.add('hidden');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            businessName: document.getElementById('businessName').value.trim(),
            niche: document.getElementById('niche').value.trim(),
            targetAudience: document.getElementById('targetAudience').value.trim(),
            language: document.getElementById('language').value,
            tone: document.getElementById('tone').value,
            contentType: document.getElementById('contentType').value,

            // New Calendar specific fields
            graphicsCount: document.getElementById('graphicsCount').value,
            reelsCount: document.getElementById('reelsCount').value,
            motionCount: document.getElementById('motionCount').value,
            liveCount: document.getElementById('liveCount').value
        };

        // 2. Set loading state
        setLoadingState(true);

        try {
            // 3. Make API call
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong while generating content.');
            }

            // 4. Display result using marked.js
            displayResult(data.text);

        } catch (error) {
            showError(error.message);
        } finally {
            setLoadingState(false);
        }
    });

    copyBtn.addEventListener('click', async () => {
        const textToCopy = outputArea.innerText;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);

            // Visual feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text to clipboard');
        }
    });

    toggleFormBtn.addEventListener('click', () => {
        inputSection.classList.toggle('collapsed');
        gridLayout.classList.toggle('form-collapsed');
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.textContent = 'Generating...';
            loader.classList.remove('hidden');
            errorMsg.classList.add('hidden');

            // Temporary loading state in output
            outputArea.classList.remove('empty');
            outputArea.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); gap: 1rem;">
                    <div class="loader" style="border-top-color: var(--accent-color); width: 32px; height: 32px;"></div>
                    <p>Brewing some creative ideas...</p>
                </div>
            `;
            copyBtn.classList.add('hidden');
        } else {
            generateBtn.disabled = false;
            btnText.textContent = 'Generate Content';
            loader.classList.add('hidden');
        }
    }

    function displayResult(markdownText) {
        outputArea.classList.remove('empty');
        // Convert Markdown to HTML securely
        const htmlContent = marked.parse(markdownText);
        outputArea.innerHTML = htmlContent;
        copyBtn.classList.remove('hidden');
        toggleFormBtn.classList.remove('hidden');

        // Auto-collapse form to expand output view
        inputSection.classList.add('collapsed');
        gridLayout.classList.add('form-collapsed');

        // Add a subtle slide-in animation
        outputArea.style.opacity = '0';
        outputArea.style.transform = 'translateY(10px)';

        setTimeout(() => {
            outputArea.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            outputArea.style.opacity = '1';
            outputArea.style.transform = 'translateY(0)';
        }, 50);
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');

        // Reset output if it was previously empty or showing loader
        if (!outputArea.querySelector('h1, h2, h3, p, table, ul, ol')) {
            outputArea.classList.add('empty');
            outputArea.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon" style="opacity: 0.8"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p style="color: var(--error-color)">Failed to generate content.</p>
                </div>
            `;
        }
    }
});
