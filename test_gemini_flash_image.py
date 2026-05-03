#!/usr/bin/env python3
import os
import requests
import json
import base64
from pathlib import Path

API_KEY = os.environ.get("GEMINI_API_KEY", "")

def load_image_as_base64(image_path):
    """Load an image file and convert to base64"""
    with open(image_path, 'rb') as f:
        return base64.standard_b64encode(f.read()).decode('utf-8')

def test_flash_image_model():
    """Test if gemini-2.5-flash-image model exists"""

    models_to_test = [
        "gemini-2.5-flash-image",
        "gemini-2.0-flash-exp",
        "gemini-exp-1121",
        "gemini-2.0-flash",
        "gemini-1.5-pro",
    ]

    test_image_path = Path('/Users/f.nuno/Desktop/Moshpit/Farense/Camisolas/farense-jersey-ai-editor/public/exemplo4.jpeg')

    if not test_image_path.exists():
        print(f"❌ Test image not found")
        return

    image_base64 = load_image_as_base64(test_image_path)
    print(f"✅ Image loaded, base64 length: {len(image_base64)}\n")

    for model in models_to_test:
        print(f"Testing model: {model}")
        print("-" * 60)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"

        headers = {
            'Content-Type': 'application/json'
        }

        # Test with image input and output request
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inlineData": {
                                "data": image_base64,
                                "mimeType": "image/jpeg"
                            }
                        },
                        {
                            "text": "Generate a realistic image of this person wearing a red and white football jersey, standing on a football pitch. Keep the face exactly the same."
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseModalities": ["IMAGE"]
            }
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            print(f"Status: {response.status_code}")

            response_data = response.json()

            if response.status_code == 200:
                print("✅ SUCCESS")
                if 'candidates' in response_data:
                    candidate = response_data['candidates'][0]
                    if 'content' in candidate and 'parts' in candidate['content']:
                        for part in candidate['content']['parts']:
                            if 'inlineData' in part:
                                print(f"   ✅ Got image with mimeType: {part['inlineData'].get('mimeType')}")
                            elif 'text' in part:
                                print(f"   Text response: {part['text'][:100]}...")
            else:
                error = response_data.get('error', {})
                print(f"❌ Error: {error.get('message', 'Unknown error')}")

        except requests.exceptions.Timeout:
            print("❌ Timeout")
        except Exception as e:
            print(f"❌ {type(e).__name__}: {str(e)}")

        print()

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING DIFFERENT GEMINI MODELS FOR IMAGE GENERATION")
    print("=" * 60)
    print()
    test_flash_image_model()
