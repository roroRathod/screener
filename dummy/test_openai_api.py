import openai
import json

# Use the same settings as in your backend
OPENAI_API_KEY = "3293af50fc0b4ecf856dedb25a56fe6a"
OPENAI_MODEL = "gpt-3.5-turbo"  # Or your deployment name for Azure
OPENAI_API_BASE = "https://dev-gbiopenai.openai.azure.com/"
OPENAI_API_VERSION = "2024-02-15-preview"  # <-- Set your API version here


def test_openai_api():
    print(f"OpenAI package version: {openai.__version__}")
    print(f"Model: {OPENAI_MODEL}")
    print(f"API Base: {OPENAI_API_BASE if OPENAI_API_BASE else 'Default'}")
    print(f"API Version: {OPENAI_API_VERSION}\n")

    openai.api_key = OPENAI_API_KEY
    if OPENAI_API_BASE:
        openai.base_url = OPENAI_API_BASE
    # If you need to use the version in the API call, add it to the request as needed.
    # For example, as a header or parameter (depends on your OpenAI/Azure setup).

    try:
        response = openai.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello! Can you respond to this test?"}
            ]
            # If needed, add version=OPENAI_API_VERSION or headers={...} here
        )
        print("API call successful! Response:")
        print(json.dumps(response.model_dump(), indent=2))
    except Exception as e:
        print(f"API call failed: {e}")


if __name__ == "__main__":
    test_openai_api() 