import pandas as pd 
import win32com.client as win32
import os 

file_path = os.path.join(os.path.dirname(__file__), '../data/mail.xlsx')
df = pd.read_excel(file_path)
if 'status' not in df.columns:
    df['status'] = ''

outlook = win32.Dispatch('outlook.application')

for idx, row in df.iterrows():
    if str(row.get('status', '')).strip().lower() != 'sent':
        recipient = row.get('email', '')
        name = row.get('name', '')
        query = row.get('query', '')
        body = row.get('body', '')
        subject = f'Workforce360 subscription to {query}'
        body = f"""Dear {name},\nHere is ur AI analysis newsletter for {query}\n\n{body}"""
        try:
            mail = outlook.CreateItem(0)
            mail.To = recipient
            mail.Subject = subject
            mail.Body = body
            mail.Send()
            df.at[idx, 'status'] = 'sent'
        except Exception as e:
            print(f'Failed to send to {recipient}: {e}')
df.to_excel(file_path, index=False) 





