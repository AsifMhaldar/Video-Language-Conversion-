import sys
import json
import os
from gtts import gTTS

def text_to_speech(text_file, target_language, output_audio_path):
    try:
        with open(text_file, 'r', encoding='utf-8') as f:
            text = f.read().strip()
            
        if not text:
            raise ValueError("Empty text provided")

        # gTTS expects region-qualified codes for some languages (e.g. 'zh-CN')
        gtts_language_map = {
            'zh': 'zh-CN',
        }
        language = gtts_language_map.get(target_language, target_language)
        tts = gTTS(text=text, lang=language, slow=False)
        tts.save(output_audio_path)
        
        result = {
            "success": True,
            "data": {
                "audio_path": output_audio_path
            }
        }
        print(json.dumps(result))
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "error": "Missing arguments. Usage: python text_to_speech.py <text_file> <target_language> <output_audio_path>"
        }))
        sys.exit(1)
        
    text_file = sys.argv[1]
    target_language = sys.argv[2]
    output_audio_path = sys.argv[3]
    
    text_to_speech(text_file, target_language, output_audio_path)
