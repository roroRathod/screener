# Workforce360

Workforce360 is a modern, interactive analytics platform for workforce intelligence and HR analytics. It allows users to explore, filter, and analyze employee data with a beautiful, responsive interface—all running entirely in the browser with no backend required.

![Workforce360 Screenshot](assets/logo.png)

## Features

- 📊 **Interactive Data Analytics:** Query, filter, and visualize employee data directly in the browser.
- 📝 **Custom Query Builder:** Build complex queries with a user-friendly interface.
- 💾 **Save & Download Queries:** Save your favorite queries and download filtered datasets as CSV.
- 🌙 **Dark/Light Mode:** Toggle between dark and light themes for comfortable viewing.
- 🏷️ **Demographic Filters:** Easily filter by gender, country, department, and more.
- 🔔 **Subscribe to Queries:** Integrates with Google Forms for notifications.
- ⚡ **100% Static:** No backend or server required—works perfectly on GitHub Pages.

## Project Structure

```
workforce360/
├── index.html              # Landing page (redirects to main app)
├── screens.html            # Main analytics dashboard
├── newQuery.html           # Query builder interface
├── savedQuery.html         # Saved queries
├── subscribe-form-template.html # Google Forms subscription template
├── css/
│   ├── screens.css         # Main styles
│   ├── newQuery.css        # Query builder styles
│   └── savedQuery.css      # Saved queries styles
├── js/
│   ├── screens.js          # Dashboard logic
│   ├── newQuery.js         # Query builder logic
│   └── savedQuery.js       # Saved queries logic
├── data/
│   └── employee.csv        # Employee data (CSV)
├── assets/
│   └── logo.png            # Logo and images
└── README.md               # Project documentation
```

## Getting Started


### **Open in Browser**
Just open `index.html` in your browser. All features work offline!


## Gemini AI Summary Integration

1. Place the Netlify function in `netlify/functions/gemini-summary.js`.
2. The function expects a POST request with JSON: `{ prompt, csv }`.
3. The frontend should call `/.netlify/functions/gemini-summary` to get the summary.
4. Requires a valid Gemini API key (already included in the function for demo).


