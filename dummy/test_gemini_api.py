import requests
import json

GEMINI_API_KEY = "AIzaSyB8D1b17YFa37ZksnkP27qR8B8lF9O6n5Q"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": GEMINI_API_KEY
}

payload = {
    "contents": [
        {
            "parts": [
                {"text": "Explain how AI works in a few words"}
            ]
        }
    ]
}

def test_gemini_api():
    print(f"Testing Gemini API at: {GEMINI_API_URL}")
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        resp_json = response.json()
        # Try to extract the answer text
        try:
            answer = resp_json["candidates"][0]["content"]["parts"][0]["text"]
            print("Gemini API answer:")
            print(answer)
        except Exception:
            print("Could not extract answer text. Full response:")
            print(json.dumps(resp_json, indent=2))
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error: {e}")
        if e.response is not None:
            print(e.response.text)
    except Exception as e:
        print(f"API call failed: {e}")

if __name__ == "__main__":
    test_gemini_api() 