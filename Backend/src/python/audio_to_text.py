import sys
import json
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

# Whisper returns full English language names (e.g. "english").
# Normalize them to ISO 639-1 codes used by translate/TTS steps.
LANGUAGE_NAME_TO_CODE = {
    'english': 'en', 'spanish': 'es', 'french': 'fr', 'german': 'de',
    'italian': 'it', 'portuguese': 'pt', 'russian': 'ru', 'japanese': 'ja',
    'korean': 'ko', 'chinese': 'zh', 'arabic': 'ar', 'hindi': 'hi',
    'bengali': 'bn', 'telugu': 'te', 'marathi': 'mr', 'tamil': 'ta',
    'urdu': 'ur', 'punjabi': 'pa', 'gujarati': 'gu', 'kannada': 'kn',
    'malayalam': 'ml', 'nepali': 'ne', 'thai': 'th', 'vietnamese': 'vi',
    'indonesian': 'id', 'malay': 'ms', 'turkish': 'tr', 'dutch': 'nl',
    'polish': 'pl', 'ukrainian': 'uk', 'hebrew': 'he', 'persian': 'fa',
    'swedish': 'sv', 'norwegian': 'no', 'danish': 'da', 'finnish': 'fi',
    'greek': 'el', 'czech': 'cs', 'hungarian': 'hu', 'romanian': 'ro',
}

def normalize_language_code(language):
    if not language:
        return 'en'
    lang = str(language).strip().lower()
    if lang in LANGUAGE_NAME_TO_CODE:
        return LANGUAGE_NAME_TO_CODE[lang]
    if len(lang) == 2:
        return lang
    return 'en'

def transcribe_audio(audio_path):
    try:
        import requests

        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return {
                "success": False,
                "error": "OPENAI_API_KEY environment variable is not set"
            }

        with open(audio_path, 'rb') as audio_file:
            response = requests.post(
                'https://api.openai.com/v1/audio/transcriptions',
                headers={'Authorization': f'Bearer {api_key}'},
                files={'file': (os.path.basename(audio_path), audio_file)},
                data={'model': 'whisper-1', 'response_format': 'verbose_json'}
            )

        if response.status_code != 200:
            return {
                "success": False,
                "error": f"OpenAI API error ({response.status_code}): {response.text}"
            }

        result = response.json()
        language = normalize_language_code(result.get('language', 'en'))
        text = result.get('text', '')
        segments = result.get('segments', [])

        chunks = []
        timestamps = []
        for seg in segments:
            chunks.append(seg.get('text', '').strip())
            timestamps.append(seg.get('start', 0.0))

        return {
            "success": True,
            "data": {
                "text": text,
                "language": language,
                "chunks": chunks if chunks else [text],
                "timestamps": timestamps if timestamps else [0.0],
                "word_count": len(text.split()),
                "char_count": len(text)
            }
        }

    except ImportError:
        return {
            "success": False,
            "error": "requests library not installed. Run: pip install requests"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({
                "success": False,
                "error": "Usage: python audio_to_text.py <audio_file>"
            }))
            sys.exit(1)

        audio_path = sys.argv[1]

        if not os.path.exists(audio_path):
            print(json.dumps({
                "success": False,
                "error": f"Audio file not found: {audio_path}"
            }))
            sys.exit(1)

        result = transcribe_audio(audio_path)
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Script error: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
