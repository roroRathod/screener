// Demographic variables config (same as screens.js)
const demographicConfig = [
    { key: 'Gender-static', label: 'Gender', options: ['Male', 'Female'] },
    { key: 'Grade ', label: 'Grade', options: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { key: 'Country   ', label: 'Country', options: ['Australia', 'Brazil', 'Canada', 'France', 'Germany', 'India', 'Japan', 'Singapore', 'UK', 'USA'] },
    { key: 'SBU   ', label: 'SBU', options: ['APAC', 'CIS', 'EU', 'FF', 'LATAM', 'MEA', 'NA'] },
    { key: 'BU            ', label: 'BU', options: ['Banking', 'Energy', 'Insurance', 'Manufacturing', 'Public Sector', 'Retail', 'Telecom'] },
    { key: 'Practice        ', label: 'Practice', options: ['Consulting', 'Cybersecurity', 'Data & AI', 'Digital', 'Engineering', 'Human Resources', 'Technology'] },
    { key: 'Department', label: 'Department', options: ['Finance', 'HR', 'IT', 'Legal', 'Marketing', 'Operations', 'Sales'] },
    { key: 'Employment Type', label: 'Employment Type', options: ['Full time', 'Part time'] }
];

function openDemographicPane() {
    document.getElementById('demographic-pane').classList.add('open');
}
function closeDemographicPane() {
    document.getElementById('demographic-pane').classList.remove('open');
}

document.getElementById('close-demographic-pane').onclick = closeDemographicPane;

// Render demographic pane content
function renderDemographicPane() {
    Papa.parse('data/employee.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            const content = document.getElementById('demographic-pane-content');
            if (!content) return;
            content.innerHTML = '';
            // Add Select All / Clear All controls
            const controls = document.createElement('div');
            controls.style.display = 'flex';
            controls.style.justifyContent = 'flex-end';
            controls.style.gap = '1em';
            controls.style.marginBottom = '1.2em';
            const selectAllBtn = document.createElement('button');
            selectAllBtn.textContent = 'Select All';
            selectAllBtn.className = 'demographic-btn';
            selectAllBtn.onclick = function() {
                document.querySelectorAll('.demographic-pane .demographic-btn-group .demographic-btn').forEach(btn => {
                    btn.classList.add('selected');
                });
            };
            controls.appendChild(selectAllBtn);
            const clearAllBtn = document.createElement('button');
            clearAllBtn.textContent = 'Clear All';
            clearAllBtn.className = 'demographic-btn';
            clearAllBtn.onclick = function() {
                document.querySelectorAll('.demographic-pane .demographic-btn-group .demographic-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
            };
            controls.appendChild(clearAllBtn);
            content.appendChild(controls);
            demographicConfig.forEach(field => {
                // Try to get unique values from CSV for this field
                let options = field.options;
                if (data && data.length && data[0][field.key] !== undefined) {
                    const unique = [...new Set(data.map(row => row[field.key]).filter(Boolean))].sort();
                    if (unique.length > 0) options = unique;
                }
                // Section
                const section = document.createElement('div');
                // Heading
                const heading = document.createElement('div');
                heading.className = 'demographic-section-title';
                heading.textContent = field.label;
                section.appendChild(heading);
                // Button group
                const btnGroup = document.createElement('div');
                btnGroup.className = 'demographic-btn-group';
                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'demographic-btn';
                    btn.textContent = opt;
                    btn.onclick = function() {
                        btn.classList.toggle('selected');
                    };
                    btnGroup.appendChild(btn);
                });
                section.appendChild(btnGroup);
                content.appendChild(section);
            });
        },
        error: function() {
            // fallback
            const content = document.getElementById('demographic-pane-content');
            if (!content) return;
            content.innerHTML = '';
            // Add Select All / Clear All controls
            const controls = document.createElement('div');
            controls.style.display = 'flex';
            controls.style.justifyContent = 'flex-end';
            controls.style.gap = '1em';
            controls.style.marginBottom = '1.2em';
            const selectAllBtn = document.createElement('button');
            selectAllBtn.textContent = 'Select All';
            selectAllBtn.className = 'demographic-btn';
            selectAllBtn.onclick = function() {
                document.querySelectorAll('.demographic-pane .demographic-btn-group .demographic-btn').forEach(btn => {
                    btn.classList.add('selected');
                });
            };
            controls.appendChild(selectAllBtn);
            const clearAllBtn = document.createElement('button');
            clearAllBtn.textContent = 'Clear All';
            clearAllBtn.className = 'demographic-btn';
            clearAllBtn.onclick = function() {
                document.querySelectorAll('.demographic-pane .demographic-btn-group .demographic-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
            };
            controls.appendChild(clearAllBtn);
            content.appendChild(controls);
            demographicConfig.forEach(field => {
                const section = document.createElement('div');
                const heading = document.createElement('div');
                heading.className = 'demographic-section-title';
                heading.textContent = field.label;
                section.appendChild(heading);
                const btnGroup = document.createElement('div');
                btnGroup.className = 'demographic-btn-group';
                field.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'demographic-btn';
                    btn.textContent = opt;
                    btn.onclick = function() {
                        btn.classList.toggle('selected');
                    };
                    btnGroup.appendChild(btn);
                });
                section.appendChild(btnGroup);
                content.appendChild(section);
            });
        }
    });
}

// Clean CSV headers: remove -static, trim spaces, standardize names
function cleanHeadersAndRows(data) {
    if (!data.length) return data;
    // Clean headers
    const cleanedHeaders = Object.keys(data[0]).map(h =>
        h.replace(/-static/gi, '')
         .replace(/\s+/g, ' ')
         .trim()
    );
    // Map old header to new header
    const headerMap = {};
    Object.keys(data[0]).forEach((oldH, i) => {
        headerMap[oldH] = cleanedHeaders[i];
    });
    // Clean all rows and trim whitespace from all cell values
    const cleanedData = data.map(row => {
        const newRow = {};
        Object.entries(row).forEach(([k, v]) => {
            // Trim whitespace from string values
            if (typeof v === 'string') {
                newRow[headerMap[k]] = v.trim();
            } else {
                newRow[headerMap[k]] = v;
            }
        });
        return newRow;
    });
    return cleanedData;
}

let originalData = [];
let csvFieldMap = {};

// Utility: normalize field names (trim, lowercase, remove extra spaces)
function normalizeField(str) {
    return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

// Utility: show notification
function showNotification(message, type) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.className = 'notification ' + type;
    notif.style.display = 'block';
    setTimeout(() => {
        notif.style.display = 'none';
    }, 2000);
}

// Parse simple query string and return a filter function
function parseQuery(query) {
    // Only support AND, =, >, <, >=, <=, string values in single quotes
    // Example: Gender = 'Male' AND Age > 30 AND Country = 'India'
    if (!query.trim()) return () => true;
    try {
        // Replace all line breaks and multiple spaces with a single space
        query = query.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
        // --- Parentheses-aware parser ---
        // Tokenize
        const tokens = [];
        let i = 0;
        while (i < query.length) {
            if (query[i] === '(' || query[i] === ')') {
                tokens.push(query[i]);
                i++;
            } else if (query.slice(i).match(/^AND /i)) {
                tokens.push('AND');
                i += 4;
            } else if (query.slice(i).match(/^OR /i)) {
                tokens.push('OR');
                i += 3;
            } else {
                // Read until next space, parenthesis, or end
                let j = i;
                while (j < query.length && !['(', ')'].includes(query[j]) && !query.slice(j).match(/^AND /i) && !query.slice(j).match(/^OR /i)) {
                    j++;
                }
                let token = query.slice(i, j).trim();
                if (token) tokens.push(token);
                i = j;
            }
        }
        // Shunting Yard Algorithm to convert to Reverse Polish Notation (RPN)
        const output = [];
        const ops = [];
        const precedence = { 'AND': 2, 'OR': 1 };
        tokens.forEach(token => {
            if (token === 'AND' || token === 'OR') {
                while (ops.length && precedence[ops[ops.length-1]] >= precedence[token]) {
                    output.push(ops.pop());
                }
                ops.push(token);
            } else if (token === '(') {
                ops.push(token);
            } else if (token === ')') {
                while (ops.length && ops[ops.length-1] !== '(') {
                    output.push(ops.pop());
                }
                ops.pop(); // Remove '('
            } else {
                output.push(token);
            }
        });
        while (ops.length) output.push(ops.pop());
        // Build filter function from RPN
        const opsList = ['AND', 'OR'];
        const filterStack = [];
        const cmpOps = ['>=', '<=', '>', '<', '='];
        output.forEach(token => {
            if (!opsList.includes(token)) {
                // It's a condition
                let op = cmpOps.find(o => token.includes(o));
                if (!op) throw new Error('Invalid operator');
                let [field, value] = token.split(op);
                if (!field || value === undefined) throw new Error('Invalid condition');
                const userField = normalizeField(field);
                const csvKey = csvFieldMap[userField];
                if (!csvKey) throw new Error('Field not found: ' + field);
                value = value.trim();
                if (value.startsWith("'")) value = value.slice(1);
                if (value.endsWith("'")) value = value.slice(0, -1);
                filterStack.push(row => {
                    let cell = row[csvKey];
                    if (cell === undefined) return false;
                    if (!isNaN(Number(cell)) && !isNaN(Number(value))) {
                        cell = Number(cell);
                        value = Number(value);
                    }
                    if (typeof cell === 'string' && typeof value === 'string') {
                        cell = cell.trim().toLowerCase();
                        value = value.trim().toLowerCase();
                    }
                    switch (op) {
                        case '=': return cell == value;
                        case '>': return cell > value;
                        case '<': return cell < value;
                        case '>=': return cell >= value;
                        case '<=': return cell <= value;
                        default: return false;
                    }
                });
            } else {
                // It's an operator
                const b = filterStack.pop();
                const a = filterStack.pop();
                if (token === 'AND') {
                    filterStack.push(row => a(row) && b(row));
                } else if (token === 'OR') {
                    filterStack.push(row => a(row) || b(row));
                }
            }
        });
        if (filterStack.length !== 1) throw new Error('syntax');
        return filterStack[0];
    } catch (e) {
        throw new Error('syntax');
    }
}

// Operators for the query builder
const QUERY_OPERATORS = ['+', '-', '*', '/', '>', '<', '>=', '<=', '=', 'AND', 'OR'];

function showQueryHelperSection() {
    const section = document.getElementById('query-helper-section');
    section.style.display = 'block';
    // Populate operators
    const opContainer = document.getElementById('query-helper-operators');
    opContainer.innerHTML = '';
    QUERY_OPERATORS.forEach(op => {
        const btn = document.createElement('button');
        btn.className = 'query-helper-operator-btn';
        btn.textContent = op;
        btn.onclick = () => insertIntoQuery(op);
        opContainer.appendChild(btn);
    });
    // Populate columns
    const colContainer = document.getElementById('query-helper-columns-bar');
    colContainer.innerHTML = '';
    const allCols = Object.values(csvFieldMap);
    allCols.forEach(col => {
        const btn = document.createElement('button');
        btn.className = 'query-helper-column-btn';
        btn.textContent = col;
        btn.onclick = () => {
            // Highlight selected
            colContainer.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            showPossibleValues(col);
            insertIntoQuery(col);
        };
        colContainer.appendChild(btn);
    });
    // Clear values section
    document.getElementById('query-helper-values-section').innerHTML = '';
    // Scroll to section
    section.scrollIntoView({ behavior: 'smooth' });
}

function closeQueryHelperSection() {
    document.getElementById('query-helper-section').style.display = 'none';
}

function insertIntoQuery(text) {
    const queryBox = document.getElementById('query-textarea');
    // Insert at cursor position
    const start = queryBox.selectionStart;
    const end = queryBox.selectionEnd;
    const before = queryBox.value.substring(0, start);
    const after = queryBox.value.substring(end);
    let insertText = text;
    // If value is not an operator or column, wrap in single quotes and trim
    if (!QUERY_OPERATORS.includes(text) && !Object.values(csvFieldMap).includes(text)) {
        insertText = `'${text.trim()}'`;
    }
    queryBox.value = before + insertText + after;
    // Move cursor after inserted text
    queryBox.selectionStart = queryBox.selectionEnd = before.length + insertText.length;
    queryBox.focus();
}

function showPossibleValues(col) {
    const valuesSection = document.getElementById('query-helper-values-section');
    valuesSection.innerHTML = '';
    // Get unique values for this column, sorted ascending
    let uniqueVals = Array.from(new Set(originalData.map(row => row[col]).filter(Boolean)));
    // Try to sort numerically if possible, otherwise sort as strings
    if (uniqueVals.every(v => !isNaN(Number(v)))) {
        uniqueVals = uniqueVals.map(Number).sort((a, b) => a - b).map(String);
    } else {
        uniqueVals = uniqueVals.sort((a, b) => String(a).localeCompare(String(b)));
    }
    if (uniqueVals.length === 0) {
        valuesSection.innerHTML = '<span style="color:#888;">No values found for this column.</span>';
        return;
    }
    uniqueVals.forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'query-helper-value-btn';
        btn.textContent = val;
        btn.onclick = () => insertIntoQuery(val);
        valuesSection.appendChild(btn);
    });
}

// Helper to get URL query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let pendingQueryParam = null;

// Helper to run the pending query after data is loaded
function runPendingQueryIfReady() {
    if (pendingQueryParam) {
        const textarea = document.getElementById('query-textarea');
        if (textarea) {
            textarea.value = pendingQueryParam;
            const runBtn = document.querySelector('.run-query-btn');
            if (runBtn) {
                runBtn.click();
            }
        }
        pendingQueryParam = null; // Only run once
    }
}

window.addEventListener('DOMContentLoaded', function() {
    pendingQueryParam = getQueryParam('query');
});

document.addEventListener('DOMContentLoaded', function () {
    Papa.parse('data/employee.csv', {
        download: true,
        header: true,
        complete: function(results) {
            // Clean headers and rows
            const cleaned = cleanHeadersAndRows(results.data);
            // Normalize CSV headers and build field map
            if (cleaned.length > 0) {
                csvFieldMap = {};
                Object.keys(cleaned[0]).forEach(key => {
                    csvFieldMap[normalizeField(key)] = key;
                });
            }
            originalData = cleaned;
            renderDataFrameTable(originalData);
            renderQueryBoxes({});
        }
    });
    renderDemographicPane();
    const openBtn = document.getElementById('open-demographic-pane');
    if (openBtn) openBtn.onclick = openDemographicPane;
    const createBtn = document.getElementById('create-screen-btn');
    if (createBtn) {
        createBtn.onclick = function() {
            const selected = {};
            document.querySelectorAll('.demographic-pane .demographic-btn-group').forEach((group, idx) => {
                const field = demographicConfig[idx];
                const selectedOptions = Array.from(group.querySelectorAll('.demographic-btn.selected')).map(btn => btn.textContent);
                if (selectedOptions.length > 0) {
                    selected[field.label] = selectedOptions;
                }
            });
            Papa.parse('data/employee.csv', {
                download: true,
                header: true,
                complete: function(results) {
                    // Clean headers and rows
                    const cleaned = cleanHeadersAndRows(results.data);
                    if (cleaned.length > 0) {
                        csvFieldMap = {};
                        Object.keys(cleaned[0]).forEach(key => {
                            csvFieldMap[normalizeField(key)] = key;
                        });
                    }
                    originalData = cleaned;
                    renderDataFrameTable(originalData);
                    renderQueryBoxes(selected);
                }
            });
            closeDemographicPane();
        };
    }
    // Always show and populate query helper section
    // showQueryHelperSection(); // Removed this line
    // Run Query button logic
    function runQuery() {
        const queryBox = document.getElementById('query-textarea');
        const query = queryBox.value.trim();
        let filtered = [];
        try {
            const filterFn = parseQuery(query);
            filtered = originalData.filter(filterFn);
            renderDataFrameTable(filtered);
            showNotification('Query successfully executed', 'success');
        } catch (e) {
            showNotification('Query syntax error. You can take help off the ratios button for help.', 'error');
        }
    }
    const runQueryBtn = document.querySelector('.run-query-btn');
    if (runQueryBtn) {
        runQueryBtn.onclick = runQuery;
    }
    // Run query on Enter key in textarea (unless Shift is held)
    const queryBox = document.getElementById('query-textarea');
    if (queryBox) {
        queryBox.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                runQuery();
            }
        });
    }
    // Show/close query helper section
    const showRatiosBtn = document.getElementById('show-ratios-btn');
    if (showRatiosBtn) {
        showRatiosBtn.onclick = function() {
            const section = document.getElementById('query-helper-section');
            if (section.style.display === 'none') {
                showQueryHelperSection();
                showRatiosBtn.textContent = '🛈 HIDE RATIOS';
                section.scrollIntoView({ behavior: 'smooth' });
            } else {
                closeQueryHelperSection();
                showRatiosBtn.textContent = '🛈 SHOW RATIOS';
            }
        };
    }
    const closeQueryHelper = document.getElementById('close-query-helper');
    if (closeQueryHelper) {
        closeQueryHelper.onclick = function() {
            closeQueryHelperSection();
            const showRatiosBtn = document.getElementById('show-ratios-btn');
            if (showRatiosBtn) showRatiosBtn.textContent = '🛈 SHOW RATIOS';
        };
    }
    // Clear Query button logic
    const clearQueryBtn = document.getElementById('clear-query-btn');
    if (clearQueryBtn) {
        clearQueryBtn.onclick = function() {
            const queryBox = document.getElementById('query-textarea');
            if (queryBox) queryBox.value = '';
        };
    }
    const saveQueryBtn = document.getElementById('save-query-btn');
    if (saveQueryBtn) {
        saveQueryBtn.onclick = function() {
            const queryBox = document.getElementById('query-textarea');
            const query = queryBox.value.trim();
            if (!query) {
                showNotification('Query is empty. Nothing to save.', 'error');
                return;
            }
            let name = prompt('Enter a name for this query:');
            if (!name) {
                showNotification('Query name is required.', 'error');
                return;
            }
            name = name.trim();
            if (!name) {
                showNotification('Query name is required.', 'error');
                return;
            }
            let savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
            if (savedQueries.some(q => typeof q === 'object' ? q.name === name : false)) {
                showNotification('A query with this name already exists.', 'error');
                return;
            }
            savedQueries.push({ name, query });
            localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
            showNotification('Query saved!', 'success');
        };
    }
    // (REMOVED) Old handler for AI SUMMARY button that showed 'feature coming soon' notification.
});

function renderDataFrameTable(data) {
    currentFilteredData = data; // Store the currently displayed data globally
    const container = document.getElementById('dataframe-container');
    if (!container) return;
    if (!data || !data.length) {
        container.innerHTML = '<div>No data found.</div>';
        return;
    }
    // Table
    let html = '<div class="dataframe-scroll-wrapper"><table class="dataframe-table"><thead><tr>';
    Object.keys(data[0]).forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';
    data.forEach(row => {
        html += '<tr>';
        Object.keys(row).forEach(col => {
            html += `<td>${row[col]}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
    // After rendering the dataframe, check if we have a pending query param
    if (pendingQueryParam) {
        const textarea = document.getElementById('query-textarea');
        if (textarea) {
            textarea.value = pendingQueryParam;
            const runBtn = document.querySelector('.run-query-btn');
            if (runBtn) {
                runBtn.click();
            }
        }
        pendingQueryParam = null; // Only run once
    }
}

function renderQueryBoxes(selected) {
    // Query box
    const queryBox = document.getElementById('query-textarea');
    const customQueryBox = document.getElementById('custom-query-textarea');
    // Generate a query string based on selected variables
    let query = '';
    Object.entries(selected).forEach(([key, values]) => {
        query += `${key} IN (${values.join(', ')}) AND\n`;
    });
    if (query.endsWith('AND\n')) query = query.slice(0, -5);
    // Only set value if query is not empty AND the box is currently empty
    if (query && queryBox.tagName === 'TEXTAREA' && !queryBox.value.trim()) {
        queryBox.value = query;
    } // else, preserve existing value
    else if (!queryBox.value.trim()) {
        // If still empty, clear it
        queryBox.value = '';
    }
    // Example custom query
    customQueryBox.textContent = "Gender = 'Male' AND\nAge > 30 AND\nCountry = 'India'";
}

// Download Dataset button logic
const downloadDatasetBtn = document.getElementById('download-dataset-btn');
if (downloadDatasetBtn) {
    downloadDatasetBtn.addEventListener('click', function() {
        if (!currentFilteredData || currentFilteredData.length === 0) {
            alert('No data to download!');
            return;
        }
        const csv = Papa.unparse(currentFilteredData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filtered_dataset.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// --- Edit Columns Modal Logic ---
let selectedColumns = [];
let allColumns = [];

function openEditColumnsModal() {
    const modal = document.getElementById('edit-columns-modal');
    const chipsContainer = document.getElementById('columns-chips-container');
    chipsContainer.innerHTML = '';
    // Use allColumns for the chips
    allColumns.forEach(col => {
        const chip = document.createElement('div');
        chip.className = 'column-chip' + (selectedColumns.includes(col) ? ' selected' : '');
        chip.textContent = col;
        chip.setAttribute('data-col', col);
        chip.onclick = function() {
            if (selectedColumns.includes(col)) {
                selectedColumns = selectedColumns.filter(c => c !== col);
                chip.classList.remove('selected');
            } else {
                selectedColumns.push(col);
                chip.classList.add('selected');
            }
        };
        chipsContainer.appendChild(chip);
    });
    modal.style.display = 'flex';
}

function closeEditColumnsModal() {
    document.getElementById('edit-columns-modal').style.display = 'none';
}

document.getElementById('edit-columns-btn').onclick = openEditColumnsModal;
document.getElementById('cancel-columns-btn').onclick = closeEditColumnsModal;

document.getElementById('save-columns-btn').onclick = function() {
    closeEditColumnsModal();
    // Re-render table with selected columns
    renderDataFrameTable(currentFilteredData);
};

document.getElementById('reset-columns-btn').onclick = function() {
    selectedColumns = [...allColumns];
    // Update chips visually
    const chips = document.querySelectorAll('.column-chip');
    chips.forEach(chip => {
        chip.classList.add('selected');
    });
    // Optionally, re-render the table immediately:
    renderDataFrameTable(currentFilteredData);
};

// Patch renderDataFrameTable to only show selected columns
const _originalRenderDataFrameTable = renderDataFrameTable;
renderDataFrameTable = function(data) {
    // If selectedColumns is set, filter columns
    if (selectedColumns.length > 0 && data && data.length > 0) {
        const filteredData = data.map(row => {
            const filteredRow = {};
            selectedColumns.forEach(col => {
                filteredRow[col] = row[col];
            });
            return filteredRow;
        });
        _originalRenderDataFrameTable(filteredData);
    } else {
        _originalRenderDataFrameTable(data);
    }
    currentFilteredData = data;
};

// Patch download logic to only include selected columns
if (downloadDatasetBtn) {
    downloadDatasetBtn.addEventListener('click', function() {
        let dataToDownload = currentFilteredData;
        if (selectedColumns.length > 0 && dataToDownload && dataToDownload.length > 0) {
            dataToDownload = dataToDownload.map(row => {
                const filteredRow = {};
                selectedColumns.forEach(col => {
                    filteredRow[col] = row[col];
                });
                return filteredRow;
            });
        }
        if (!dataToDownload || dataToDownload.length === 0) {
            alert('No data to download!');
            return;
        }
        const csv = Papa.unparse(dataToDownload);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filtered_dataset.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Initialize allColumns and selectedColumns after loading data
const _originalRenderDataFrameTableInit = renderDataFrameTable;
renderDataFrameTable = function(data) {
    if (data && data.length > 0) {
        allColumns = Object.keys(data[0]);
        if (selectedColumns.length === 0) {
            selectedColumns = [...allColumns];
        }
    }
    _originalRenderDataFrameTableInit(data);
};

// --- AI SUMMARY PANE LOGIC ---
function showAISummaryPane(content) {
  const pane = document.getElementById('ai-summary-pane');
  const contentDiv = document.getElementById('ai-summary-pane-content');
  
  // Clear any existing content and set the new content
  contentDiv.innerHTML = content;
  
  pane.style.display = 'flex';
  setTimeout(() => pane.classList.add('open'), 10); // trigger slide-in
  document.getElementById('main-content').classList.add('blurred'); // add blur
  
  // Enable subscribe button only after summary is generated
  const subscribeBtn = document.getElementById('subscribe-btn');
  if (subscribeBtn) subscribeBtn.disabled = false;
}

function hideAISummaryPane() {
  const pane = document.getElementById('ai-summary-pane');
  pane.classList.remove('open');
  setTimeout(() => pane.style.display = 'none', 300); // after transition
  document.getElementById('main-content').classList.remove('blurred'); // remove blur
}

const closeAISummaryBtn = document.getElementById('close-ai-summary-pane');
if (closeAISummaryBtn) closeAISummaryBtn.onclick = hideAISummaryPane;

// --- AI SUMMARY SUBSCRIBE MODAL LOGIC ---
const aiSummarySubscribeModal = document.getElementById('ai-summary-subscribe-modal');
const aiSummarySubscribeForm = document.getElementById('ai-summary-subscribe-form');
const aiSummarySubscribeName = document.getElementById('ai-summary-subscribe-name');
const aiSummarySubscribeEmail = document.getElementById('ai-summary-subscribe-email');
const aiSummarySubscribeError = document.getElementById('ai-summary-subscribe-error');
const aiSummarySubscribeCancel = document.getElementById('ai-summary-subscribe-cancel');
const aiSummarySubscribeSubmit = document.getElementById('ai-summary-subscribe-submit');
let lastAISummary = '';
let lastAIQuery = '';

function showAISubscribeModal() {
  aiSummarySubscribeName.value = '';
  aiSummarySubscribeEmail.value = '';
  aiSummarySubscribeError.style.display = 'none';
  aiSummarySubscribeError.textContent = '';
  aiSummarySubscribeSubmit.disabled = false;
  aiSummarySubscribeModal.style.display = 'flex';
}
function hideAISubscribeModal() {
  aiSummarySubscribeModal.style.display = 'none';
}
aiSummarySubscribeCancel.onclick = hideAISubscribeModal;

// Enable subscribe button only after summary is generated
const subscribeBtn = document.getElementById('subscribe-btn');
if (subscribeBtn) {
  subscribeBtn.disabled = true;
  subscribeBtn.onclick = function() {
    if (!lastAISummary) {
      showNotification('Please generate an AI summary first.', 'error');
      return;
    }
    showAISubscribeModal();
  };
}

// Validate email
function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

aiSummarySubscribeForm.onsubmit = async function(e) {
  e.preventDefault();
  const name = aiSummarySubscribeName.value.trim();
  const email = aiSummarySubscribeEmail.value.trim();
  if (!name || !email) {
    aiSummarySubscribeError.textContent = 'Name and email are required.';
    aiSummarySubscribeError.style.display = 'block';
    return;
  }
  if (!isValidEmail(email)) {
    aiSummarySubscribeError.textContent = 'Please enter a valid email address.';
    aiSummarySubscribeError.style.display = 'block';
    return;
  }
  aiSummarySubscribeSubmit.disabled = true;
  aiSummarySubscribeSubmit.textContent = 'Subscribing...';
  try {
    const res = await fetch('http://localhost:3001/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        query: lastAIQuery,
        summary: lastAISummary
      })
    });
    if (res.ok) {
      showNotification('Subscribed and email will be sent!', 'success');
      hideAISubscribeModal();
    } else {
      aiSummarySubscribeError.textContent = 'Failed to subscribe. Please try again.';
      aiSummarySubscribeError.style.display = 'block';
    }
  } catch (e) {
    aiSummarySubscribeError.textContent = 'Network error. Please try again.';
    aiSummarySubscribeError.style.display = 'block';
  }
  aiSummarySubscribeSubmit.disabled = false;
  aiSummarySubscribeSubmit.textContent = 'Subscribe';
};

// AI SUMMARY button logic: only for screens queries
const aiSummaryBtn = document.getElementById('ai-summary-btn');
if (aiSummaryBtn) {
  aiSummaryBtn.onclick = async function() {
    // Show the summary pane and a loading message
    showAISummaryPane('<div style="text-align: center; padding: 2em; color: #666;">Generating AI summary...</div>');
    subscribeBtn.disabled = true; // Disable subscribe until summary is ready
    
    // Get the current query
    const query = document.getElementById('query-textarea').value.trim();
    lastAIQuery = query;
    
    // Get the current filtered dataframe as CSV
    let dataframeCsv = '';
    if (typeof Papa !== 'undefined' && window.currentFilteredData) {
      dataframeCsv = Papa.unparse(window.currentFilteredData);
    }
    
    // Send to backend and stream response
    try {
      const response = await fetch('http://localhost:3001/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataframeCsv,
          query
        })
      });
      
      if (!response.body) {
        document.getElementById('ai-summary-pane-content').innerHTML = '<div style="color: #d32f2f; text-align: center; padding: 2em;">No response from AI.</div>';
        return;
      }
      
      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiSummary = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        aiSummary += decoder.decode(value, { stream: true });
        // Update the content directly in the pane
        document.getElementById('ai-summary-pane-content').innerHTML = aiSummary + '<div style="color: #666; font-style: italic; text-align: center; margin-top: 1em;">Generating...</div>';
      }
      
      // Ensure we have complete content
      if (aiSummary.trim()) {
        // Check if content contains HTML entities and decode them
        let processedContent = aiSummary;
        if (aiSummary.includes('&lt;') || aiSummary.includes('&gt;') || aiSummary.includes('&amp;')) {
          const textarea = document.createElement('textarea');
          textarea.innerHTML = aiSummary;
          processedContent = textarea.value;
        }
        
        document.getElementById('ai-summary-pane-content').innerHTML = processedContent;
      } else {
        document.getElementById('ai-summary-pane-content').innerHTML = '<div style="color: #d32f2f; text-align: center; padding: 2em;">No content generated. Please try again.</div>';
      }
      
      lastAISummary = aiSummary;
      subscribeBtn.disabled = false; // Enable subscribe after summary
    } catch (e) {
      document.getElementById('ai-summary-pane-content').innerHTML = '<div style="color: #d32f2f; text-align: center; padding: 2em;">Error: ' + e.message + '</div>';
      subscribeBtn.disabled = true;
    }
  };
}

const insightsSubscribeBtn = document.getElementById('insights-subscribe-btn');
if (insightsSubscribeBtn) {
  insightsSubscribeBtn.onclick = function() {
    showNotification('Upcoming feature — coming soon!', 'info');
  };
}



// Add null check to setTheme
function setTheme(isDark) {
  const body = document.body;
  if (!body) return;
  if (isDark) {
    body.classList.add('dark-mode');
    darkBtn.classList.add('selected');
    lightBtn.classList.remove('selected');
    slider.style.left = '2px';
  } else {
    body.classList.remove('dark-mode');
    darkBtn.classList.remove('selected');
    lightBtn.classList.add('selected');
    slider.style.left = 'calc(50% - 2px)';
  }
  localStorage.setItem('darkMode', isDark);
}

(function() {
    const darkBtn = document.getElementById('theme-dark-btn');
    const lightBtn = document.getElementById('theme-light-btn');
    const slider = document.getElementById('theme-toggle-slider');
    // Load preference
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setTheme(darkPref);
    darkBtn.addEventListener('click', function() { setTheme(true); });
    lightBtn.addEventListener('click', function() { setTheme(false); });
})();
