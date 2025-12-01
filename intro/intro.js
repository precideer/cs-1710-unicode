        function generateQuizCharacters() {
            const asciiChars = [];
            const unicodeChars = [];
            
            // Get 3 random ASCII characters (32-93 ONLY for 1963)
            const asciiPool = Array.from({length: 62}, (_, i) => i + 32);
            for (let i = 0; i < 80; i++) {
                const randomIndex = Math.floor(Math.random() * asciiPool.length);
                asciiChars.push(asciiPool[randomIndex]);
                asciiPool.splice(randomIndex, 1);
                if (asciiPool.length === 0) break;
            }
            
            // Get random Unicode characters
            const unicodeRanges = [
                [0x4E00, 0x9FFF], // CJK
                [0x0400, 0x04FF], // Cyrillic
                [0x0600, 0x06FF], // Arabic
                [0x0370, 0x03FF], // Greek
            ];
            
            for (let i = 0; i < 82; i++) {
                const range = unicodeRanges[Math.floor(Math.random() * unicodeRanges.length)];
                const code = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
                unicodeChars.push(code);
            }
            
            return [...asciiChars, ...unicodeChars];
        }

        let currentStep = 0;
        const scrollContainer = document.getElementById('scrollContainer');
        const stickyContent = document.getElementById('stickyContent');
        const emojiDisplay = document.getElementById('emojiDisplay');
        const mainTitle = document.getElementById('mainTitle');
        const dialogues = [
            document.getElementById('dialogue1'),
            document.getElementById('dialogue2'),
            document.getElementById('dialogue3'),
            document.getElementById('dialogue4')
        ];
        const section1963a = document.getElementById('section1963a');
        const section1963b = document.getElementById('section1963b');
        const mcqSection = document.getElementById('mcqSection');
        const gridBackground = document.getElementById('gridBackground');
        const finalTitle = document.getElementById('finalTitle');
        const portraitGrid = document.getElementById('portraitGrid');

        // Generate grid cells with characters
        const characters = generateQuizCharacters();
        for (let i = 0; i < 162; i++) {
            const cell = document.createElement('div');
            cell.className = 'portrait-cell';
            if (i < characters.length) {
                cell.textContent = String.fromCharCode(characters[i]);
            }
            portraitGrid.appendChild(cell);
        }

        // Define step configurations
        const steps = [
            { // Step 0: Initial
                title: true,
                emoji: '😐',
                dialogue: 0,
                shrink: false
            },
            { // Step 1: First dialogue
                title: false,
                emoji: '😐',
                dialogue: 1,
                shrink: false
            },
            { // Step 2: Second dialogue
                title: false,
                emoji: '😐',
                dialogue: 2,
                shrink: false
            },
            { // Step 3: Third dialogue
                title: false,
                emoji: '😬',
                dialogue: 3,
                shrink: false
            },
            { // Step 4: Time travel starts
                title: false,
                emoji: '😮',
                dialogue: 4,
                shrink: true
            },
            { // Step 5: More transformation
                title: false,
                emoji: '😱',
                dialogue: -1,
                shrink: true
            },
            { // Step 6: Final emoji evolution
                title: false,
                emoji: '🤯',
                dialogue: -1,
                shrink: true,
                hideSticky: true
            }
        ];

        function updateUI(step) {
            currentStep = step;
            const config = steps[step] || steps[steps.length - 1];

            // Reset everything first
            mainTitle.classList.remove('visible');
            emojiDisplay.classList.remove('shrink');
            dialogues.forEach(d => d.classList.remove('visible'));
            stickyContent.classList.remove('hide');
            section1963a.classList.remove('visible');
            section1963b.classList.remove('visible');
            mcqSection.classList.remove('visible');
            gridBackground.classList.remove('visible');
            finalTitle.classList.remove('visible');

            // Apply current step configuration
            if (config.title) {
                mainTitle.classList.add('visible');
            }
            
            emojiDisplay.textContent = config.emoji;
            
            if (config.shrink) {
                emojiDisplay.classList.add('shrink');
            }
            
            if (config.dialogue >= 0 && config.dialogue < dialogues.length) {
                dialogues[config.dialogue].classList.add('visible');
            }

            if (config.hideSticky) {
                stickyContent.classList.add('hide');
            }

            // Show 1963 sections
            if (step >= 6) {
                section1963a.classList.add('visible');
            }
            if (step >= 7) {
                section1963b.classList.add('visible');
            }
            if (step >= 8) {
                mcqSection.classList.add('visible');
            }
            if (step >= 9) {
                gridBackground.classList.add('visible');
            }
            if (step >= 10) {
                finalTitle.classList.add('visible');
            }
        }

        // Scroll handler
        scrollContainer.addEventListener('scroll', () => {
            const scrollTop = scrollContainer.scrollTop;
            const vh = window.innerHeight;
            
            // Determine current step based on scroll position
            const newStep = Math.floor(scrollTop / vh);
            
            if (newStep !== currentStep) {
                updateUI(newStep);
            }
        });

        // Initialize
        updateUI(0);

        // Click to scroll
        document.addEventListener('click', () => {
            if (currentStep < 10) {
                scrollContainer.scrollBy({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            }
        });
