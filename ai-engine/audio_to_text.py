import sys
import json
import os
import shutil
import io
import contextlib
import warnings
from pathlib import Path

# Suppress non-critical warnings so stdout remains clean JSON
warnings.filterwarnings("ignore")

def ensure_ffmpeg_in_path():
    """
    Ensure ffmpeg is discoverable in PATH on Windows for Whisper and MoviePy.
    """
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffmpeg_dir = os.path.dirname(ffmpeg_exe)
        standard_ffmpeg = os.path.join(ffmpeg_dir, 'ffmpeg.exe')
        if not os.path.exists(standard_ffmpeg):
            shutil.copyfile(ffmpeg_exe, standard_ffmpeg)
        if ffmpeg_dir not in os.environ.get("PATH", ""):
            os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
    except Exception:
        pass

ensure_ffmpeg_in_path()

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

def transcribe_with_local_whisper(audio_path):
    """
    Transcribes audio using local offline Whisper model.
    Runs 100% locally on CPU or GPU without any OpenAI API keys, credits, or billing.
    """
    import whisper

    model_name = os.environ.get('WHISPER_MODEL', 'base')
    model = whisper.load_model(model_name)

    # fp16=False ensures smooth execution on standard CPUs without CUDA half-precision errors
    # Redirect stdout & stderr during transcribe to suppress tqdm and progress output
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        result = model.transcribe(audio_path, verbose=False, fp16=False)

    detected_lang = normalize_language_code(result.get('language', 'en'))
    text = (result.get('text') or '').strip()
    segments = result.get('segments', [])

    chunks = []
    timestamps = []
    for seg in segments:
        seg_text = seg.get('text', '').strip()
        if seg_text:
            chunks.append(seg_text)
            timestamps.append(float(seg.get('start', 0.0)))

    if not chunks and text:
        chunks = [text]
        timestamps = [0.0]

    return {
        "text": text,
        "language": detected_lang,
        "chunks": chunks,
        "timestamps": timestamps,
        "word_count": len(text.split()),
        "char_count": len(text)
    }

def transcribe_with_speech_recognition(audio_path):
    """
    Fallback transcription using SpeechRecognition library (free).
    """
    import speech_recognition as sr
    from pydub import AudioSegment

    wav_path = audio_path
    temp_wav = False
    if not audio_path.lower().endswith('.wav'):
        sound = AudioSegment.from_file(audio_path)
        wav_path = audio_path + '.temp.wav'
        sound.export(wav_path, format='wav')
        temp_wav = True

    try:
        r = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = r.record(source)
            text = r.recognize_google(audio_data)
            return {
                "text": text,
                "language": "en",
                "chunks": [text],
                "timestamps": [0.0],
                "word_count": len(text.split()),
                "char_count": len(text)
            }
    finally:
        if temp_wav and os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except Exception:
                pass

def transcribe_audio(audio_path):
    # Strategy 1: Offline Local Whisper Model (No API key, No credits)
    try:
        data = transcribe_with_local_whisper(audio_path)
        return {
            "success": True,
            "data": data
        }
    except Exception as e_whisper:
        sys.stderr.write(f"Local Whisper warning: {str(e_whisper)}\n")

    # Strategy 2: Free SpeechRecognition Fallback
    try:
        data = transcribe_with_speech_recognition(audio_path)
        return {
            "success": True,
            "data": data
        }
    except Exception as e_sr:
        sys.stderr.write(f"SpeechRecognition fallback error: {str(e_sr)}\n")

    return {
        "success": False,
        "error": "Failed to transcribe audio with local speech models."
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
