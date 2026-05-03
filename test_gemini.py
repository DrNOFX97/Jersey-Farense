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

def test_gemini_image_generation():
    """Test Gemini 2.5 Flash image generation"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    headers = {
        'Content-Type': 'application/json'
    }

    # Simple test request - just text prompt
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Generate a simple image of a red ball on a green field"
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE"]
        }
    }

    print("Testing Gemini 2.5 Flash with simple text prompt...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)

        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")

        response_data = response.json()
        print(f"Response Data: {json.dumps(response_data, indent=2)}")

        if response.status_code == 200:
            print("\n✅ SUCCESS! API is working correctly")
            if 'candidates' in response_data and len(response_data['candidates']) > 0:
                print("✅ Got candidates in response")
                candidate = response_data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    print(f"✅ Got {len(candidate['content']['parts'])} parts")
                    for i, part in enumerate(candidate['content']['parts']):
                        if 'inlineData' in part:
                            print(f"   Part {i}: Has inlineData with mimeType: {part['inlineData'].get('mimeType')}")
        else:
            print(f"\n❌ ERROR: Status code {response.status_code}")
            if 'error' in response_data:
                print(f"Error: {response_data['error']}")

    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}: {str(e)}")

def test_with_image_data():
    """Test with actual image data"""

    # Try to find a test image
    test_image_path = Path('/Users/f.nuno/Desktop/Moshpit/Farense/Camisolas/farense-jersey-ai-editor/public/exemplo4.jpeg')

    if not test_image_path.exists():
        print(f"❌ Test image not found at {test_image_path}")
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    headers = {
        'Content-Type': 'application/json'
    }

    # Load image as base64
    print(f"\nLoading image from {test_image_path}...")
    image_base64 = load_image_as_base64(test_image_path)
    print(f"✅ Image loaded, base64 length: {len(image_base64)}")

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
                        "text": "Describe this image in one sentence"
                    }
                ]
            }
        ]
    }

    print("Testing with image data...")

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)

        print(f"\nStatus Code: {response.status_code}")
        response_data = response.json()

        if response.status_code == 200:
            print("✅ Image upload successful!")
            print(f"Response: {json.dumps(response_data, indent=2)}")
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {json.dumps(response_data, indent=2)}")

    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("GEMINI API TEST")
    print("=" * 60)

    print("\n[TEST 1] Simple text-to-image generation")
    print("-" * 60)
    test_gemini_image_generation()

    print("\n\n[TEST 2] Image upload and analysis")
    print("-" * 60)
    test_with_image_data()

    print("\n" + "=" * 60)
    print("TESTS COMPLETE")
    print("=" * 60)
