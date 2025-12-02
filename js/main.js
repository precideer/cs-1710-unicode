// =======================
// ASCII YANG LOADER LOGIC
// =======================

const asciiEl = document.getElementById('asciiYangPortrait');
const loader = document.getElementById('loader');
const appContent = document.getElementById('appContent');

const eyeOptions = ['• •', '0 0', '- -'];
const mouthOptions = ['___', ' q ', ' O ', '▂▂ '];

function makeAsciiYang() {
    if (!asciiEl) return;
    const eyes = eyeOptions[Math.floor(Math.random() * eyeOptions.length)];
    const mouth = mouthOptions[Math.floor(Math.random() * mouthOptions.length)];

    const lines = [
        '        %%%%%%%%%%%%   ',
        '       |            |_',
        `       |    ${eyes}     _|`,
        '       |    <       | ',
        `       |    ${mouth}     |`,
        '       |____________| ',
        '',
        'One second, I am loading my stuff...'
    ];

    asciiEl.textContent = lines.join('\n');
}

// animate every 150ms
const asciiInterval = setInterval(makeAsciiYang, 150);
makeAsciiYang(); // draw immediately once

// =======================
// WAIT FOR CSV + 2 SECONDS
// =======================

// (example) your CSV loading promises:
const csvPromises = [
    fetch("data/file1.csv").then(r => r.text()),
    fetch("data/file2.csv").then(r => r.text())
    // add all CSV fetches here
];

const MIN_TIME = new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds

// When ALL CSVs are loaded AND 2 seconds passed:
Promise.all([Promise.all(csvPromises), MIN_TIME]).then(() => {
    clearInterval(asciiInterval); // stop animation
    loader.classList.add("fade-out");

    setTimeout(() => {
        loader.style.display = "none";
        appContent.style.display = "block";
    }, 600); // matches the CSS transition
});


// Global state
let currentSection = 0;
let quizState = {
    selectedChars: new Set(),
    asciiChars: [],
    unicodeChars: [],
    allChars: [],
    submitted: false
};

let asciiData = [];
let unicodeData = [];
let languageData = [];
let currentSortType = 'code';
let removeOutlier = false;

// Character info map for quick lookup by code point (hex string -> character data)
let characterInfoMap = new Map();

// Emoji visualization data
let emojiDataAll = [];
let emojiDataUS = [];
let emojiDataUK = [];
let currentEmojiData = [];
let currentRegion = 'all';
let currentVersion = 18;

// ASCII characters for 1963 (ASCII codes 32-93 ONLY - no lowercase)
const ASCII_1963 = new Set();
for (let i = 32; i <= 93; i++) {
    ASCII_1963.add(i);
}

// Timeline data (for interactive Journey to Unicode timline)
const timelineData = [
    {
        year: 1837,
        title: "Morse code emerges",
        content: "Long-distance electrical communication began with Samuel Morse and Alfred Vail. Their dot-and-dash code gave telegraph operators a reliable way to send text over wires, and later over radio. Morse code became the world's first widely used digital communication system."
    },
    {
        year: 1874,
        title: "Baudot's five-bit breakthrough",
        content: "Émile Baudot transformed telegraphy with a compact five-bit code that could represent letters, numbers, and some symbols far more efficiently than earlier systems. Although limited to mostly Latin characters, the Baudot code became the global telegraph standard and laid the conceptual groundwork for later computerized encodings."
    },
    {
        year: 1961,
        title: "Push for standardization",
        content: "At IBM, Bob Bemer recognized the growing need for a uniform character set for computers. He proposed a standardized encoding to the American Standards Association, drawing on IBM's 6-bit systems but expanding the design to include a fuller range of characters. His ideas became foundational to ASCII."
    },
    {
        year: 1963,
        title: "The first ASCII",
        content: "The ASA released the inaugural ASCII specification, defining 97 characters using 7-bit codes. It unified letters, digits, punctuation, and control signals under a single scheme, though this early version differed significantly from the ASCII familiar today. Notably, ASCII-1963 did not include lowercase letters; these were added in the 1967 revision. The 1963 version also had a more restricted set of punctuation and special characters."
    },
    {
        year: 1967,
        title: "A major revision",
        content: "A substantial update to ASCII refined the structure and assignments of many characters. This revision set the direction for the modern version that would become entrenched in computing."
    },
    {
        year: 1968,
        title: "Federal adoption",
        content: "A minor revision produced ASCII-1968 without altering the graphic character set. That same year, President Lyndon B. Johnson ordered all U.S. federal agencies to adopt ASCII for electronic data exchange, making it a nationwide interoperable standard."
    },
    {
        year: 1987,
        title: "Unicode conceived",
        content: "MS-DOS 3.3 (an operating system released by Microsoft) expanded character support through new codepages for Central European, Baltic, Turkish, and Greek scripts, enabling wider multilingual computing. In the same year, Joe Becker introduced the term \"Unicode\" to describe a universal, unified encoding that could transcend the patchwork of existing code systems."
    },
    {
        year: 1991,
        title: "The birth of Unicode 1.0",
        content: "The newly formed Unicode Consortium released the first version of the Unicode standard, encoding 28,864 characters from a broad range of writing systems. Designed to remain compatible with ASCII while covering scripts far beyond its reach, Unicode marked the beginning of truly global text representation."
    }
];

// Unicode version data for the Sankey diagram
// Note that the char count includes Graphic + Format characters
// Unicode.org considers this the overall character count, so we have chosen to include this
const unicodeVersionData = [
    { version: "1.0", year: 1991, chars: 7096 },
    { version: "1.0.1", year: 1992, chars: 28294 },
    { version: "1.1", year: 1993, chars: 34168	 },
    { version: "2.0", year: 1996, chars: 38885 },
    { version: "2.1", year: 1998, chars: 38887 },
    { version: "3.0", year: 1999, chars: 49194 },
    { version: "3.1", year: 2001, chars: 94140 },
    { version: "3.2", year: 2002, chars: 95156 },
    { version: "4.0", year: 2003, chars: 96382 },
    { version: "4.1", year: 2005, chars: 97655 },
    { version: "5.0", year: 2006, chars: 99024 },
    { version: "5.1", year: 2008, chars: 100648},
    { version: "5.2", year: 2009, chars: 107296 },
    { version: "6.0", year: 2010, chars: 109384 },
    { version: "6.1", year: 2012, chars: 110116 },
    { version: "6.2", year: 2012, chars: 110117 },
    { version: "6.3", year: 2013, chars: 110122	},
    { version: "7.0", year: 2014, chars: 112956 },
    { version: "8.0", year: 2015, chars: 120672	},
    { version: "9.0", year: 2016, chars: 128172 },
    { version: "10.0", year: 2017, chars: 136690 },
    { version: "11.0", year: 2018, chars: 137374 },
    { version: "12.0", year: 2019, chars: 137928 },
    { version: "12.1", year: 2019, chars: 137929 },
    { version: "13.0", year: 2020, chars: 143859 },
    { version: "14.0", year: 2021, chars: 144697 },
    { version: "15.0", year: 2022, chars: 149186 },
    { version: "15.1", year: 2023, chars: 149813 },
    { version: "16.0", year: 2024, chars: 154998 },
    { version: "17.0", year: 2025, chars: 159801 }
];

// Script category colors
const scriptCategoryColors = {
    'Han': '#e06b9a',
    'Latin': '#72c9cd',
    'Arabic': '#8fa55d',
    'Indic': '#d4a574',
    'Hangul': '#7aa2f7',
    'Symbols': '#bb9af7',
    'Historic': '#9b9b9b',
    'Other': '#6fcf97',
    'Emoji': '#f4d03f',
    'CJK': '#e06b9a'
};

(function () {
    const finalGridSection = document.getElementById('section-final-grid');
    if (finalGridSection) {
        const gridEl = document.getElementById('portraitGrid');
        const overlayEl = finalGridSection.querySelector('.final-title-overlay');

        if (gridEl) {
            const glyphs =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?#§¶*&$@≡≈≠∴∵∞◊◇◆◎◐◑◧◨░▒▓█▞▚▙▟▛▜※卐中日文語形象字ᚠᚢᚦאבגדהשלום한글あいうえお';

            const cells = [];
            const totalCells = 20 * 10;

            for (let i = 0; i < totalCells; i++) {
                const span = document.createElement('span');
                span.className = 'portrait-cell';
                gridEl.appendChild(span);
                cells.push(span);
            }

            function randomGlyph() {
                const idx = Math.floor(Math.random() * glyphs.length);
                return glyphs.charAt(idx);
            }

            function updateGrid() {
                cells.forEach(cell => {
                    cell.textContent = randomGlyph();
                });
            }

            let gridTimer = null;

            const gridObserver = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            gridEl.classList.add('visible');
                            overlayEl && overlayEl.classList.add('visible');
                            updateGrid();
                            if (!gridTimer) {
                                gridTimer = setInterval(updateGrid, 1000);
                            }
                        } else {
                            if (gridTimer) {
                                clearInterval(gridTimer);
                                gridTimer = null;
                            }
                        }
                    });
                },
                {
                    root: document.getElementById('app') || null,
                    threshold: 0.3
                }
            );

            gridObserver.observe(finalGridSection);
        }
    }
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function () {
    // Load data
    await loadData();

    // Initialize sections
    initNavigation();
    initQuiz();
    initASCIIVisualization();
    initEmojiVisualization();

    // Initialize new sections
    initInteractiveTimeline();
    initSankeyDiagram();
    await initUnicodeUniverse();
    initBreakdownChart();

    // Set initial section
    showSection(0);
});

// Data Loading
async function loadData() {
    try {
        // Load ASCII frequency data
        const asciiResponse = await fetch('data/ascii_freq.json');
        asciiData = await asciiResponse.json();

        // Load Unicode data
        const unicodeResponse = await fetch('data/unicode-characters_info.csv');
        const unicodeText = await unicodeResponse.text();
        unicodeData = parseCSV(unicodeText);

        // Build character info map for quick lookup
        unicodeData.forEach(char => {
            if (char['Code value']) {
                const codeHex = char['Code value'].toUpperCase().padStart(4, '0');
                characterInfoMap.set(codeHex, {
                    name: char['Character name'] || 'Unknown',
                    category: char['General category'] || 'Unknown',
                    decimal: char['Decimal digit value'] || ''
                });
            }
        });

        // Load language/script data
        const languageResponse = await fetch('data/unicode_language.csv');
        const languageText = await languageResponse.text();
        languageData = parseLanguageCSV(languageText);

        // Load emoji data
        const emojiAllResponse = await fetch('data/emoji_all.csv');
        const emojiAllText = await emojiAllResponse.text();
        emojiDataAll = parseEmojiCSV(emojiAllText);

        const emojiUSResponse = await fetch('data/emoji_us.csv');
        const emojiUSText = await emojiUSResponse.text();
        emojiDataUS = parseEmojiCSV(emojiUSText);

        const emojiUKResponse = await fetch('data/emoji_uk.csv');
        const emojiUKText = await emojiUKResponse.text();
        emojiDataUK = parseEmojiCSV(emojiUKText);

        currentEmojiData = emojiDataAll;

    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// CSV Parser
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });

            // Parse hex code to decimal
            if (row['Code value']) {
                row.decimal = parseInt(row['Code value'], 16);
            }

            data.push(row);
        }
    }

    return data;
}

// Language CSV Parser
function parseLanguageCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            // Handle CSV with commas in quoted fields
            const values = [];
            let current = '';
            let inQuotes = false;

            for (const char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim().replace(/"/g, '') : '';
            });

            // Parse numeric values
            if (row['characters_in_script_today']) {
                row.charCount = parseFloat(row['characters_in_script_today']) || 0;
            }
            if (row['unicode_version']) {
                row.version = parseFloat(row['unicode_version']) || 1.0;
            }
            if (row['year_first_encoded']) {
                row.yearEncoded = parseInt(row['year_first_encoded']) || 1991;
            }

            data.push(row);
        }
    }

    return data;
}

// Navigation dots settings
function initNavigation() {
    const dots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.section');

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSection(index);
        });
    });

    // Mouse wheel navigation
    let isScrolling = false;

    document.getElementById('app').addEventListener('wheel', (e) => {
        if (isScrolling) return;

        isScrolling = true;

        if (e.deltaY > 0 && currentSection < sections.length - 1) {
            showSection(currentSection + 1);
        } else if (e.deltaY < 0 && currentSection > 0) {
            showSection(currentSection - 1);
        }

        setTimeout(() => {
            isScrolling = false;
        }, 800);
    }, { passive: true });
}

(function initAutoNavDots() {
    const app = document.getElementById('app');
    const dotsContainer = document.getElementById('navDots');

    if (!app || !dotsContainer) return;

    let sections = [];
    let observer = null;

    function buildDots() {
        // Clear old dots
        dotsContainer.innerHTML = '';

        // Grab current sections (order matters)
        sections = Array.from(app.querySelectorAll('.section'));

        sections.forEach((section, idx) => {
            // Ensure each section has an id for a11y & linking
            if (!section.id) section.id = `section-${idx}`;

            const btn = document.createElement('button');
            btn.className = 'nav-dot';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-label', `Section ${idx + 1}`);
            btn.dataset.sectionIndex = String(idx);

            btn.addEventListener('click', () => {
                sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            dotsContainer.appendChild(btn);
        });

        // Mark the first dot active initially (if any)
        updateActiveDot(0);

        // (Re)wire the intersection observer
        if (observer) observer.disconnect();
        observer = createIO();
        sections.forEach(sec => observer.observe(sec));
    }

    function updateActiveDot(activeIndex) {
        const dots = Array.from(dotsContainer.querySelectorAll('.nav-dot'));
        dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    }

    function createIO() {
        // Use rootMargin so a section becomes "active" when centered-ish
        return new IntersectionObserver((entries) => {
            // Choose the most visible entry to avoid rapid toggling
            let best = null;
            for (const e of entries) {
                if (!e.isIntersecting) continue;
                if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
            }
            if (!best) return;

            const index = sections.indexOf(best.target);
            if (index !== -1) updateActiveDot(index);
        }, {
            root: null,
            threshold: [0.5],           // becomes active when ≥50% visible
            rootMargin: '-20% 0px -20% 0px'
        });
    }

    // Build dots on load
    buildDots();

    // If slides/sections are added/removed later, rebuild automatically
    const mo = new MutationObserver((muts) => {
        // Rebuild only if .section count or order changes
        const prevIds = sections.map(s => s.id).join('|');
        const currentSections = Array.from(app.querySelectorAll('.section'));
        const currentIds = currentSections.map(s => s.id || '').join('|');
        if (prevIds !== currentIds || currentSections.length !== sections.length) {
            buildDots();
        }
    });

    mo.observe(app, { childList: true, subtree: true });

    // Optional: keyboard shortcut to jump sections (↑/↓)
    window.addEventListener('keydown', (e) => {
        if (!sections.length) return;
        const dots = Array.from(dotsContainer.querySelectorAll('.nav-dot'));
        const current = dots.findIndex(d => d.classList.contains('active'));
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            const next = Math.min(current + 1, sections.length - 1);
            sections[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            const prev = Math.max(current - 1, 0);
            sections[prev].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
})();

// Show section by index and select ID for sections
function showSection(index) {
    const sections = document.querySelectorAll('.section');
    const dots = document.querySelectorAll('.nav-dot');

    sections.forEach((section, i) => {
        if (i === index) {
            section.classList.add('active');
            section.style.display = 'flex';
        } else {
            section.classList.remove('active');
            section.style.display = 'flex';
        }
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    currentSection = index;
}

// Quiz section (starting here)
function initQuiz() {
    generateQuizCharacters();
    renderQuizGrid();

    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
    document.getElementById('playAgainBtn').addEventListener('click', resetQuiz);
}

function generateQuizCharacters() {
    // Get 3 random ASCII characters (32-93 ONLY for 1963)
    const asciiPool = Array.from({ length: 62 }, (_, i) => i + 32); // 32 to 93 inclusive
    quizState.asciiChars = [];

    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * asciiPool.length);
        quizState.asciiChars.push(asciiPool[randomIndex]);
        asciiPool.splice(randomIndex, 1);
    }

    // Get 3 random Unicode characters (not ASCII 32-93)
    const unicodePool = unicodeData.filter(char => {
        const code = char.decimal;
        return code && (code < 32 || code > 93) &&
            code !== 0 && // Skip null
            char['Character name'] !== '<control>' &&
            code < 65536; // Stay within BMP for better font support
    });

    quizState.unicodeChars = [];
    const usedIndices = new Set();

    for (let i = 0; i < 3; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * unicodePool.length);
        } while (usedIndices.has(randomIndex));

        usedIndices.add(randomIndex);
        quizState.unicodeChars.push(unicodePool[randomIndex].decimal);
    }

    // Combine and shuffle all characters
    quizState.allChars = [...quizState.asciiChars, ...quizState.unicodeChars];
    for (let i = quizState.allChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [quizState.allChars[i], quizState.allChars[j]] = [quizState.allChars[j], quizState.allChars[i]];
    }
}

function renderQuizGrid() {
    const grid = document.getElementById('quizGrid');
    grid.innerHTML = '';

    quizState.allChars.forEach((charCode, index) => {
        const item = document.createElement('button');
        item.className = 'quiz-item';
        item.dataset.index = index;
        item.dataset.charCode = charCode;

        // Display the character
        if (charCode >= 32 && charCode <= 93) {
            // Regular ASCII
            item.textContent = String.fromCharCode(charCode);
        } else {
            // Unicode character
            item.textContent = String.fromCharCode(charCode);
        }

        // Handle special characters that might not display well
        if (charCode === 32) item.textContent = '␣'; // Space
        if (charCode === 127) item.textContent = '␡'; // DEL

        item.addEventListener('click', () => toggleCharSelection(index));

        grid.appendChild(item);
    });
}

function toggleCharSelection(index) {
    if (quizState.submitted) return;

    const item = document.querySelector(`.quiz-item[data-index="${index}"]`);

    if (quizState.selectedChars.has(index)) {
        quizState.selectedChars.delete(index);
        item.classList.remove('selected');
    } else {
        quizState.selectedChars.add(index);
        item.classList.add('selected');
    }
}

function submitQuiz() {
    if (quizState.submitted) return;

    quizState.submitted = true;

    const items = document.querySelectorAll('.quiz-item');

    items.forEach((item, index) => {
        const charCode = parseInt(item.dataset.charCode);
        const isASCII = quizState.asciiChars.includes(charCode);
        const isSelected = quizState.selectedChars.has(index);

        item.classList.add('disabled');
        item.classList.remove('selected');

        if (isASCII && isSelected) {
            // Correctly selected
            item.classList.add('correct');
        } else if (!isASCII && isSelected) {
            // Incorrectly selected
            item.classList.add('incorrect');
        } else if (isASCII && !isSelected) {
            // Missed
            item.classList.add('missed');
        }
    });

    document.getElementById('submitBtn').classList.add('hidden');
    document.getElementById('playAgainBtn').classList.remove('hidden');
}

function resetQuiz() {
    quizState.selectedChars.clear();
    quizState.submitted = false;

    generateQuizCharacters();
    renderQuizGrid();

    document.getElementById('submitBtn').classList.remove('hidden');
    document.getElementById('playAgainBtn').classList.add('hidden');
}
// this is the end of the quiz section (for ref)

// ASCII Visualization
function initASCIIVisualization() {
    const filteredData = asciiData.filter(d => d.Char >= 32 && d.Char <= 93);

    // Add character type classification
    filteredData.forEach(d => {
        const char = d.Char;
        if ((char >= 65 && char <= 90)) {
            d.type = 'latin'; // Only uppercase letters for ASCII-1963
        } else if (char >= 48 && char <= 57) {
            d.type = 'digits';
        } else {
            d.type = 'punctuation';
        }
        d.character = String.fromCharCode(char);
        if (char === 32) d.character = '␣'; // Space character
    });
    window.asciiChartData = filteredData;
    createASCIIChart(filteredData);
    setupASCIIControls();
}

function createASCIIChart(data, sortType = 'code') {
    const container = document.querySelector('.ascii-chart-container');
    const svg = d3.select('#asciiChart');

    // Clear existing content
    svg.selectAll('*').remove();

    // Get active filters
    const filters = {
        latin: document.getElementById('filter-latin').checked,
        digits: document.getElementById('filter-digits').checked,
        punctuation: document.getElementById('filter-punctuation').checked
    };

    const removeOutlier = document.getElementById('remove-outlier').checked;

    // Filter data based on active filters and outlier setting
    let filteredData = data.filter(d => {
        if (removeOutlier && d.Char === 32) return false; // Remove space if outlier is checked
        return filters[d.type];
    });

    // Sort data
    if (sortType === 'frequency') {
        filteredData = [...filteredData].sort((a, b) => b.Freq - a.Freq);
    } else {
        filteredData = [...filteredData].sort((a, b) => a.Char - b.Char);
    }

    // Dimensions
    const margin = { top: 20, right: 20, bottom: 80, left: 20 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.15) // Increased padding for more space
        .domain(filteredData.map(d => d.Char));

    const maxFreq = removeOutlier ?
        d3.max(filteredData.filter(d => d.Char !== 32), d => d.Freq) :
        d3.max(filteredData, d => d.Freq);

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, maxFreq * 1.1]);

    // Draw bars
    const bars = g.selectAll('.ascii-bar')
        .data(filteredData)
        .enter().append('rect')
        .attr('class', d => `ascii-bar ${d.type}`)
        .attr('x', d => x(d.Char))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('data-char', d => d.Char)
        .attr('data-type', d => d.type);

    // Animate bars on load
    bars.transition()
        .duration(800)
        .delay((d, i) => i * 10)
        .attr('y', d => y(d.Freq))
        .attr('height', d => height - y(d.Freq));

    // Add labels with more spacing
    const labels = g.selectAll('.ascii-label')
        .data(filteredData)
        .enter().append('text')
        .attr('class', 'ascii-label')
        .attr('x', d => x(d.Char) + x.bandwidth() / 2)
        .attr('y', height + 25) // Increased spacing from bars
        .attr('data-char', d => d.Char)
        .attr('data-type', d => d.type)
        .text(d => d.character)
        .style('opacity', 0);

    labels.transition()
        .duration(800)
        .style('opacity', 1);

    // Store scales for later use
    window.asciiScales = { x, y, width, height };
}

function setupASCIIControls() {
    // Filter checkboxes
    const filters = {
        latin: document.getElementById('filter-latin'),
        digits: document.getElementById('filter-digits'),
        punctuation: document.getElementById('filter-punctuation')
    };

    Object.entries(filters).forEach(([type, checkbox]) => {
        checkbox.addEventListener('change', () => {
            updateVisualization();
        });
    });

    // Outlier checkbox
    const outlierCheckbox = document.getElementById('remove-outlier');
    outlierCheckbox.addEventListener('change', () => {
        removeOutlier = outlierCheckbox.checked;
        updateVisualization();
    });

    // Sort dropdown
    const dropdownBtn = document.getElementById('sortDropdown');
    const dropdownMenu = document.getElementById('sortMenu');
    const sortOptions = document.querySelectorAll('.dropdown-option');

    dropdownBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
        dropdownBtn.classList.toggle('open');
    });

    sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            const sortType = option.dataset.sort;

            // Update active state
            sortOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Update label
            document.getElementById('sortLabel').textContent =
                sortType === 'code' ? 'Code Value' : 'Frequency';

            // Close dropdown
            dropdownMenu.classList.add('hidden');
            dropdownBtn.classList.remove('open');

            // Update current sort type
            currentSortType = sortType;

            // Update chart
            updateVisualization();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
            dropdownBtn.classList.remove('open');
        }
    });
}

function updateVisualization() {
    const data = window.asciiChartData;
    createASCIIChart(data, currentSortType);
}

// Emoji CSV Parser
function parseEmojiCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });

            // Parse numeric values
            row.count = parseInt(row.count) || 0;
            row.version = parseFloat(row.version) || 0.6;

            data.push(row);
        }
    }

    return data;
}
// this is the end of the ASCII section (for ref)

// retro terminal demo
(function () {
    const input = document.getElementById('terminalInput');
    const screen = document.getElementById('terminalScreen');
    const meta = document.getElementById('terminalMeta');
    const footer = document.getElementById('terminalFooter');
    const modeToggle = document.getElementById('mode1963');
    const charCount = document.getElementById('charCount');
    const filteredCount = document.getElementById('filteredCount');
    const demo1 = document.getElementById('demoLine1');
    const demo2 = document.getElementById('demoLine2');
    const demo3 = document.getElementById('demoLine3');
    const clearBtn = document.getElementById('clearTerminal');
    const bitGrid = document.getElementById('bitGrid');

    // 7-bit grid visual
    if (bitGrid) {
        for (let i = 0; i < 7; i++) {
            const d = document.createElement('div');
            d.className = 'cell';
            bitGrid.appendChild(d);
        }
        function setBits(n) {
            const cells = bitGrid.querySelectorAll('.cell');
            cells.forEach((c, i) => c.classList.toggle('on', (n >> i) & 1));
        }
        setBits(127); // show all 7 bits "on"
    }

    const facts = [
        "ASCII started as a 7‑bit code so it fit into early hardware and left room for parity.",
        "1963 ASCII had NO lowercase; they arrived in 1967.",
        "Control codes like BEL (\\x07) could make a teletype ring a bell.",
        "Early modems often used ASCII for plain text exchange and device control.",
        "The space character is the most frequent in English text."
    ];

    const factBox = document.getElementById('factText');
    const nextFact = document.getElementById('nextFact');
    let factIndex = 0;
    nextFact?.addEventListener('click', () => {
        factIndex = (factIndex + 1) % facts.length;
        factBox.textContent = facts[factIndex];
    });

    // Timeline chips
    const dots = document.querySelectorAll('.mini-dot');
    const infoYear = document.querySelector('.mini-year');
    const infoText = document.querySelector('.mini-text');
    dots.forEach(btn => {
        btn.addEventListener('click', () => {
            dots.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            infoYear.textContent = btn.dataset.year;
            infoText.textContent = btn.dataset.text;
        });
    });

    // 1963 mode filtering
    const allowedPunct = " .,!?:;'\"()-/\\&@#$%*+=<>[]{}_–—–—"; // keep some basics (dashes included)
    function filter1963(str) {
        let removed = 0;
        let out = "";
        for (const ch of str) {
            const code = ch.codePointAt(0);
            if (code >= 0x41 && code <= 0x5A) { out += ch; continue; }               // A-Z
            if (code >= 0x30 && code <= 0x39) { out += ch; continue; }               // 0-9
            if (ch === ' ' || allowedPunct.includes(ch)) { out += ch; continue; }    // basic punct/space
            if (code >= 0x61 && code <= 0x7A) { out += ch.toUpperCase(); continue; } // map a-z -> A-Z (but original 1963 had no lowercase)
            removed++;
        }
        return { out, removed };
    }

    function updateFooter(text, removed) {
        charCount.textContent = String(text.length);
        filteredCount.textContent = String(removed);
    }

    function echo(line) {
        const el = document.createElement('div');
        el.className = 'line';
        el.innerHTML = '&nbsp;' + line.replace(/</g, '&lt;');
        screen.insertBefore(el, screen.children[screen.children.length - 2]); // above input line
        screen.scrollTop = screen.scrollHeight;
    }

    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = input.value;
            const filtered = modeToggle?.checked ? filter1963(raw) : { out: raw, removed: 0 };
            echo(filtered.out);
            updateFooter(filtered.out, filtered.removed);
            input.value = '';
            e.preventDefault();
        }
    });

    function loadDemo(text) {
        if (input) {
            input.value = text;
            input.focus();
        }
    }
    demo1?.addEventListener('click', () => loadDemo('hello world!'));
    demo2?.addEventListener('click', () => loadDemo('naïve café'));
    demo3?.addEventListener('click', () => loadDemo('Привет'));

    clearBtn?.addEventListener('click', () => {
        const lines = Array.from(screen.querySelectorAll('.line')).slice(0, -2);
        lines.forEach(l => l.remove());
        updateFooter('', 0);
        input.value = '';
    });

    // Update meta on toggle
    modeToggle?.addEventListener('change', () => {
        if (modeToggle.checked) {
            meta.textContent = 'Allowed: A–Z, digits, basic punctuation • 7-bit only';
        } else {
            meta.textContent = 'Modern Mode: A multitude of scripts and emoji';
        }
    });
})();
// this is the end of the retro terminal demo (for ref)

// Emoji Visualization
function initEmojiVisualization() {
    setupEmojiControls();
    createEmojiVisualization();
    updateVersionDisplay(currentVersion);
}

function setupEmojiControls() {
    // Timeline slider
    const timeline = document.getElementById('emojiTimeline');
    timeline.addEventListener('input', (e) => {
        currentVersion = parseFloat(e.target.value);
        updateVersionDisplay(currentVersion);
        updateEmojiVisualization();
    });

    // Category filters
    const categories = ['smileys', 'people', 'animals', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags'];
    categories.forEach(category => {
        const checkbox = document.getElementById(`filter-${category}`);
        if (checkbox) {
            checkbox.addEventListener('change', updateEmojiFilters);
        }
    });

    // Region buttons
    const regionButtons = document.querySelectorAll('.region-btn');
    regionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            regionButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update data
            const region = btn.dataset.region;
            currentRegion = region;

            if (region === 'us') {
                currentEmojiData = emojiDataUS;
            } else if (region === 'uk') {
                currentEmojiData = emojiDataUK;
            } else {
                currentEmojiData = emojiDataAll;
            }

            updateEmojiVisualization(true); // true for smooth transition
        });
    });
}


// Interactive timeline logic
const steps = document.querySelectorAll('.timeline-step');
const yearDisplay = document.querySelector('.timeline-year');
const textDisplay = document.querySelector('.timeline-description');

steps.forEach(step => {
    step.addEventListener('click', () => {
        steps.forEach(s => s.classList.remove('active'));
        step.classList.add('active');
        yearDisplay.textContent = step.getAttribute('data-year');
        textDisplay.textContent = step.getAttribute('data-text');
    });
});


function updateVersionDisplay(version) {
    const versionDisplay = document.querySelector('.version-year');
    const descriptionDisplay = document.querySelector('.version-number');

    versionDisplay.textContent = `v${version}`;

    // Count how many emojis are included up to this version
    const count = currentEmojiData.filter(d => d.version <= version).length;
    descriptionDisplay.textContent = `${count.toLocaleString()} emojis`;
}

function createEmojiVisualization() {
    const container = document.querySelector('.emoji-viz-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select('#emojiViz')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create force simulation with stronger centering
    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-30))
        .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05))
        .force('collision', d3.forceCollide().radius(d => d.radius + 3).strength(0.9));

    // Store simulation for updates
    window.emojiSimulation = simulation;
    window.emojiDimensions = { width, height };

    updateEmojiVisualization();
}

function updateEmojiVisualization(smooth = false) {
    const svg = d3.select('#emojiViz');
    const container = document.querySelector('.emoji-viz-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Filter data by version
    let filteredData = currentEmojiData.filter(d => d.version <= currentVersion);

    // Get active category filters
    const categoryFilters = {
        'Smileys & Emotion': document.getElementById('filter-smileys').checked,
        'People & Body': document.getElementById('filter-people').checked,
        'Animals & Nature': document.getElementById('filter-animals').checked,
        'Food & Drink': document.getElementById('filter-food').checked,
        'Travel & Places': document.getElementById('filter-travel').checked,
        'Activities': document.getElementById('filter-activities').checked,
        'Objects': document.getElementById('filter-objects').checked,
        'Symbols': document.getElementById('filter-symbols').checked,
        'Flags': document.getElementById('filter-flags').checked
    };

    // Filter by categories
    filteredData = filteredData.filter(d => categoryFilters[d.category]);

    // Take top 200 emojis for performance
    filteredData = filteredData.slice(0, 200);

    // Calculate radius based on rank (count)
    const maxCount = d3.max(filteredData, d => d.count) || 1;
    const radiusScale = d3.scaleSqrt()
        .domain([0, maxCount])
        .range([12, 40]);

    // Add radius to data
    filteredData.forEach(d => {
        d.radius = radiusScale(d.count);
    });

    // Color scale by category
    const categoryColors = {
        'Smileys & Emotion': '#72c9cd',
        'People & Body': '#e06b9a',
        'Animals & Nature': '#8fa55d',
        'Food & Drink': '#d4a574',
        'Travel & Places': '#7aa2f7',
        'Activities': '#bb9af7',
        'Objects': '#9b9b9b',
        'Symbols': '#ff6b6b',
        'Flags': '#f4d03f'
    };

    // Update simulation
    const simulation = window.emojiSimulation;
    const dims = window.emojiDimensions || { width, height };

    simulation.nodes(filteredData);
    simulation.force('collision').radius(d => d.radius + 3);
    simulation.force('center', d3.forceCenter(dims.width / 2, dims.height / 2).strength(0.1));
    simulation.force('x', d3.forceX(dims.width / 2).strength(0.05));
    simulation.force('y', d3.forceY(dims.height / 2).strength(0.05));
    simulation.alpha(0.8).restart();

    // Bind data
    const nodes = svg.selectAll('.emoji-node')
        .data(filteredData, d => d.emoji);

    // Exit
    nodes.exit()
        .transition()
        .duration(smooth ? 500 : 0)
        .style('opacity', 0)
        .remove();

    // Enter
    const nodesEnter = nodes.enter()
        .append('g')
        .attr('class', 'emoji-node')
        .style('opacity', 0);

    nodesEnter.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => categoryColors[d.category] || '#666')
        .attr('fill-opacity', 0.3)
        .attr('stroke', d => categoryColors[d.category] || '#666')
        .attr('stroke-width', 2);

    nodesEnter.append('text')
        .text(d => d.emoji)
        .attr('font-size', d => Math.max(d.radius * 0.8, 14));

    // Merge
    const allNodes = nodesEnter.merge(nodes);

    allNodes.transition()
        .duration(smooth ? 500 : 0)
        .style('opacity', 1);

    allNodes.select('circle')
        .transition()
        .duration(smooth ? 500 : 0)
        .attr('r', d => d.radius);

    allNodes.select('text')
        .transition()
        .duration(smooth ? 500 : 0)
        .attr('font-size', d => Math.max(d.radius * 0.8, 14));

    // Event handlers
    allNodes
        .on('mouseenter', function (event, d) {
            showEmojiTooltip(event, d);
            d3.select(this).select('circle')
                .attr('fill-opacity', 0.5)
                .attr('stroke-width', 3);
        })
        .on('mousemove', moveEmojiTooltip)
        .on('mouseleave', function () {
            hideEmojiTooltip();
            d3.select(this).select('circle')
                .attr('fill-opacity', 0.3)
                .attr('stroke-width', 2);
        });

    // Update positions on tick with better boundary control
    simulation.on('tick', () => {
        const padding = 10;
        allNodes.attr('transform', d => {
            // Constrain to inner area with padding
            d.x = Math.max(d.radius + padding, Math.min(width - d.radius - padding, d.x));
            d.y = Math.max(d.radius + padding, Math.min(height - d.radius - padding, d.y));
            return `translate(${d.x},${d.y})`;
        });
    });
}

function updateEmojiFilters() {
    updateEmojiVisualization();
}

function showEmojiTooltip(event, d) {
    const tooltip = document.getElementById('emojiTooltip');

    // Find rank
    const rank = currentEmojiData.findIndex(e => e.emoji === d.emoji) + 1;

    tooltip.innerHTML = `
        <div class="tooltip-emoji">${d.emoji}</div>
        <div class="tooltip-name">${d.name}</div>
        <div class="tooltip-info">
            <span class="tooltip-rank">#${rank} most used</span>
            <span>Category: ${d.category}</span>
            <span>Subgroup: ${d.subgroup}</span>
            <span>Version: ${d.version}</span>
            <span>Count: ${d.count.toLocaleString()}</span>
        </div>
    `;

    tooltip.classList.remove('hidden');
    moveEmojiTooltip(event);
}

function moveEmojiTooltip(event) {
    const tooltip = document.getElementById('emojiTooltip');
    const container = document.querySelector('.emoji-viz-container');
    const rect = container.getBoundingClientRect();

    let x = event.clientX - rect.left + 10;
    let y = event.clientY - rect.top + 10;

    // Keep tooltip within bounds
    const tooltipRect = tooltip.getBoundingClientRect();
    if (x + tooltipRect.width > rect.width) {
        x = event.clientX - rect.left - tooltipRect.width - 10;
    }
    if (y + tooltipRect.height > rect.height) {
        y = event.clientY - rect.top - tooltipRect.height - 10;
    }

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

function hideEmojiTooltip() {
    const tooltip = document.getElementById('emojiTooltip');
    tooltip.classList.add('hidden');
}

(function () {
    const stats = document.querySelectorAll('#section-conclusion .stat-num');
    const gallery = document.getElementById('conclusionGallery');
    const buttons = document.querySelectorAll('#section-conclusion .card-more');

    // count-up animation
    function animateCount(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (!target) return;
        let current = 0;
        const duration = 900; // ms
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            current = Math.floor(target * eased);
            el.textContent = current.toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // trigger count-up when section comes into view
    const section = document.getElementById('section-conclusion');
    if (section) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    stats.forEach(animateCount);
                    io.disconnect();
                }
            });
        }, { threshold: 0.5 });
        io.observe(section);
    }

    // simple gallery focus switch
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.card;
            const items = Array.from(gallery.querySelectorAll('.gallery-item'));
            items.forEach((it, i) => it.style.opacity = '0.45');

            const map = { design: 0, inclusion: 1, expression: 2 };
            const idx = map[key];
            if (idx != null && items[idx]) {
                items[idx].style.opacity = '1';
                items[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        });
    });
})();

// Emoji Fun Quiz
(function () {
    const groups = Array.from(document.querySelectorAll('#section-emoji-quiz .pill-group'));
    if (!groups.length) return;

    // simple scoring: dimensions map to archetypes
    const archetypes = {
        robot: { emoji: '🤖', title: 'The Focused Robot', text: 'Calm, methodical, and quietly unstoppable. Low drama, high output.' },
        party: { emoji: '🥳', title: 'The Party Popper', text: 'High energy, social, and ready to celebrate the little wins.' },
        cool: { emoji: '😎', title: 'The Cool Sunbeam', text: 'Chill, sunny mood, and unbothered. Vibes on cruise control.' },
        chaos: { emoji: '😵‍💫', title: 'The Whirlwind', text: 'Brain tabs: 87. Coffee: yes. Plans: pending. You\'ll still make it work.' },
        think: { emoji: '🤔', title: 'The Thinky Face', text: 'Curious, analytical, always connecting dots and asking better questions.' },
        cozy: { emoji: '😌', title: 'The Cozy Cloud', text: 'Soft focus, gentle pace, big on comfort and care.' },
        rage: { emoji: '😤', title: 'The Determined Puff', text: 'Grit online. Obstacles are fuel. You\'re here to push through.' },
        fragile: { emoji: '😬', title: 'The Yikes Face', text: 'Slightly crunchy on the outside, tender on the inside. Still showing up.' },
        lol: { emoji: '😂', title: 'The Chaos Jester', text: 'If you don\'t laugh you\'ll cry—but mostly you laugh.' },
    };

    function score(selections) {
        // initialize
        const s = { robot: 0, party: 0, cool: 0, chaos: 0, think: 0, cozy: 0, rage: 0, fragile: 0, lol: 0 };

        // mapping per question
        switch (selections.energy) {
            case 'low': s.cozy += 2; s.robot += 1; break;
            case 'mid': s.cool += 2; break;
            case 'high': s.party += 2; s.rage += 1; break;
        }
        switch (selections.social) {
            case 'solo': s.robot += 2; s.think += 1; break;
            case 'chill': s.cool += 2; s.cozy += 1; break;
            case 'party': s.party += 3; break;
        }
        switch (selections.head) {
            case 'zen': s.cozy += 2; s.cool += 1; break;
            case 'think': s.think += 3; break;
            case 'chaos': s.chaos += 3; s.lol += 1; break;
        }
        switch (selections.weather) {
            case 'sunny': s.cool += 2; break;
            case 'cloudy': s.cozy += 2; break;
            case 'stormy': s.rage += 2; s.fragile += 1; break;
        }
        switch (selections.focus) {
            case 'distracted': s.chaos += 2; s.fragile += 1; break;
            case 'steady': s.cool += 1; s.cozy += 1; s.robot += 1; break;
            case 'locked': s.robot += 3; break;
        }
        switch (selections.curve) {
            case 'lol': s.lol += 3; break;
            case 'cope': s.fragile += 3; break;
            case 'fight': s.rage += 3; break;
        }

        // winner
        let bestKey = 'cool', best = -1;
        for (const [k, v] of Object.entries(s)) {
            if (v > best) { best = v; bestKey = k; }
        }
        return archetypes[bestKey];
    }

    function selections() {
        const out = {};
        groups.forEach(g => {
            const key = g.dataset.q;
            const active = g.querySelector('.pill.active');
            out[key] = active ? active.dataset.v : null;
        });
        return out;
    }

    function allAnswered(sel) {
        return Object.values(sel).every(Boolean);
    }

    // UI bindings
    groups.forEach(g => {
        g.addEventListener('click', (e) => {
            const pill = e.target.closest('.pill');
            if (!pill) return;
            g.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    const reveal = document.getElementById('emojiQuizReveal');
    const reset = document.getElementById('emojiQuizReset');
    const resultBox = document.getElementById('emojiQuizResult');
    const resultEmoji = document.getElementById('resultEmoji');
    const resultTitle = document.getElementById('resultTitle');
    const resultText = document.getElementById('resultText');
    const copyBtn = document.getElementById('copyResult');
    const copyStatus = document.getElementById('copyStatus');

    reveal?.addEventListener('click', () => {
        const sel = selections();
        if (!allAnswered(sel)) {
            copyStatus.textContent = 'Answer all 6 to reveal!';
            setTimeout(() => copyStatus.textContent = '', 1200);
            return;
        }
        const r = score(sel);
        resultEmoji.textContent = r.emoji;
        resultTitle.textContent = `You're… ${r.title}`;
        resultText.textContent = r.text;
        resultBox.classList.remove('hidden');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    reset?.addEventListener('click', () => {
        groups.forEach(g => g.querySelectorAll('.pill').forEach(p => p.classList.remove('active')));
        resultBox.classList.add('hidden');
        copyStatus.textContent = '';
    });

    copyBtn?.addEventListener('click', async () => {
        const text = `${resultEmoji.textContent} ${resultTitle.textContent} — ${resultText.textContent}`;
        try {
            await navigator.clipboard.writeText(text);
            copyStatus.textContent = 'Copied!';
            setTimeout(() => copyStatus.textContent = '', 1200);
        } catch (e) {
            copyStatus.textContent = 'Copy failed';
            setTimeout(() => copyStatus.textContent = '', 1200);
        }
    });
})();
// this is the end of the emoji quiz (for ref)

// ~~~~~~~~~~~~~~~~~~~~~
// INTERACTIVE TIMELINE
// ~~~~~~~~~~~~~~~~~~~~~
function initInteractiveTimeline() {
    const markersContainer = document.getElementById('timelineMarkers');
    const cardsContainer = document.getElementById('timelineCards');

    if (!markersContainer || !cardsContainer) return;

    // Calculate year range for proportional positioning
    const minYear = Math.min(...timelineData.map(d => d.year)); // 1837
    const maxYear = Math.max(...timelineData.map(d => d.year)); // 1991
    const yearRange = maxYear - minYear;

    // Define adjusted positions that are "kind of to scale" but spread out for legibility
    // These are kind of arbitrary but we are trying to balance spacing
    const adjustedPositions = {
        1837: 0,      // Start
        1874: 18,     // Keep distance from 1837
        1961: 54,     // Compress middle section
        1963: 58,     // Spread out from 1961
        1967: 67,     // Spread out from 1963
        1968: 70,     // Spread out from 1967
        1987: 95,     // Spread out from 1968
        1991: 100     // End
    };

    // Create markers with adjusted positioning
    timelineData.forEach((item, index) => {
        const marker = document.createElement('div');
        marker.className = 'timeline-marker' + (index === 0 ? ' active' : '');
        marker.dataset.index = index;

        // Use adjusted position if available, otherwise calculate proportionally
        const position = adjustedPositions[item.year] !== undefined
            ? adjustedPositions[item.year]
            : ((item.year - minYear) / yearRange) * 100;

        marker.style.left = `${position}%`;

        marker.innerHTML = `
            <div class="timeline-marker-dot"></div>
            <span class="timeline-marker-year">${item.year}</span>
        `;
        marker.addEventListener('click', () => selectTimelineItem(index));
        markersContainer.appendChild(marker);
    });

    // Create cards
    timelineData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'timeline-card' + (index === 0 ? ' active' : '');
        card.dataset.index = index;
        card.innerHTML = `
            <div class="timeline-card-header">
                <span class="timeline-card-year">${item.year}</span>
                <h3 class="timeline-card-title">${item.title}</h3>
            </div>
            <p class="timeline-card-content">${item.content}</p>
        `;
        cardsContainer.appendChild(card);
    });
}

function selectTimelineItem(index) {
    // Update markers
    document.querySelectorAll('.timeline-marker').forEach((m, i) => {
        m.classList.toggle('active', i === index);
    });

    // Update cards
    document.querySelectorAll('.timeline-card').forEach((c, i) => {
        c.classList.toggle('active', i === index);
    });
}

function initUnicodeTypewriterTitle() {
    const title = document.getElementById('running-transition-ascii');
    const section = document.getElementById('section-unicode-intro');
    if (!title || !section) return;

    const basePrefix = 'From ASCII to ';
    // Sequence of words the title will cycle through
    const variants = [
        // 'ASCII',    // From ASCII to ASCII (removed due to confusion)
        'Unicode',  // From ASCII to Unicode (English)
        'Юникод',   // Russian
        '统一码',    // Chinese
        'ユニコード', // Japanese (Katakana)
        '유니코드',  // Korean
        'יוניקוד',  // Hebrew
        'यूनिकोड',  // Hindi
        'Unicode'   // Final resting word
    ];

    let hasPlayed = false;

    function typeWord(word, onDone) {
        let i = 0;
        title.classList.add('title-typewriter');

        function step() {
            if (i <= word.length) {
                title.textContent = basePrefix + word.slice(0, i);
                i++;
                setTimeout(step, 90); // typing speed
            } else {
                setTimeout(onDone, 700); // pause before backspace
            }
        }

        step();
    }

    function backspaceWord(word, onDone) {
        let len = word.length;

        function step() {
            if (len >= 0) {
                title.textContent = basePrefix + word.slice(0, len);
                len--;
                setTimeout(step, 60); // backspace speed
            } else {
                setTimeout(onDone, 180); // tiny pause before next word
            }
        }

        step();
    }

    function playSequence() {
        if (hasPlayed) return;
        hasPlayed = true;

        let index = 0;

        function runNext() {
            // If we are at the last variant, just type it and stop
            if (index === variants.length - 1) {
                typeWord(variants[index], () => {
                    // keep final text, remove caret
                    title.classList.remove('title-typewriter');
                });
                return;
            }

            const currentWord = variants[index];

            // Type current word, then backspace it, then move to next variant
            typeWord(currentWord, () => {
                backspaceWord(currentWord, () => {
                    index++;
                    runNext();
                });
            });
        }

        runNext();
    }

    // Use IntersectionObserver so it plays when the section scrolls into view
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.target !== section) return;
                if (entry.isIntersecting) {
                    playSequence();
                }
            });
        },
        { root: null, threshold: 0.3 }
    );

    observer.observe(section);
}

// Make sure this is called on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initUnicodeTypewriterTitle();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Sankey diagram (EVOLUTION OF UNICODE)
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initSankeyDiagram() {
    const slider = document.getElementById('sankeyYearSlider');
    const yearDisplay = document.getElementById('sankeyYearDisplay');

    if (!slider) return;

    // Initial render
    createSankeyDiagram(2025);

    // Slider interaction
    slider.addEventListener('input', (e) => {
        const year = parseInt(e.target.value);
        yearDisplay.textContent = year;
        createSankeyDiagram(year);
    });
}

function createSankeyDiagram(maxYear) {
    const container = document.querySelector('.sankey-viz-wrapper');
    const svg = d3.select('#sankeyChart');

    if (!container || !svg.node()) return;

    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${container.clientWidth} 400`);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter versions by year
    const filteredVersions = unicodeVersionData.filter(v => v.year <= maxYear);

    // Update stats
    const lastVersion = filteredVersions[filteredVersions.length - 1];
    document.getElementById('totalCharsCount').textContent = lastVersion ? lastVersion.chars.toLocaleString() : '0';
    document.getElementById('versionsShown').textContent = filteredVersions.length;

    // Count scripts by filtering languageData
    const scriptsCount = languageData.filter(s => s.yearEncoded && s.yearEncoded <= maxYear).length;
    document.getElementById('totalScriptsCount').textContent = scriptsCount || languageData.length;

    // Create simplified flow data for visualization
    // Group additions by category
    const categories = ['Han/CJK', 'Latin Extended', 'Arabic/Hebrew', 'Indic Scripts', 'Symbols/Emoji', 'Historic Scripts', 'Other Scripts'];
    const categoryColors = ['#e06b9a', '#72c9cd', '#8fa55d', '#d4a574', '#f4d03f', '#9b9b9b', '#6fcf97'];

    // Create nodes (versions on left, categories on right)
    const nodes = [];
    const links = [];

    // Add version nodes
    const majorVersions = filteredVersions.filter((v, i) =>
        i === 0 || v.chars - filteredVersions[i - 1].chars > 1000 || v.version.includes('.0')
    ).slice(-8); // Show last 8 major versions

    majorVersions.forEach((v, i) => {
        nodes.push({ name: `v${v.version}`, type: 'version', index: i });
    });

    // Add category nodes
    categories.forEach((cat, i) => {
        nodes.push({ name: cat, type: 'category', index: majorVersions.length + i, color: categoryColors[i] });
    });

    // Create links (simplified distribution)
    majorVersions.forEach((v, vIndex) => {
        const prevChars = vIndex > 0 ? majorVersions[vIndex - 1].chars : 0;
        const added = v.chars - prevChars;

        if (added > 0) {
            // Distribute additions across categories (simplified estimation)
            const distributions = [
                0.6,  // Han/CJK (dominant)
                0.08, // Latin Extended
                0.05, // Arabic/Hebrew
                0.08, // Indic Scripts
                0.07, // Symbols/Emoji
                0.06, // Historic Scripts
                0.06  // Other Scripts
            ];

            distributions.forEach((ratio, catIndex) => {
                const value = Math.max(added * ratio, 100);
                links.push({
                    source: vIndex,
                    target: majorVersions.length + catIndex,
                    value: value
                });
            });
        }
    });

    // Create sankey layout
    const sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(15)
        .extent([[0, 0], [width, height]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
        nodes: nodes.map(d => Object.assign({}, d)),
        links: links.map(d => Object.assign({}, d))
    });

    // Draw links
    g.append('g')
        .selectAll('path')
        .data(sankeyLinks)
        .join('path')
        .attr('class', 'sankey-link')
        .attr('d', d3.sankeyLinkHorizontal())
        .attr('stroke', d => {
            const targetNode = sankeyNodes[d.target.index];
            return targetNode.color || '#666';
        })
        .attr('stroke-width', d => Math.max(1, d.width))
        .on('mouseenter', function (event, d) {
            d3.select(this).attr('stroke-opacity', 0.7);
            showSankeyTooltip(event, d, sankeyNodes);
        })
        .on('mouseleave', function () {
            d3.select(this).attr('stroke-opacity', 0.4);
            hideSankeyTooltip();
        });

    // Draw nodes
    const node = g.append('g')
        .selectAll('g')
        .data(sankeyNodes)
        .join('g')
        .attr('class', 'sankey-node');

    node.append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => Math.max(d.y1 - d.y0, 1))
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', d => d.color || '#72c9cd');

    node.append('text')
        .attr('x', d => d.x0 < width / 2 ? d.x0 - 6 : d.x1 + 6)
        .attr('y', d => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.x0 < width / 2 ? 'end' : 'start')
        .text(d => d.name);

    // Create legend
    createSankeyLegend(categories, categoryColors);
}

function createSankeyLegend(categories, colors) {
    const legend = document.getElementById('sankeyLegend');
    if (!legend) return;

    legend.innerHTML = categories.map((cat, i) => `
        <div class="sankey-legend-item">
            <div class="sankey-legend-color" style="background: ${colors[i]}"></div>
            <span>${cat}</span>
        </div>
    `).join('');
}

function showSankeyTooltip(event, d, nodes) {
    const tooltip = document.getElementById('sankeyTooltip');
    const source = nodes[d.source.index];
    const target = nodes[d.target.index];

    tooltip.innerHTML = `
        <strong>${source.name} → ${target.name}</strong><br>
        ~${Math.round(d.value).toLocaleString()} characters
    `;
    tooltip.classList.remove('hidden');

    const rect = tooltip.parentElement.getBoundingClientRect();
    tooltip.style.left = (event.clientX - rect.left + 10) + 'px';
    tooltip.style.top = (event.clientY - rect.top + 10) + 'px';
}

function hideSankeyTooltip() {
    const tooltip = document.getElementById('sankeyTooltip');
    tooltip.classList.add('hidden');
}

// ~~~~~~~~~~~~~~~~~
// UNICODE UNIVERSE 
// ~~~~~~~~~~~~~~~~~
let universeScriptData = [];
let selectedScript = null;
let currentUniverseFilter = 'all';

async function initUnicodeUniverse() {
    prepareUniverseData();
    createScriptList();
    setupUniverseControlsV2();
    await initWorldMap();
}

function prepareUniverseData() {
    // Calculate total characters for percentage
    const totalChars = languageData.reduce((sum, d) => sum + (d.charCount || 0), 0);

    universeScriptData = languageData
        .filter(d => d.charCount && d.charCount > 0)
        .map(d => ({
            name: d.script,
            value: d.charCount,
            percentage: ((d.charCount / totalChars) * 100),
            version: d.unicode_version,
            year: d.yearEncoded || d.year_first_encoded,
            geography: d.geography_summary,
            languages: d.languages_examples,
            iso_code: d.iso_code,
            region: categorizeRegion(d.geography_summary)
        }))
        .sort((a, b) => b.value - a.value);
}

function createScriptList() {
    const listContainer = document.getElementById('universeScriptList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Find max value for bar scaling
    const maxValue = universeScriptData.length > 0 ? universeScriptData[0].value : 1;

    universeScriptData.forEach((script, index) => {
        const item = document.createElement('div');
        item.className = 'script-list-item';
        item.dataset.index = index;
        item.dataset.region = script.region;
        item.dataset.name = script.name.toLowerCase();
        item.dataset.languages = (script.languages || '').toLowerCase();

        const barWidth = (script.value / maxValue) * 100;

        item.innerHTML = `
            <div class="script-item-header">
                <span class="script-item-name">${script.name}</span>
                <span class="script-item-count"><span class="count-num">${script.value.toLocaleString()}</span> characters</span>
            </div>
            <div class="script-item-bar">
                <div class="script-item-bar-fill" style="width: ${barWidth}%"></div>
            </div>
        `;

        item.addEventListener('click', () => selectScript(index));

        listContainer.appendChild(item);
    });
}

function setupUniverseControlsV2() {
    // Region filter buttons
    const regionBtns = document.querySelectorAll('.universe-region-btn-v2');
    regionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            regionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentUniverseFilter = btn.dataset.region;
            filterScriptList();
        });
    });

    // Search input
    const searchInput = document.getElementById('scriptSearchV2');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterScriptList(e.target.value);
        });
    }

    // Regenerate characters button
    const regenBtn = document.getElementById('charRegenerateBtn');
    if (regenBtn) {
        regenBtn.addEventListener('click', () => {
            if (selectedScript !== null) {
                generateRandomCharacters(universeScriptData[selectedScript]);
            }
        });
    }
}

function filterScriptList(searchQuery = '') {
    const items = document.querySelectorAll('.script-list-item');
    const q = searchQuery.toLowerCase().trim();

    items.forEach(item => {
        const region = item.dataset.region;
        const name = item.dataset.name;
        const languages = item.dataset.languages;

        let visible = true;

        // Apply region filter
        if (currentUniverseFilter !== 'all' && region !== currentUniverseFilter) {
            visible = false;
        }

        // Apply search filter
        if (q && !name.includes(q) && !languages.includes(q)) {
            visible = false;
        }

        item.classList.toggle('filtered', !visible);
    });
}

function selectScript(index) {
    selectedScript = index;
    const script = universeScriptData[index];

    // Update list item active states
    document.querySelectorAll('.script-list-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // Show details panel, hide empty state
    document.getElementById('universeEmptyState').classList.add('hidden');
    document.getElementById('universeScriptDetails').classList.remove('hidden');

    // Add has-selection class to container for solid border
    document.getElementById('universeDetailsContainer').classList.add('has-selection');

    // Update script info
    document.getElementById('scriptInfoName').textContent = script.name;
    document.getElementById('scriptInfoChars').textContent = script.value.toLocaleString();
    document.getElementById('scriptInfoVersion').textContent = script.version || 'N/A';
    document.getElementById('scriptInfoYear').textContent = script.year || 'N/A';
    document.getElementById('scriptInfoLanguages').textContent = script.languages || 'Various';

    // Update map
    updateWorldMap(script);

    // Update regions text
    document.getElementById('mapRegionsText').textContent =
        script.geography ? `Regions: ${script.geography}` : '';

    // Generate random characters
    generateRandomCharacters(script);
}

function categorizeRegion(geography) {
    if (!geography) return 'worldwide';
    const geo = geography.toLowerCase();
    if (geo.includes('historic') || geo.includes('ancient')) return 'historic';
    if (geo.includes('china') || geo.includes('japan') || geo.includes('korea') || geo.includes('india') ||
        geo.includes('asia') || geo.includes('thai') || geo.includes('vietnam') || geo.includes('cambodia') ||
        geo.includes('myanmar') || geo.includes('laos') || geo.includes('tibet') || geo.includes('nepal') ||
        geo.includes('bangladesh') || geo.includes('sri lanka') || geo.includes('pakistan') ||
        geo.includes('afghanistan') || geo.includes('indonesia') || geo.includes('malaysia') ||
        geo.includes('philippines') || geo.includes('mongolia')) return 'asia';
    if (geo.includes('europe') || geo.includes('russia') || geo.includes('greece') || geo.includes('german') ||
        geo.includes('georgia') || geo.includes('armenia') || geo.includes('ukraine') || geo.includes('bulgaria') ||
        geo.includes('serbia') || geo.includes('scandinavia') || geo.includes('ireland') || geo.includes('uk') ||
        geo.includes('british') || geo.includes('hungary') || geo.includes('albania') || geo.includes('cyprus')) return 'europe';
    if (geo.includes('africa') || geo.includes('egypt') || geo.includes('ethiop') || geo.includes('nigeria') ||
        geo.includes('liberia') || geo.includes('sierra leone') || geo.includes('cameroon') || geo.includes('chad') ||
        geo.includes('sudan') || geo.includes('morocco') || geo.includes('algeria') || geo.includes('libya') ||
        geo.includes('mali') || geo.includes('niger') || geo.includes('somalia') || geo.includes('eritrea')) return 'africa';
    if (geo.includes('america') || geo.includes('canada') || geo.includes('cherokee') || geo.includes('united states') ||
        geo.includes('oklahoma') || geo.includes('alaska')) return 'americas';
    if (geo.includes('middle east') || geo.includes('iran') || geo.includes('iraq') || geo.includes('syria') ||
        geo.includes('israel') || geo.includes('jordan') || geo.includes('saudi') || geo.includes('yemen') ||
        geo.includes('turkey') || geo.includes('maldives')) return 'asia';
    return 'worldwide';
}

// World map data - will be loaded from TopoJSON
let worldMapData = null;
let worldMapProjection = null;
let worldMapPathGenerator = null;

// Country name to ISO code mappings for geography text matching
const countryNameMappings = {
    // East Asia
    'china': ['China', 'Taiwan'],
    'taiwan': ['Taiwan'],
    'japan': ['Japan'],
    'korea': ['South Korea', 'North Korea'],
    'south korea': ['South Korea'],
    'north korea': ['North Korea'],
    'mongolia': ['Mongolia'],

    // Southeast Asia
    'vietnam': ['Vietnam'],
    'thailand': ['Thailand'],
    'cambodia': ['Cambodia'],
    'myanmar': ['Myanmar'],
    'burma': ['Myanmar'],
    'laos': ['Laos'],
    'indonesia': ['Indonesia'],
    'malaysia': ['Malaysia'],
    'philippines': ['Philippines'],
    'singapore': ['Singapore'],
    'brunei': ['Brunei'],

    // South Asia
    'india': ['India'],
    'pakistan': ['Pakistan'],
    'bangladesh': ['Bangladesh'],
    'sri lanka': ['Sri Lanka'],
    'nepal': ['Nepal'],
    'bhutan': ['Bhutan'],
    'afghanistan': ['Afghanistan'],
    'maldives': ['Maldives'],

    // Central Asia
    'kazakhstan': ['Kazakhstan'],
    'uzbekistan': ['Uzbekistan'],
    'turkmenistan': ['Turkmenistan'],
    'kyrgyzstan': ['Kyrgyzstan'],
    'tajikistan': ['Tajikistan'],

    // Middle East
    'iran': ['Iran'],
    'iraq': ['Iraq'],
    'syria': ['Syria'],
    'israel': ['Israel'],
    'palestine': ['Palestine'],
    'jordan': ['Jordan'],
    'lebanon': ['Lebanon'],
    'saudi': ['Saudi Arabia'],
    'yemen': ['Yemen'],
    'oman': ['Oman'],
    'uae': ['United Arab Emirates'],
    'qatar': ['Qatar'],
    'bahrain': ['Bahrain'],
    'kuwait': ['Kuwait'],
    'turkey': ['Turkey'],

    // Europe
    'russia': ['Russia'],
    'ukraine': ['Ukraine'],
    'germany': ['Germany'],
    'german': ['Germany', 'Austria', 'Switzerland'],
    'france': ['France'],
    'spain': ['Spain'],
    'italy': ['Italy'],
    'greece': ['Greece'],
    'poland': ['Poland'],
    'romania': ['Romania'],
    'bulgaria': ['Bulgaria'],
    'serbia': ['Serbia'],
    'croatia': ['Croatia'],
    'hungary': ['Hungary'],
    'czech': ['Czechia'],
    'slovakia': ['Slovakia'],
    'austria': ['Austria'],
    'switzerland': ['Switzerland'],
    'netherlands': ['Netherlands'],
    'belgium': ['Belgium'],
    'portugal': ['Portugal'],
    'sweden': ['Sweden'],
    'norway': ['Norway'],
    'finland': ['Finland'],
    'denmark': ['Denmark'],
    'iceland': ['Iceland'],
    'ireland': ['Ireland'],
    'uk': ['United Kingdom'],
    'british': ['United Kingdom'],
    'england': ['United Kingdom'],
    'scotland': ['United Kingdom'],
    'wales': ['United Kingdom'],
    'georgia': ['Georgia'],
    'armenia': ['Armenia'],
    'azerbaijan': ['Azerbaijan'],
    'albania': ['Albania'],
    'cyprus': ['Cyprus'],
    'malta': ['Malta'],
    'slovenia': ['Slovenia'],
    'bosnia': ['Bosnia and Herz.'],
    'montenegro': ['Montenegro'],
    'macedonia': ['North Macedonia'],
    'kosovo': ['Kosovo'],
    'moldova': ['Moldova'],
    'belarus': ['Belarus'],
    'lithuania': ['Lithuania'],
    'latvia': ['Latvia'],
    'estonia': ['Estonia'],
    'scandinavia': ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'],

    // Africa
    'egypt': ['Egypt'],
    'ethiopia': ['Ethiopia'],
    'nigeria': ['Nigeria'],
    'south africa': ['South Africa'],
    'kenya': ['Kenya'],
    'tanzania': ['Tanzania'],
    'morocco': ['Morocco'],
    'algeria': ['Algeria'],
    'libya': ['Libya'],
    'tunisia': ['Tunisia'],
    'sudan': ['Sudan'],
    'eritrea': ['Eritrea'],
    'somalia': ['Somalia'],
    'mali': ['Mali'],
    'niger': ['Niger'],
    'chad': ['Chad'],
    'cameroon': ['Cameroon'],
    'liberia': ['Liberia'],
    'sierra leone': ['Sierra Leone'],
    'ghana': ['Ghana'],
    'senegal': ['Senegal'],

    // Americas
    'united states': ['United States of America'],
    'usa': ['United States of America'],
    'america': ['United States of America'],
    'canada': ['Canada'],
    'mexico': ['Mexico'],
    'brazil': ['Brazil'],
    'argentina': ['Argentina'],
    'chile': ['Chile'],
    'peru': ['Peru'],
    'colombia': ['Colombia'],
    'venezuela': ['Venezuela'],
    'cherokee': ['United States of America'],
    'oklahoma': ['United States of America'],
    'alaska': ['United States of America'],

    // Oceania
    'australia': ['Australia'],
    'new zealand': ['New Zealand'],
    'fiji': ['Fiji'],
    'papua': ['Papua New Guinea'],
    'pacific': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],

    // Regional/special terms
    'middle east': ['Iran', 'Iraq', 'Syria', 'Israel', 'Jordan', 'Lebanon', 'Saudi Arabia', 'Yemen', 'Oman', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Kuwait', 'Turkey'],
    'north africa': ['Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco'],
    'sub-saharan': ['Nigeria', 'Ethiopia', 'Kenya', 'Tanzania', 'South Africa', 'Ghana', 'Senegal', 'Mali', 'Niger', 'Chad', 'Cameroon'],
    'central asia': ['Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan'],
    'eastern europe': ['Russia', 'Ukraine', 'Belarus', 'Poland', 'Romania', 'Bulgaria', 'Hungary', 'Czechia', 'Slovakia', 'Moldova'],
    'west bengal': ['India'],
    'karnataka': ['India'],
    'kerala': ['India'],
    'tamil nadu': ['India'],
    'andhra pradesh': ['India'],
    'telangana': ['India'],
    'gujarat': ['India'],
    'punjab': ['India', 'Pakistan'],
    'odisha': ['India'],
    'tibet': ['China'],
    'inner mongolia': ['China'],
    'sichuan': ['China'],
    'yunnan': ['China'],
    'jewish': ['Israel'],
    'sikh': ['India'],
    'americas': ['United States of America', 'Canada', 'Mexico', 'Brazil', 'Argentina'],
    'europe': ['Germany', 'France', 'United Kingdom', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Greece', 'Portugal', 'Sweden', 'Austria', 'Switzerland'],
    'east africa': ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda'],
    'british isles': ['United Kingdom', 'Ireland'],

    // General regions
    'worldwide': 'all',
    'global': 'all',
    'accessibility': 'all',
    'diaspora': [],  // Don't highlight for diaspora
    'historic': []   // Don't highlight for historic
};

async function initWorldMap() {
    const svg = d3.select('#worldMapSvg');
    if (svg.empty()) return;

    // Clear existing content
    svg.selectAll('*').remove();

    // Get SVG dimensions
    const width = 400;
    const height = 200;

    // Set viewBox
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Create projection - using Natural Earth for better aesthetics
    worldMapProjection = d3.geoNaturalEarth1()
        .scale(width / 5.5)
        .translate([width / 2, height / 2]);

    // Create path generator
    worldMapPathGenerator = d3.geoPath().projection(worldMapProjection);

    // Create map group
    const mapGroup = svg.append('g').attr('class', 'world-map-group');

    try {
        // Load world map TopoJSON
        const worldData = await d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
        worldMapData = worldData;

        // Convert TopoJSON to GeoJSON features
        const countries = topojson.feature(worldData, worldData.objects.countries);

        // Draw countries
        mapGroup.selectAll('path.country')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', worldMapPathGenerator)
            .attr('data-name', d => d.properties.name || '')
            .attr('data-id', d => d.id || '');

    } catch (error) {
        console.error('Error loading world map:', error);
        // Fallback: show a simple placeholder
        mapGroup.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-color)')
            .text('Map unavailable');
    }
}

function updateWorldMap(script) {
    const geography = (script.geography || '').toLowerCase();

    // Reset all countries
    d3.selectAll('#worldMapSvg .country')
        .classed('highlighted', false);

    // If no geography info, return
    if (!geography) return;

    // Find matching countries
    const countriesToHighlight = new Set();

    // Check each keyword mapping
    for (const [keyword, countries] of Object.entries(countryNameMappings)) {
        if (geography.includes(keyword)) {
            if (countries === 'all') {
                // Highlight all countries
                d3.selectAll('#worldMapSvg .country')
                    .classed('highlighted', true);
                return;
            } else if (Array.isArray(countries)) {
                countries.forEach(c => countriesToHighlight.add(c));
            }
        }
    }

    // Highlight matching countries
    if (countriesToHighlight.size > 0) {
        d3.selectAll('#worldMapSvg .country')
            .classed('highlighted', function () {
                const name = d3.select(this).attr('data-name');
                return countriesToHighlight.has(name);
            });
    }
}

// Unicode ranges for different scripts
const scriptUnicodeRanges = {
    'Han': [[0x4E00, 0x9FFF], [0x3400, 0x4DBF]], // CJK Unified Ideographs
    'Hangul': [[0xAC00, 0xD7AF], [0x1100, 0x11FF]], // Hangul Syllables & Jamo
    'Latin': [[0x0041, 0x007A], [0x00C0, 0x00FF], [0x0100, 0x017F]], // Basic Latin & Extended
    'Arabic': [[0x0600, 0x06FF], [0x0750, 0x077F]],
    'Cyrillic': [[0x0400, 0x04FF]],
    'Greek': [[0x0370, 0x03FF]],
    'Hebrew': [[0x0590, 0x05FF]],
    'Devanagari': [[0x0900, 0x097F]],
    'Bengali': [[0x0980, 0x09FF]],
    'Tamil': [[0x0B80, 0x0BFF]],
    'Thai': [[0x0E00, 0x0E7F]],
    'Hiragana': [[0x3040, 0x309F]],
    'Katakana': [[0x30A0, 0x30FF]],
    'Georgian': [[0x10A0, 0x10FF]],
    'Armenian': [[0x0530, 0x058F]],
    'Ethiopic': [[0x1200, 0x137F]],
    'Khmer': [[0x1780, 0x17FF]],
    'Myanmar': [[0x1000, 0x109F]],
    'Sinhala': [[0x0D80, 0x0DFF]],
    'Telugu': [[0x0C00, 0x0C7F]],
    'Kannada': [[0x0C80, 0x0CFF]],
    'Malayalam': [[0x0D00, 0x0D7F]],
    'Gujarati': [[0x0A80, 0x0AFF]],
    'Gurmukhi': [[0x0A00, 0x0A7F]],
    'Oriya (Odia)': [[0x0B00, 0x0B7F]],
    'Tibetan': [[0x0F00, 0x0FFF]],
    'Mongolian': [[0x1800, 0x18AF]],
    'Lao': [[0x0E80, 0x0EFF]],
    'Cherokee': [[0x13A0, 0x13FF]],
    'Runic': [[0x16A0, 0x16FF]],
    'Ogham': [[0x1680, 0x169F]],
    'Braille Patterns': [[0x2800, 0x28FF]],
    'Bopomofo': [[0x3100, 0x312F]]
};

// General category code to readable name mapping
const categoryNames = {
    'Lu': 'Letter, uppercase',
    'Ll': 'Letter, lowercase',
    'Lt': 'Letter, titlecase',
    'Lm': 'Letter, modifier',
    'Lo': 'Letter, other',
    'Mn': 'Mark, nonspacing',
    'Mc': 'Mark, spacing combining',
    'Me': 'Mark, enclosing',
    'Nd': 'Number, decimal digit',
    'Nl': 'Number, letter',
    'No': 'Number, other',
    'Pc': 'Punctuation, connector',
    'Pd': 'Punctuation, dash',
    'Ps': 'Punctuation, open',
    'Pe': 'Punctuation, close',
    'Pi': 'Punctuation, initial quote',
    'Pf': 'Punctuation, final quote',
    'Po': 'Punctuation, other',
    'Sm': 'Symbol, math',
    'Sc': 'Symbol, currency',
    'Sk': 'Symbol, modifier',
    'So': 'Symbol, other',
    'Zs': 'Separator, space',
    'Zl': 'Separator, line',
    'Zp': 'Separator, paragraph',
    'Cc': 'Other, control',
    'Cf': 'Other, format',
    'Cs': 'Other, surrogate',
    'Co': 'Other, private use',
    'Cn': 'Other, not assigned'
};

function generateRandomCharacters(script) {
    const charBoxes = [
        document.getElementById('charSample1'),
        document.getElementById('charSample2'),
        document.getElementById('charSample3')
    ];

    // Get Unicode ranges for this script
    let ranges = scriptUnicodeRanges[script.name];

    // Fallback: use a generic approach based on script name patterns
    if (!ranges) {
        // Try to find a partial match
        const scriptNameLower = script.name.toLowerCase();
        for (const [key, value] of Object.entries(scriptUnicodeRanges)) {
            if (key.toLowerCase().includes(scriptNameLower) ||
                scriptNameLower.includes(key.toLowerCase())) {
                ranges = value;
                break;
            }
        }
    }

    // If still no ranges, show placeholder
    if (!ranges) {
        charBoxes.forEach((box, i) => {
            if (box) {
                updateCharacterBox(box, '?', null, 'Character sample cannot be displayed (see note above)');
            }
        });
        return;
    }

    // Generate 3 random characters
    charBoxes.forEach(box => {
        if (!box) return;

        // Pick a random range
        const range = ranges[Math.floor(Math.random() * ranges.length)];
        const [start, end] = range;

        // Pick a random code point in the range
        const codePoint = Math.floor(Math.random() * (end - start + 1)) + start;

        try {
            const char = String.fromCodePoint(codePoint);
            const codeHex = codePoint.toString(16).toUpperCase().padStart(4, '0');

            // Look up character info from the map
            const charInfo = characterInfoMap.get(codeHex);

            updateCharacterBox(box, char, codeHex, charInfo);
        } catch (e) {
            updateCharacterBox(box, '?', null, null);
        }
    });
}

function updateCharacterBox(box, char, codeHex, charInfo) {
    // Update the main character display
    const display = box.querySelector('.char-display');
    if (display) {
        display.textContent = char;
    }

    // Update the info panel
    const infoChar = box.querySelector('.char-info-char');
    const infoName = box.querySelector('.char-info-name');
    const infoCategory = box.querySelector('.char-info-category');
    const infoCodepoint = box.querySelector('.char-info-codepoint');

    if (infoChar) {
        infoChar.textContent = char;
    }

    if (charInfo && typeof charInfo === 'object') {
        // We have character info from the CSV
        if (infoName) {
            let name = charInfo.name || 'Unknown';
            // Clean up CJK ideograph names
            if (name.startsWith('CJK UNIFIED IDEOGRAPH-') || name.startsWith('<')) {
                name = 'CJK Unified Ideograph';
            }
            infoName.textContent = name;
        }

        if (infoCategory) {
            const catCode = charInfo.category || '';
            const catName = categoryNames[catCode] || catCode;
            infoCategory.textContent = catCode ? `${catCode} (${catName})` : '';
        }

        if (infoCodepoint) {
            let codepointText = codeHex ? `U+${codeHex}` : '';
            // Add decimal digit value if present
            if (charInfo.decimal && charInfo.decimal !== '') {
                codepointText += ` • Digit: ${charInfo.decimal}`;
            }
            infoCodepoint.textContent = codepointText;
        }
    } else if (typeof charInfo === 'string') {
        // It's an error message
        if (infoName) infoName.textContent = charInfo;
        if (infoCategory) infoCategory.textContent = '';
        if (infoCodepoint) infoCodepoint.textContent = '';
    } else {
        // No info available
        if (infoName) infoName.textContent = '';
        if (infoCategory) infoCategory.textContent = '';
        if (infoCodepoint) infoCodepoint.textContent = codeHex ? `U+${codeHex}` : '';
    }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// UNICODE DISTRIBUTION BREAKDOWN
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let currentBreakdownView = 'treemap';
let breakdownMinChars = 100;

function initBreakdownChart() {
    setupBreakdownControls();
    createBreakdownChart();
}

function setupBreakdownControls() {
    // View toggle buttons
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBreakdownView = btn.dataset.view;
            createBreakdownChart();
        });
    });

    // Min chars filter - custom dropdown
    const minCharsDropdown = document.getElementById('minCharsDropdown');
    const minCharsMenu = document.getElementById('minCharsMenu');
    const minCharsLabel = document.getElementById('minCharsLabel');

    if (minCharsDropdown && minCharsMenu) {
        minCharsDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            minCharsDropdown.classList.toggle('open');
            minCharsMenu.classList.toggle('hidden');
        });

        minCharsMenu.querySelectorAll('.dropdown-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                // Update active state
                minCharsMenu.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Update label
                minCharsLabel.textContent = option.textContent;

                // Update filter value
                breakdownMinChars = parseInt(option.dataset.value);

                // Close dropdown and redraw chart
                minCharsDropdown.classList.remove('open');
                minCharsMenu.classList.add('hidden');
                createBreakdownChart();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            minCharsDropdown.classList.remove('open');
            minCharsMenu.classList.add('hidden');
        });
    }
}

function createBreakdownChart() {
    switch (currentBreakdownView) {
        case 'bar':
            createBreakdownBarChart();
            break;
        case 'sunburst':
            createBreakdownSunburst();
            break;
        default:
            createBreakdownTreemap();
    }
}

function createBreakdownTreemap() {
    const container = document.querySelector('.breakdown-viz-wrapper');
    const svg = d3.select('#breakdownChart');

    if (!container || !svg.node()) return;

    svg.selectAll('*').remove();

    const width = container.clientWidth - 40;
    const height = 460;

    svg.attr('viewBox', `0 0 ${width + 40} ${height + 20}`);

    const g = svg.append('g').attr('transform', 'translate(20, 10)');

    // Prepare data
    const scriptData = languageData
        .filter(d => d.charCount >= breakdownMinChars)
        .map(d => ({
            name: d.script,
            value: d.charCount,
            category: categorizeScript(d.script)
        }));

    // Group by category
    const categories = d3.group(scriptData, d => d.category);
    const hierarchyData = {
        name: 'Unicode',
        children: Array.from(categories, ([name, children]) => ({
            name,
            children
        }))
    };

    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width, height])
        .padding(3)
        .paddingTop(20)
        .round(true)(root);

    const categoryColors = {
        'CJK': '#e06b9a',
        'Latin & European': '#72c9cd',
        'Middle Eastern': '#8fa55d',
        'South Asian': '#d4a574',
        'East Asian': '#7aa2f7',
        'Symbols & Emoji': '#bb9af7',
        'Historic': '#9b9b9b',
        'Other': '#6fcf97'
    };

    // Draw category group labels only (no boxes)
    const categoryGroup = g.selectAll('.category-group')
        .data(root.children || [])
        .join('g')
        .attr('class', 'category-group');

    categoryGroup.append('text')
        .attr('x', d => d.x0 + 6)
        .attr('y', d => d.y0 + 14)
        .attr('fill', d => categoryColors[d.data.name] || '#fff')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(d => d.data.name);

    // Draw leaf cells
    const cell = g.selectAll('.breakdown-cell')
        .data(root.leaves())
        .join('g')
        .attr('class', 'treemap-cell')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cell.append('rect')
        .attr('width', d => Math.max(0, d.x1 - d.x0))
        .attr('height', d => Math.max(0, d.y1 - d.y0))
        .attr('fill', d => {
            const cat = d.parent ? d.parent.data.name : 'Other';
            return categoryColors[cat] || '#6fcf97';
        })
        .attr('fill-opacity', 0.7)
        .attr('rx', 3);

    cell.filter(d => (d.x1 - d.x0) > 40 && (d.y1 - d.y0) > 20)
        .append('text')
        .attr('x', 4)
        .attr('y', 14)
        .attr('font-size', '10px')
        .text(d => d.data.name.length > 8 ? d.data.name.slice(0, 6) + '…' : d.data.name);

    // Tooltip
    cell.on('mouseenter', function (event, d) {
        showBreakdownTooltip(event, d.data);
        d3.select(this).select('rect').attr('fill-opacity', 1);
    })
        .on('mousemove', moveBreakdownTooltip)
        .on('mouseleave', function () {
            hideBreakdownTooltip();
            d3.select(this).select('rect').attr('fill-opacity', 0.7);
        });

    // Create legend
    createBreakdownLegend(categoryColors);
}

function createBreakdownBarChart() {
    const container = document.querySelector('.breakdown-viz-wrapper');
    const svg = d3.select('#breakdownChart');

    if (!container || !svg.node()) return;

    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 100, left: 80 };
    const width = container.clientWidth - margin.left - margin.right - 40;
    const height = 440 - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data - top 20 scripts
    const scriptData = languageData
        .filter(d => d.charCount >= breakdownMinChars)
        .sort((a, b) => b.charCount - a.charCount)
        .slice(0, 20)
        .map(d => ({
            name: d.script,
            value: d.charCount,
            category: categorizeScript(d.script)
        }));

    const categoryColors = {
        'CJK': '#e06b9a',
        'Latin & European': '#72c9cd',
        'Middle Eastern': '#8fa55d',
        'South Asian': '#d4a574',
        'East Asian': '#7aa2f7',
        'Symbols & Emoji': '#bb9af7',
        'Historic': '#9b9b9b',
        'Other': '#6fcf97'
    };

    // Scales
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.2)
        .domain(scriptData.map(d => d.name));

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(scriptData, d => d.value) * 1.1]);

    // Axes
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('fill', '#a3a7b9')
        .attr('font-size', '10px');

    g.append('g')
        .call(d3.axisLeft(y).ticks(6).tickFormat(d => d >= 1000 ? (d / 1000) + 'k' : d))
        .selectAll('text')
        .attr('fill', '#a3a7b9');

    // Bars
    g.selectAll('.breakdown-bar')
        .data(scriptData)
        .join('rect')
        .attr('class', 'breakdown-bar')
        .attr('x', d => x(d.name))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => categoryColors[d.category] || '#6fcf97')
        .attr('rx', 4)
        .on('mouseenter', function (event, d) {
            showBreakdownTooltip(event, d);
            d3.select(this).attr('opacity', 0.8);
        })
        .on('mousemove', moveBreakdownTooltip)
        .on('mouseleave', function () {
            hideBreakdownTooltip();
            d3.select(this).attr('opacity', 1);
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 30)
        .attr('y', d => y(d.value))
        .attr('height', d => height - y(d.value));

    createBreakdownLegend(categoryColors);
}

function createBreakdownSunburst() {
    const container = document.querySelector('.breakdown-viz-wrapper');
    const svg = d3.select('#breakdownChart');

    if (!container || !svg.node()) return;

    svg.selectAll('*').remove();

    const width = Math.min(container.clientWidth - 40, 500);
    const height = 460;
    const radius = Math.min(width, height) / 2 - 20;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    // Prepare hierarchical data
    const scriptData = languageData
        .filter(d => d.charCount >= breakdownMinChars)
        .map(d => ({
            name: d.script,
            value: d.charCount,
            category: categorizeScript(d.script)
        }));

    const categories = d3.group(scriptData, d => d.category);
    const hierarchyData = {
        name: 'Unicode',
        children: Array.from(categories, ([name, children]) => ({
            name,
            children: children.slice(0, 10) // Limit children per category
        }))
    };

    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const partition = d3.partition()
        .size([2 * Math.PI, radius]);

    partition(root);

    const categoryColors = {
        'CJK': '#e06b9a',
        'Latin & European': '#72c9cd',
        'Middle Eastern': '#8fa55d',
        'South Asian': '#d4a574',
        'East Asian': '#7aa2f7',
        'Symbols & Emoji': '#bb9af7',
        'Historic': '#9b9b9b',
        'Other': '#6fcf97'
    };

    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1 - 1);

    g.selectAll('path')
        .data(root.descendants().filter(d => d.depth))
        .join('path')
        .attr('class', 'sunburst-arc')
        .attr('fill', d => {
            const cat = d.depth === 1 ? d.data.name : (d.parent ? d.parent.data.name : 'Other');
            return categoryColors[cat] || '#6fcf97';
        })
        .attr('fill-opacity', d => d.depth === 1 ? 0.9 : 0.7)
        .attr('d', arc)
        .on('mouseenter', function (event, d) {
            showBreakdownTooltip(event, d.data);
            d3.select(this).attr('fill-opacity', 1);
        })
        .on('mousemove', moveBreakdownTooltip)
        .on('mouseleave', function (event, d) {
            hideBreakdownTooltip();
            d3.select(this).attr('fill-opacity', d.depth === 1 ? 0.9 : 0.7);
        });

    // Labels for outer ring
    g.selectAll('.sunburst-label')
        .data(root.descendants().filter(d => d.depth === 1 && (d.x1 - d.x0) > 0.2))
        .join('text')
        .attr('class', 'sunburst-label')
        .attr('transform', d => {
            const angle = (d.x0 + d.x1) / 2 * 180 / Math.PI - 90;
            const r = (d.y0 + d.y1) / 2;
            return `rotate(${angle}) translate(${r},0) rotate(${angle > 90 ? 180 : 0})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(d => d.data.name.length > 12 ? d.data.name.slice(0, 10) + '…' : d.data.name);

    createBreakdownLegend(categoryColors);
}

function categorizeScript(scriptName) {
    const name = scriptName.toLowerCase();
    if (name.includes('han') || name.includes('cjk') || name.includes('chinese')) return 'CJK';
    if (name.includes('hangul') || name.includes('korean')) return 'East Asian';
    if (name.includes('hiragana') || name.includes('katakana') || name.includes('japanese')) return 'East Asian';
    if (name.includes('latin') || name.includes('cyrillic') || name.includes('greek') || name.includes('georgian') || name.includes('armenian')) return 'Latin & European';
    if (name.includes('arabic') || name.includes('hebrew') || name.includes('syriac')) return 'Middle Eastern';
    if (name.includes('devanagari') || name.includes('bengali') || name.includes('tamil') || name.includes('telugu') ||
        name.includes('kannada') || name.includes('malayalam') || name.includes('gujarati') || name.includes('oriya') ||
        name.includes('gurmukhi') || name.includes('thai') || name.includes('tibetan')) return 'South Asian';
    if (name.includes('symbol') || name.includes('emoji') || name.includes('braille') || name.includes('musical')) return 'Symbols & Emoji';
    if (name.includes('hieroglyph') || name.includes('cuneiform') || name.includes('linear') || name.includes('gothic') ||
        name.includes('runic') || name.includes('ogham') || name.includes('old')) return 'Historic';
    return 'Other';
}

function createBreakdownLegend(colors) {
    const legend = document.getElementById('breakdownLegend');
    if (!legend) return;

    legend.innerHTML = Object.entries(colors).map(([name, color]) => `
        <div class="breakdown-legend-item">
            <div class="breakdown-legend-color" style="background: ${color}"></div>
            <span>${name}</span>
        </div>
    `).join('');
}

function showBreakdownTooltip(event, data) {
    const tooltip = document.getElementById('breakdownTooltip');

    tooltip.innerHTML = `
        <strong>${data.name}</strong><br>
        ${data.value ? data.value.toLocaleString() + ' characters' : ''}
        ${data.category ? `<br><em>${data.category}</em>` : ''}
    `;

    tooltip.classList.remove('hidden');
    moveBreakdownTooltip(event);
}

function moveBreakdownTooltip(event) {
    const tooltip = document.getElementById('breakdownTooltip');
    const container = document.querySelector('.breakdown-viz-wrapper');
    const rect = container.getBoundingClientRect();

    let x = event.clientX - rect.left + 15;
    let y = event.clientY - rect.top + 15;

    const tooltipRect = tooltip.getBoundingClientRect();
    if (x + tooltipRect.width > rect.width - 20) {
        x = event.clientX - rect.left - tooltipRect.width - 15;
    }
    if (y + tooltipRect.height > rect.height - 20) {
        y = event.clientY - rect.top - tooltipRect.height - 15;
    }

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

function hideBreakdownTooltip() {
    document.getElementById('breakdownTooltip').classList.add('hidden');
}