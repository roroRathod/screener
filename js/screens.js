const fallbackOptions = {
    'Country   ': ['India', 'USA', 'UK'],
    'SBU   ': ['SBU1', 'SBU2'],
    'BU            ': ['BU1', 'BU2'],
    'Grade ': ['A', 'B', 'C'],
    'Gender-static': ['Male', 'Female'],
    'Practice        ': ['Practice1', 'Practice2']
};

function renderSidebarDemographicFilters(fields, uniqueValues) {
    const container = document.getElementById('header-demographic-filters');
    if (!container) return;
    container.innerHTML = '';

    fields.forEach(f => {
        // Label
        const label = document.createElement('label');
        label.textContent = `Select ${f.label}`;
        label.className = 'header-filter-label';
        container.appendChild(label);

        // Wrapper div
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.className = 'header-filter-dropdown';

        // Input field (fake select)
        const input = document.createElement('div');
        input.className = 'header-filter-select';
        input.tabIndex = 0;
        input.textContent = 'Select one or more';

        // Options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'dropdown-options';
        optionsContainer.style.display = 'none';

        const selectedValues = new Set();
        const options = (uniqueValues && uniqueValues[f.key]) || fallbackOptions[f.key] || [];

        // Select All and Clear controls
        const selectAllOpt = document.createElement('div');
        selectAllOpt.className = 'dropdown-option';
        selectAllOpt.style.fontWeight = 'bold';
        selectAllOpt.textContent = 'Select All';
        selectAllOpt.onclick = (e) => {
            e.stopPropagation();
            options.forEach(val => selectedValues.add(val));
            updateTags();
        };
        optionsContainer.appendChild(selectAllOpt);

        const clearOpt = document.createElement('div');
        clearOpt.className = 'dropdown-option';
        clearOpt.style.fontWeight = 'bold';
        clearOpt.textContent = 'Clear';
        clearOpt.onclick = (e) => {
            e.stopPropagation();
            selectedValues.clear();
            updateTags();
        };
        optionsContainer.appendChild(clearOpt);

        options.forEach(val => {
            const opt = document.createElement('div');
            opt.className = 'dropdown-option';
            opt.textContent = val;
            opt.onclick = (e) => {
                e.stopPropagation();
                if (selectedValues.has(val)) {
                    selectedValues.delete(val);
                } else {
                    selectedValues.add(val);
                }
                updateTags();
            };
            optionsContainer.appendChild(opt);
        });

        function updateTags() {
            tagContainer.innerHTML = '';
            if (selectedValues.size === 0) {
                input.textContent = 'Select one or more';
            } else {
                input.textContent = '';
            }

            selectedValues.forEach(val => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = val;
                const close = document.createElement('span');
                close.className = 'tag-close';
                close.textContent = '×';
                close.onclick = (e) => {
                    e.stopPropagation();
                    selectedValues.delete(val);
                    updateTags();
                };
                tag.appendChild(close);
                tagContainer.appendChild(tag);
            });
        }

        // Toggle dropdown
        input.onclick = () => {
            optionsContainer.style.display = optionsContainer.style.display === 'none' ? 'block' : 'none';
        };

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!dropdownWrapper.contains(e.target)) {
                optionsContainer.style.display = 'none';
            }
        });

        // Tag container
        const tagContainer = document.createElement('div');
        tagContainer.className = 'header-selected-tags';

        dropdownWrapper.appendChild(input);
        dropdownWrapper.appendChild(optionsContainer);
        container.appendChild(dropdownWrapper);
        container.appendChild(tagContainer);
    });
}

function loadSidebarDemographicFilters() {
    Papa.parse('data/employee.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            const fields = [
                { key: 'Country   ', label: 'Country' },
                { key: 'SBU   ', label: 'SBU' },
                { key: 'BU            ', label: 'BU Code' },
                { key: 'Grade ', label: 'Grade' },
                { key: 'Gender-static', label: 'Gender' },
                { key: 'Practice        ', label: 'Practice' }
            ];
            const uniqueValues = {};
            fields.forEach(f => {
                if (f.key !== 'Gender-static') {
                    uniqueValues[f.key] = [...new Set(data.map(row => row[f.key]).filter(Boolean))].sort();
                }
            });
            renderSidebarDemographicFilters(fields, uniqueValues);
        },
        error: function() {
            const fields = [
                { key: 'Country   ', label: 'Country' },
                { key: 'SBU   ', label: 'SBU' },
                { key: 'BU            ', label: 'BU Code' },
                { key: 'Grade ', label: 'Grade' },
                { key: 'Gender-static', label: 'Gender' },
                { key: 'Practice        ', label: 'Practice' }
            ];
            renderSidebarDemographicFilters(fields, fallbackOptions);
        }
    });
}

// Demographic variables config
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

document.getElementById('open-demographic-pane').onclick = openDemographicPane;
document.getElementById('close-demographic-pane').onclick = closeDemographicPane;

// Render demographic pane content
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('header-demographic-filters')) {
        loadSidebarDemographicFilters();
    }

    // Load demographic options from CSV if possible
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
            selectAllBtn.style.background = '#e3eafd';
            selectAllBtn.style.color = '#1976d2';
            selectAllBtn.onclick = function() {
                document.querySelectorAll('.demographic-pane .demographic-btn-group .demographic-btn').forEach(btn => {
                    btn.classList.add('selected');
                });
            };
            controls.appendChild(selectAllBtn);

            const clearAllBtn = document.createElement('button');
            clearAllBtn.textContent = 'Clear All';
            clearAllBtn.className = 'demographic-btn';
            clearAllBtn.style.background = '#f9fafb';
            clearAllBtn.style.color = '#1976d2';
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
            selectAllBtn.style.background = '#e3eafd';
            selectAllBtn.style.color = '#1976d2';
            selectAllBtn.onclick = function() {
                document.querySelectorAll('.demographic-pane .demographic-btn-group .demographic-btn').forEach(btn => {
                    btn.classList.add('selected');
                });
            };
            controls.appendChild(selectAllBtn);

            const clearAllBtn = document.createElement('button');
            clearAllBtn.textContent = 'Clear All';
            clearAllBtn.className = 'demographic-btn';
            clearAllBtn.style.background = '#f9fafb';
            clearAllBtn.style.color = '#1976d2';
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

    // Route Create button in demographic pane to newQuery.html
    var createBtn = document.querySelector('.create-btn.demographic-create-btn');
    if (createBtn) {
        createBtn.onclick = function() {
            window.location.href = 'newQuery.html';
        };
    }
});

(function() {
    const darkBtn = document.getElementById('theme-dark-btn');
    const lightBtn = document.getElementById('theme-light-btn');
    const slider = document.getElementById('theme-toggle-slider');
    const body = document.body;
    function setTheme(isDark) {
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
    // Load preference
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setTheme(darkPref);
    darkBtn.addEventListener('click', function() { setTheme(true); });
    lightBtn.addEventListener('click', function() { setTheme(false); });
})();
