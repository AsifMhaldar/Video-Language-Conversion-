import os
import sys
import json
import whisper
from googletrans import Translator
from gtts import gTTS
from moviepy.editor import VideoFileClip, AudioFileClip
import requests
import tempfile
import io
from urllib.parse import urlparse

class OnlineVideoConverter:
    def __init__(self):
        self.translator = Translator()
        self.whisper_model = None
        
    def load_whisper_model(self, model_size="base"):
        """Load Whisper model for transcription"""
        if self.whisper_model is None:
            print(f"Loading Whisper model ({model_size})...", flush=True)
            self.whisper_model = whisper.load_model(model_size)
            print("Whisper model loaded", flush=True)
        
    def stream_download_video(self, video_url):
        """Stream download video to temporary file"""
        print("Downloading video...", flush=True)
        
        # Create temporary file
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        
        try:
            response = requests.get(video_url, stream=True, timeout=300)
            response.raise_for_status()
            
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    temp_video.write(chunk)
            
            temp_video.close()
            print(f"Video downloaded: {temp_video.name}", flush=True)
            return temp_video.name
            
        except Exception as e:
            temp_video.close()
            os.unlink(temp_video.name)
            raise Exception(f"Failed to download video: {str(e)}")
    
    def extract_audio_stream(self, video_path):
        """Extract audio to temporary file"""
        print("Extracting audio...", flush=True)
        
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_audio.close()
        
        try:
            video = VideoFileClip(video_path)
            video.audio.write_audiofile(
                temp_audio.name,
                verbose=False,
                logger=None
            )
            video.close()
            
            print(f"Audio extracted: {temp_audio.name}", flush=True)
            return temp_audio.name
            
        except Exception as e:
            if os.path.exists(temp_audio.name):
                os.unlink(temp_audio.name)
            raise Exception(f"Failed to extract audio: {str(e)}")
    
    def detect_and_transcribe(self, audio_path):
        """Detect language and transcribe audio using Whisper"""
        if self.whisper_model is None:
            self.load_whisper_model()
        
        print("Detecting language and transcribing...", flush=True)
        
        # Whisper will auto-detect language
        result = self.whisper_model.transcribe(
            audio_path,
            fp16=False,
            verbose=False
        )
        
        detected_language = result["language"]
        transcription = result["text"]
        
        print(f"Detected language: {detected_language}", flush=True)
        print(f"Transcription preview: {transcription[:100]}...", flush=True)
        
        return detected_language, transcription
    
    def translate_text_stream(self, text, source_lang, target_lang):
        """Translate text in chunks"""
        print(f"Translating from {source_lang} to {target_lang}...", flush=True)
        
        # Handle long text by chunking
        max_chunk = 4500
        chunks = [text[i:i+max_chunk] for i in range(0, len(text), max_chunk)]
        
        translated_chunks = []
        for i, chunk in enumerate(chunks):
            try:
                translation = self.translator.translate(
                    chunk,
                    src=source_lang,
                    dest=target_lang
                )
                translated_chunks.append(translation.text)
                print(f"Translated chunk {i+1}/{len(chunks)}", flush=True)
            except Exception as e:
                print(f"Translation error on chunk {i+1}: {str(e)}", flush=True)
                translated_chunks.append(chunk)  # Fallback to original
        
        translated_text = ' '.join(translated_chunks)
        print(f"Translation preview: {translated_text[:100]}...", flush=True)
        
        return translated_text
    
    def generate_audio_stream(self, text, target_language):
        """Generate speech audio to temporary file"""
        print(f"Generating speech in {target_language}...", flush=True)
        
        temp_tts = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        temp_tts.close()
        
        try:
            # Map language codes for gTTS
            lang_map = {
                'en': 'en', 'es': 'es', 'fr': 'fr', 'de': 'de',
                'it': 'it', 'pt': 'pt', 'ru': 'ru', 'ja': 'ja',
                'ko': 'ko', 'zh': 'zh-CN', 'ar': 'ar', 'hi': 'hi'
            }
            
            gtts_lang = lang_map.get(target_language, 'en')
            
            tts = gTTS(text=text, lang=gtts_lang, slow=False)
            tts.save(temp_tts.name)
            
            print(f"Speech generated: {temp_tts.name}", flush=True)
            return temp_tts.name
            
        except Exception as e:
            if os.path.exists(temp_tts.name):
                os.unlink(temp_tts.name)
            raise Exception(f"Failed to generate speech: {str(e)}")
    
    def merge_audio_video_stream(self, video_path, audio_path):
        """Merge audio with video and return temporary file"""
        print("Merging audio with video...", flush=True)
        
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        temp_output.close()
        
        try:
            video = VideoFileClip(video_path)
            new_audio = AudioFileClip(audio_path)
            
            # Set new audio
            final_video = video.set_audio(new_audio)
            
            # Write to temporary file
            final_video.write_videofile(
                temp_output.name,
                codec='libx264',
                audio_codec='aac',
                verbose=False,
                logger=None,
                preset='ultrafast',  # Faster encoding
                threads=4
            )
            
            # Cleanup
            video.close()
            new_audio.close()
            final_video.close()
            
            print(f"Video merged: {temp_output.name}", flush=True)
            return temp_output.name
            
        except Exception as e:
            if os.path.exists(temp_output.name):
                os.unlink(temp_output.name)
            raise Exception(f"Failed to merge video: {str(e)}")
    
    def convert_video_online(self, video_url, target_language, progress_callback=None):
        """
        Main conversion function - fully online, no permanent storage
        
        Args:
            video_url: URL of video to convert
            target_language: Target language code (e.g., 'es', 'fr')
            progress_callback: Function to call with progress updates
            
        Returns:
            dict with conversion results
        """
        temp_files = []
        
        try:
            if progress_callback:
                progress_callback(5, "Starting conversion...")
            
            # Step 1: Download video to temp
            if progress_callback:
                progress_callback(10, "Downloading video...")
            video_path = self.stream_download_video(video_url)
            temp_files.append(video_path)
            
            # Step 2: Extract audio to temp
            if progress_callback:
                progress_callback(25, "Extracting audio...")
            audio_path = self.extract_audio_stream(video_path)
            temp_files.append(audio_path)
            
            # Step 3: Auto-detect language and transcribe
            if progress_callback:
                progress_callback(40, "Detecting language and transcribing...")
            detected_lang, transcription = self.detect_and_transcribe(audio_path)
            
            # Check if already in target language
            if detected_lang == target_language:
                raise Exception(f"Video is already in {target_language}")
            
            # Step 4: Translate
            if progress_callback:
                progress_callback(60, "Translating text...")
            translated_text = self.translate_text_stream(
                transcription,
                detected_lang,
                target_language
            )
            
            # Step 5: Generate new audio
            if progress_callback:
                progress_callback(75, "Generating new audio...")
            new_audio_path = self.generate_audio_stream(translated_text, target_language)
            temp_files.append(new_audio_path)
            
            # Step 6: Merge audio with video
            if progress_callback:
                progress_callback(90, "Merging video and audio...")
            final_video_path = self.merge_audio_video_stream(video_path, new_audio_path)
            temp_files.append(final_video_path)
            
            if progress_callback:
                progress_callback(100, "Conversion complete!")
            
            result = {
                'success': True,
                'output_path': final_video_path,
                'detected_language': detected_lang,
                'target_language': target_language,
                'transcription': transcription,
                'translation': translated_text,
                'temp_files': temp_files  # For cleanup
            }
            
            return result
            
        except Exception as e:
            print(f"Error: {str(e)}", flush=True)
            
            # Cleanup temp files on error
            for temp_file in temp_files:
                try:
                    if os.path.exists(temp_file):
                        os.unlink(temp_file)
                except:
                    pass
            
            if progress_callback:
                progress_callback(-1, f"Error: {str(e)}")
            
            return {
                'success': False,
                'error': str(e)
            }

def cleanup_temp_files(file_list):
    """Clean up temporary files"""
    for file_path in file_list:
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                print(f"Cleaned up: {file_path}", flush=True)
        except Exception as e:
            print(f"Failed to cleanup {file_path}: {str(e)}", flush=True)

def main():
    """CLI interface"""
    if len(sys.argv) < 3:
        print("Usage: python online_converter.py <video_url> <target_language>")
        print("Example: python online_converter.py https://example.com/video.mp4 es")
        sys.exit(1)
    
    video_url = sys.argv[1]
    target_lang = sys.argv[2]
    
    def progress_callback(progress, message):
        print(f"[{progress}%] {message}", flush=True)
    
    converter = OnlineVideoConverter()
    result = converter.convert_video_online(
        video_url,
        target_lang,
        progress_callback
    )
    
    print("\n" + "="*50, flush=True)
    if result['success']:
        print("✅ Conversion successful!", flush=True)
        print(f"Detected: {result['detected_language']}", flush=True)
        print(f"Converted to: {result['target_language']}", flush=True)
        print(f"Output: {result['output_path']}", flush=True)
    else:
        print("❌ Conversion failed!", flush=True)
        print(f"Error: {result['error']}", flush=True)
    print("="*50, flush=True)
    
    # Output JSON result
    json_output = {
        'success': result['success'],
        'output_path': result.get('output_path'),
        'detected_language': result.get('detected_language'),
        'target_language': result.get('target_language'),
        'transcription': result.get('transcription'),
        'translation': result.get('translation'),
        'error': result.get('error')
    }
    
    print(f"\nJSON_RESULT:{json.dumps(json_output)}", flush=True)

if __name__ == "__main__":
    main()