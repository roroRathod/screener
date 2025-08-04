import os
from flask import Flask, request, Response, send_from_directory, jsonify
from flask_cors import CORS
import openai
import pandas as pd
from io import StringIO
from datetime import datetime
import subprocess
import time
import random

PROMPT = """
You are an expert HR analytics assistant specializing in workforce insights. Your task is to analyze employee data filtered by a specific query and generate a comprehensive, query-specific summary that provides actionable insights for business leaders.

CRITICAL REQUIREMENTS:
1. **Output Format**: Generate ONLY HTML-formatted content (no markdown). Use proper HTML tags for structure and styling.
2. **Query-Specific Analysis**: Every insight must directly relate to and explain how the query filters the data.
3. **Professional Newsletter Style**: Create content that reads like a professional business newsletter, not an email.
4. **Data Analysis**: You will be provided with a filtered employee dataset in table format. Analyze this specific data thoroughly.

ANALYSIS FRAMEWORK:
Based on the provided query and the filtered employee dataset, analyze the following areas (only include sections where relevant data exists):

**Executive Summary**
- Brief overview of what the query reveals about the workforce segment
- Key numbers and immediate insights from the dataset

**Workforce Composition**
- Headcount analysis specific to the query criteria
- Demographic breakdowns (gender, age, location, etc.) if available in the dataset
- Organizational structure insights (departments, levels, etc.)

**Talent Health Indicators**
- Attrition patterns and retention insights from the data
- Performance distribution and trends
- Career progression indicators

**Diversity & Inclusion Insights**
- Representation analysis across key dimensions present in the dataset
- Inclusion metrics and trends

**Operational Efficiency**
- Resource distribution and cost metrics from the data
- Training and development indicators
- Productivity and engagement measures

**Strategic Recommendations**
- 3-5 actionable insights for leadership based on the data analysis
- Risk mitigation strategies
- Opportunity identification

HTML FORMATTING GUIDELINES:
- Use <h2> for section headers with style="color: #1976d2; margin-top: 1.5em; margin-bottom: 0.5em;"
- Use <h3> for subsection headers with style="color: #333; margin-top: 1em;"
- Use <p> for paragraphs with style="margin-bottom: 0.8em; line-height: 1.6;"
- Use <ul> and <li> for bullet points with style="margin-bottom: 0.5em;"
- Use <strong> for emphasis
- Use <span style="background-color: #f0f8ff; padding: 0.2em 0.4em; border-radius: 3px;"> for highlighting key metrics
- Use <div style="background-color: #f8f9fa; padding: 1em; border-left: 4px solid #1976d2; margin: 1em 0;"> for callout boxes
- IMPORTANT: Use single-column layout - do not use CSS grid, flexbox, or multi-column layouts
- All content should flow vertically in a single column
- Use <div> containers with full width (100%) for each section
- CRITICAL: Do NOT include any <style> tags or CSS code in the output
- CRITICAL: Do NOT include any CSS definitions or style blocks
- CRITICAL: Only use inline styles as specified above, no external CSS
- Keep content concise and focused - avoid unnecessary verbosity
- Use actual symbols like < and > instead of HTML entities

CONTENT PRINCIPLES:
- Start each section by explaining how the query affects the data being presented
- Use specific numbers and percentages from the provided dataset
- Provide context and business implications
- Keep language professional but accessible
- Focus on trends, patterns, and actionable insights
- If data is missing for a section, skip it entirely
- Reference the actual data values from the table provided
- Keep each section concise (2-3 paragraphs maximum)
- Prioritize the most important insights first

DATA ANALYSIS INSTRUCTIONS:
- The employee dataset will be provided in a table format below
- Analyze the specific data in this table, not generic information
- Use actual numbers, percentages, and values from the dataset
- Identify patterns, trends, and anomalies in the provided data
- Make sure all insights are grounded in the actual data provided

Remember: This is a query-specific analysis based on the filtered dataset provided. Every insight should directly relate to the filtering criteria and explain its impact on the workforce segment being analyzed.
"""

# Directly declare your OpenAI API key, model, and (optionally) a custom endpoint here
OPENAI_API_KEY = "AIzaSyB8D1b17YFa37ZksnkP27qR8B8lF9O6n5Q"  # <-- Replace with your actual key
OPENAI_MODEL = "gemini-2.5-flash"  # Or another model if you prefer
OPENAI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/"

app = Flask(__name__)
CORS(app)

openai.api_key = OPENAI_API_KEY
# If using a custom endpoint (e.g., Azure), set it here
if OPENAI_API_BASE:
    openai.base_url = OPENAI_API_BASE

# Serve frontend static files from the project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

@app.route('/')
def serve_index():
    return send_from_directory(PROJECT_ROOT, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(PROJECT_ROOT, path)

@app.route('/api/ai-summary', methods=['POST'])
def ai_summary():
    data = request.get_json()
    dataframe_csv = data.get('dataframeCsv', '')
    query = data.get('query', '')

    # Convert CSV to DataFrame and then to a clear table format for Gemini
    try:
        df = pd.read_csv(StringIO(dataframe_csv))
        
        # Estimate token count and adjust accordingly
        estimated_tokens = len(dataframe_csv.split()) * 1.3  # Rough estimation
        if estimated_tokens > 150000:  # Less conservative limit
            # Reduce data size moderately
            max_rows_to_show = min(75, len(df))
        else:
            max_rows_to_show = min(150, len(df))
        
        # Create a more readable table format for Gemini API with size limits
        table_str = "FILTERED EMPLOYEE DATA TABLE:\n"
        table_str += "=" * 80 + "\n"
        
        if len(df) > max_rows_to_show:
            table_str += f"Showing first {max_rows_to_show} records out of {len(df)} total records:\n\n"
        
        table_str += df.head(max_rows_to_show).to_string(index=False, max_cols=None)
        table_str += "\n" + "=" * 80 + "\n"
        table_str += f"Total Records: {len(df)}\n"
        table_str += f"Columns: {', '.join(df.columns.tolist())}\n"
        
        # Add summary statistics to help with analysis
        if len(df) > 0:
            table_str += f"\nSUMMARY STATISTICS:\n"
            table_str += f"Sample Size: {len(df)} records\n"
            for col in df.columns:
                if df[col].dtype in ['int64', 'float64']:
                    table_str += f"{col}: min={df[col].min()}, max={df[col].max()}, mean={df[col].mean():.2f}\n"
                elif df[col].dtype == 'object':
                    unique_vals = df[col].nunique()
                    table_str += f"{col}: {unique_vals} unique values\n"
    except Exception as e:
        table_str = f"Could not parse dataframe: {e}"

    user_message = f"""{PROMPT}

QUERY APPLIED:
{query}

FILTERED EMPLOYEE DATASET (Analyze this specific data):
{table_str}

IMPORTANT: All insights must be based on the actual data in the table above. Use specific numbers, percentages, and values from this dataset.
"""

    def generate():
        max_retries = 3
        retry_delay = 10  # Start with 10 seconds
        
        for attempt in range(max_retries):
            try:
                response = openai.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an expert HR analytics assistant specializing in workforce data analysis. Generate HTML-formatted content for workforce insights. Always use proper HTML tags and styling as specified in the prompt. Analyze the provided dataset thoroughly and use actual data values in your analysis. Be precise with numbers and calculations."},
                        {"role": "user", "content": user_message}
                    ],
                    stream=True,
                    temperature=0.3,  # Lower temperature for more consistent, data-focused responses
                    max_tokens=32000,  # Increased tokens for complete comprehensive analysis
                )
                for chunk in response:
                    content = chunk.choices[0].delta.content if chunk.choices and chunk.choices[0].delta else None
                    if content:
                        yield content
                break  # Success, exit retry loop
                
            except Exception as e:
                error_str = str(e)
                if "429" in error_str and "quota" in error_str.lower() and attempt < max_retries - 1:
                    # Rate limit error, wait and retry
                    wait_time = retry_delay * (2 ** attempt) + random.uniform(0, 1)  # Exponential backoff
                    yield f"Rate limit reached. Waiting {wait_time:.1f} seconds before retry...\n"
                    time.sleep(wait_time)
                    continue
                else:
                    yield f"Error: {error_str}"
                    break

    return Response(generate(), mimetype='text/plain')

@app.route('/api/breakfast-report', methods=['POST'])
def breakfast_report():
    data = request.get_json()
    dataframe_csv = data.get('dataframeCsv', '')

    # Read the breakfast report prompt
    prompt_path = os.path.join(os.path.dirname(__file__), '../prompts/breakfastReportPrompt.txt')
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            breakfast_prompt = f.read()
    except Exception as e:
        breakfast_prompt = "Generate a comprehensive HR analytics report in HTML format."

    # Convert CSV to DataFrame and then to a clear table format for Gemini
    try:
        df = pd.read_csv(StringIO(dataframe_csv))
        
        # Estimate token count and adjust accordingly
        estimated_tokens = len(dataframe_csv.split()) * 1.3  # Rough estimation
        if estimated_tokens > 150000:  # Less conservative limit
            # Reduce data size moderately
            max_rows_to_show = min(150, len(df))
        else:
            max_rows_to_show = min(300, len(df))  # Show max 300 rows for breakfast report
        
        # Create a more readable table format for Gemini API with size limits
        table_str = "COMPLETE EMPLOYEE DATA TABLE:\n"
        table_str += "=" * 80 + "\n"
        
        if len(df) > max_rows_to_show:
            table_str += f"Showing first {max_rows_to_show} records out of {len(df)} total records:\n\n"
        
        table_str += df.head(max_rows_to_show).to_string(index=False, max_cols=None)
        table_str += "\n" + "=" * 80 + "\n"
        table_str += f"Total Records: {len(df)}\n"
        table_str += f"Columns: {', '.join(df.columns.tolist())}\n"
        
        # Add summary statistics to help with analysis
        if len(df) > 0:
            table_str += f"\nSUMMARY STATISTICS:\n"
            table_str += f"Sample Size: {len(df)} records\n"
            for col in df.columns:
                if df[col].dtype in ['int64', 'float64']:
                    table_str += f"{col}: min={df[col].min()}, max={df[col].max()}, mean={df[col].mean():.2f}\n"
                elif df[col].dtype == 'object':
                    unique_vals = df[col].nunique()
                    table_str += f"{col}: {unique_vals} unique values\n"
    except Exception as e:
        table_str = f"Could not parse dataframe: {e}"

    user_message = f"""{breakfast_prompt}

COMPLETE EMPLOYEE DATASET (Analyze this specific data):
{table_str}

IMPORTANT: All insights must be based on the actual data in the table above. Use specific numbers, percentages, and values from this dataset. Calculate relevant metrics from the raw data provided.
"""

    def generate():
        max_retries = 3
        retry_delay = 10  # Start with 10 seconds
        
        for attempt in range(max_retries):
            try:
                response = openai.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an expert HR analytics assistant specializing in workforce data analysis for the Breakfast Report. Generate HTML-formatted content. Always use proper HTML tags and styling as specified in the prompt. Analyze the provided complete dataset thoroughly and use actual data values in your analysis. Be precise with numbers and calculations."},
                        {"role": "user", "content": user_message}
                    ],
                    stream=True,
                    temperature=0.3,  # Lower temperature for more consistent, data-focused responses
                    max_tokens=32000,  # Increased tokens for complete comprehensive analysis
                )
                for chunk in response:
                    content = chunk.choices[0].delta.content if chunk.choices and chunk.choices[0].delta else None
                    if content:
                        yield content
                break  # Success, exit retry loop
                
            except Exception as e:
                error_str = str(e)
                if "429" in error_str and "quota" in error_str.lower() and attempt < max_retries - 1:
                    # Rate limit error, wait and retry
                    wait_time = retry_delay * (2 ** attempt) + random.uniform(0, 1)  # Exponential backoff
                    yield f"Rate limit reached. Waiting {wait_time:.1f} seconds before retry...\n"
                    time.sleep(wait_time)
                    continue
                else:
                    yield f"Error: {error_str}"
                    break

    return Response(generate(), mimetype='text/plain')

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    query = data.get('query')
    summary = data.get('summary')
    if not (name and email and query and summary):
        return jsonify({'error': 'Missing fields'}), 400
    # Prepare row
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    row = {
        'Date': now,
        'Name': name,
        'Email': email,
        'Query': query,
        'Body': summary,
        'Status': 'pending'
    }
    # Write to mail.xlsx
    xlsx_path = os.path.join(os.path.dirname(__file__), '../data/mail.xlsx')
    if os.path.exists(xlsx_path):
        df = pd.read_excel(xlsx_path)
        df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
    else:
        df = pd.DataFrame([row])
    df.to_excel(xlsx_path, index=False)
    # Trigger mail.py
    try:
        subprocess.Popen(['python', os.path.join(os.path.dirname(__file__), 'mail.py')])
    except Exception as e:
        return jsonify({'error': 'Failed to trigger mail script', 'details': str(e)}), 500
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(port=3001, debug=True) 
