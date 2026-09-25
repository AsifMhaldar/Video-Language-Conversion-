# Conversion Pipeline

## Overview

The conversion pipeline is the core feature of VideoLang AI. It runs as a background process triggered by the POST /api/conversions/convert endpoint (controllers/conversion.controller.js). Node.js orchestrates the pipeline through services/conversionPipeline.service.js, which invokes Python scripts via services/pythonRunner.service.js.

## Pipeline Steps

```
Step 1: Download video from Cloudinary          [Progress: 10%]
        ↓
Step 2: Extract audio (MoviePy)                 [Progress: 20%]
        ↓
Step 3: Transcribe audio (OpenAI Whisper API)   [Progress: 30%]
        ↓
Step 4: Auto-detect source language             [Progress: 40%]
        ↓
Step 5: Translate text (googletrans)            [Progress: 50%]
        ↓
Step 6: Add captions (BYPASSED on Windows)      [Progress: 60%]
        ↓
Step 7: Text-to-Speech (gTTS)                   [Progress: 70%]
        ↓
Step 8: Merge audio + video (MoviePy)           [Progress: 80%]
        ↓
Step 9: Upload result to Cloudinary             [Progress: 100%]
```

## Status Tracking

Conversion status is tracked in two places:
1. **In-memory Map** (conversionPipeline.service.js) - Fast access for polling
2. **MongoDB** (Conversion model) - Persistent storage

The frontend polls GET /api/conversions/:id every 2 seconds to get updates.

## Temp Files

Each conversion creates a temp directory at Backend/temp/{conversionId}/ containing:
- original_video.mp4
- extracted_audio.mp3
- caption_data.json
- captioned_video.mp4
- translated_audio.mp3
- final_video.mp4

Files are cleaned up 5 minutes after conversion completes.

## Python Runner (services/pythonRunner.service.js)

All scripts run through a single wrapper:
- Spawns `process.env.PYTHON_BIN` (default `python`) with the script path and args
- Captures stdout and parses the trailing JSON line as the result payload
- Rejects with stderr details on non-zero exit codes
- No hardcoded interpreter paths; configure via the PYTHON_BIN env var

## Python Scripts

All scripts are in Backend/src/python/ and communicate with Node.js via JSON on stdout.

### extract_audio.py
- **Purpose:** Extract audio track from video file
- **Library:** MoviePy (VideoFileClip)
- **Input:** video path, output audio path
- **Output:** JSON with audio_path, duration, size
- **Command:** python extract_audio.py <input_video> <output_audio>

### audio_to_text.py
- **Purpose:** Transcribe audio to text with timestamps
- **Library:** OpenAI Whisper API (via requests)
- **API Key:** OPENAI_API_KEY environment variable
- **Input:** audio file path
- **Output:** JSON with text, language, chunks, timestamps, word_count, char_count
- **Command:** python audio_to_text.py <audio_file>
- **Language normalization:** Whisper returns full names like "english" or "mandarin chinese". A LANGUAGE_NAME_TO_CODE map plus normalize_language_code() converts them into ISO codes ("en", "zh") so downstream steps (googletrans, gTTS) receive valid input.
- **Note:** This is the ONLY script that uses an external AI API. All other scripts use local Python libraries.

### translate_text.py
- **Purpose:** Translate text from source language to target language
- **Library:** googletrans (free, no API key needed)
- **Input:** text file path, source language code, target language code
- **Output:** JSON with translated_text, source_language, target_language
- **Command:** python translate_text.py <text_file> <source_lang> <target_lang>
- **Features:**
  - Auto-detect source language if not provided
  - Batch translation for long text (splits by sentences)
  - Chunk translation with rate limiting (0.5s delay between chunks)
  - 16 supported languages with code mapping

### text_to_speech.py
- **Purpose:** Convert translated text to speech audio
- **Library:** gTTS (Google Text-to-Speech, free)
- **Input:** text file path, target language code, output audio path
- **Output:** JSON with audio_path
- **Command:** python text_to_speech.py <text_file> <target_lang> <output_audio_path>
- **Language normalization:** gTTS expects locale-style codes for Chinese. A gtts_language_map maps 'zh' -> 'zh-CN' before invoking gTTS.

### add_captions.py
- **Purpose:** Add subtitles/captions to video
- **Library:** MoviePy (TextClip, CompositeVideoClip)
- **Status:** BYPASSED on Windows - copies video file instead of adding visual captions
- **Reason:** Requires ImageMagick which is not installed on Windows
- **Side effect:** Still generates SRT subtitle file in temp directory
- **Input:** JSON data file with video_path, output_path, transcription data
- **Output:** JSON with output_path, duration, caption_count
- **Command:** python add_captions.py <data_file.json>

### merge_audio_video.py
- **Purpose:** Replace video audio track with new audio
- **Library:** MoviePy (VideoFileClip, AudioFileClip)
- **Input:** video path, audio path, output path
- **Output:** JSON with output_path
- **Command:** python merge_audio_video.py <video_path> <audio_path> <output_path>
- **Notes:** Uses libx264 codec, AAC audio, 4 threads, medium preset

## Pipeline Functions (services/conversionPipeline.service.js)

| Function | What it does |
|----------|-------------|
| startConversionProcess() | Orchestrates the full pipeline asynchronously |
| updateConversionStatus() | Updates both in-memory Map and MongoDB |
| downloadVideo() | Downloads video from Cloudinary via curl |
| extractAudio() | Calls extract_audio.py via pythonRunner |
| transcribeAudio() | Calls audio_to_text.py, parses JSON result |
| translateText() | Creates temp text file, calls translate_text.py |
| addCaptionsToVideo(videoPath, outputPath, transcription, sourceLang, targetLang) | Creates caption data JSON, calls add_captions.py - receives targetLanguage explicitly (previously read an undefined variable) |
| textToSpeech() | Creates temp text file, calls text_to_speech.py |
| mergeAudioVideo() | Calls merge_audio_video.py |
| cleanupTempFiles() | Removes temp files and directory |

## Python Dependencies

```
moviepy
gTTS
googletrans==4.0.0-rc1
requests
numpy
python-dotenv
```

Install: pip install moviepy gTTS googletrans==4.0.0-rc1 requests numpy python-dotenv

## Known Issues

1. **Captioning bypassed:** add_captions.py just copies the file instead of adding visual subtitles due to ImageMagick dependency on Windows
2. **OpenAI API dependency:** audio_to_text.py requires OPENAI_API_KEY and calls the Whisper API externally
3. **No video trimming:** Long videos may cause memory issues during MoviePy processing
4. **Single-threaded:** Each conversion runs sequentially in the Node.js process
