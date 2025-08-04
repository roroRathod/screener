// Load navbar
fetch('navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar').innerHTML = html;
    if (typeof setupNavbar === 'function') setupNavbar();
  });

// Fetch and display employee.csv data as a dataframe
window.addEventListener('DOMContentLoaded', () => {
  Papa.parse('data/employee.csv', {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data;
      renderDataFrameTable(data);
      generateBreakfastReport(data);
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
    var subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.onclick = function() {
            var notification = document.getElementById('notification');
            if (notification) {
                notification.textContent = 'Upcoming feature — coming soon!';
                notification.className = 'notification info';
                notification.style.display = 'block';
                setTimeout(function() {
                    notification.style.display = 'none';
                }, 2500);
            }
        };
    }
});

function renderDataFrameTable(data) {
  if (!data.length) return;
  const container = document.getElementById('dataframe-container');
  container.innerHTML = '';
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
  // Add dataframe-actions div (empty, for layout consistency)
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'dataframe-actions';
  container.appendChild(actionsDiv);
}

function generateBreakfastReport(data) {
  const container = document.getElementById('newsletter-container');
  if (!container) return;

  // Convert data to CSV string
  const csvContent = Papa.unparse(data);

  // Show loading state
  container.innerHTML = `
    <div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 1em; width: 100%;">
      <button class="subscribe-btn" id="subscribe-btn">Subscribe</button>
    </div>
    <div style="text-align: center; padding: 4em 2em; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <p style="font-size: 1.2em; color: #666; margin-bottom: 1.5em;">Generating Breakfast Report...</p>
      <div class="loading-spinner"></div>
    </div>
  `;

  // Add CSS for loading animation
  if (!document.querySelector('#loading-style')) {
    const style = document.createElement('style');
    style.id = 'loading-style';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .loading-spinner {
        width: 60px !important;
        height: 60px !important;
        border: 4px solid #f3f3f3 !important;
        border-top: 4px solid #1976d2 !important;
        border-radius: 50% !important;
        animation: spin 1s linear infinite !important;
        margin: 0 auto !important;
        display: block !important;
        flex-shrink: 0 !important;
        box-sizing: border-box !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Call the breakfast report API
  fetch('/api/breakfast-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataframeCsv: csvContent
    })
  })
  .then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    function readStream() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          // Stream complete, display the result
          // Check if content contains HTML entities and decode them
          let processedResult = result;
          if (result.includes('&lt;') || result.includes('&gt;') || result.includes('&amp;')) {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = result;
            processedResult = textarea.value;
          }
          
          // Remove any CSS code blocks that might be included
          processedResult = processedResult.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
          processedResult = processedResult.replace(/<style[^>]*\/>/gi, '');
          processedResult = processedResult.replace(/body\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/h1\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/h2\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/h3\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/p\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/ul\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/li\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/\.callout\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/\.highlight\s*\{[^}]*\}/gi, '');
          processedResult = processedResult.replace(/\.section-container\s*\{[^}]*\}/gi, '');
          
          // Remove any truncated content indicators
          processedResult = processedResult.replace(/\.\.\.$/gi, '');
          processedResult = processedResult.replace(/\[truncated\]/gi, '');
          processedResult = processedResult.replace(/\[incomplete\]/gi, '');
          
          container.innerHTML = `
            <div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 1em; width: 100%;">
              <button class="subscribe-btn" id="subscribe-btn">Subscribe</button>
            </div>
            <div id="breakfast-report-content" style="font-family: inherit; max-width: 100%; margin: 0; border: none; box-shadow: none; white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">${processedResult}</div>
          `;
          
          // Re-attach event listener to subscribe button
          const subscribeBtn = document.getElementById('subscribe-btn');
          if (subscribeBtn) {
            subscribeBtn.onclick = function() {
              var notification = document.getElementById('notification');
              if (notification) {
                notification.textContent = 'Upcoming feature — coming soon!';
                notification.className = 'notification info';
                notification.style.display = 'block';
                setTimeout(function() {
                  notification.style.display = 'none';
                }, 2500);
              }
            };
          }
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        
        // Check if content contains HTML entities and decode them
        let processedResult = result;
        if (result.includes('&lt;') || result.includes('&gt;') || result.includes('&amp;')) {
          const textarea = document.createElement('textarea');
          textarea.innerHTML = result;
          processedResult = textarea.value;
        }
        
        // Remove any CSS code blocks that might be included
        processedResult = processedResult.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        processedResult = processedResult.replace(/<style[^>]*\/>/gi, '');
        processedResult = processedResult.replace(/body\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/h1\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/h2\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/h3\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/p\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/ul\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/li\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/\.callout\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/\.highlight\s*\{[^}]*\}/gi, '');
        processedResult = processedResult.replace(/\.section-container\s*\{[^}]*\}/gi, '');
        
        // Remove any truncated content indicators
        processedResult = processedResult.replace(/\.\.\.$/gi, '');
        processedResult = processedResult.replace(/\[truncated\]/gi, '');
        processedResult = processedResult.replace(/\[incomplete\]/gi, '');
        
        // Update the content in real-time
        container.innerHTML = `
          <div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 1em; width: 100%;">
            <button class="subscribe-btn" id="subscribe-btn">Subscribe</button>
          </div>
          <div id="breakfast-report-content" style="font-family: inherit; max-width: 100%; margin: 0; border: none; box-shadow: none; white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">${processedResult}</div>
        `;

        return readStream();
      });
    }

    return readStream();
  })
  .catch(error => {
    console.error('Error generating breakfast report:', error);
    container.innerHTML = `
      <div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 1em; width: 100%;">
        <button class="subscribe-btn" id="subscribe-btn">Subscribe</button>
      </div>
      <div style="text-align: center; padding: 2em; color: #d32f2f;">
        <p>Error generating report. Please try again.</p>
        <button onclick="location.reload()" style="background: #1976d2; color: white; border: none; padding: 0.5em 1em; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>
    `;
  });
} 