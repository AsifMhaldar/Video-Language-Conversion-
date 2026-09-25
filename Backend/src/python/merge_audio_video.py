import sys
import json
import logging
from moviepy.editor import VideoFileClip, AudioFileClip

# Setup logging to output to stderr to not interfere with json stdout
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

def merge_audio_video(video_path, audio_path, output_path):
    try:
        logger.info(f"Loading video: {video_path}")
        video_clip = VideoFileClip(video_path)
        
        logger.info(f"Loading audio: {audio_path}")
        audio_clip = AudioFileClip(audio_path)
        
        logger.info("Setting new audio to video...")
        # Optional: we can match video duration if audio is longer
        # if audio_clip.duration > video_clip.duration:
        #     audio_clip = audio_clip.subclip(0, video_clip.duration)
        
        video_with_new_audio = video_clip.set_audio(audio_clip)
        
        logger.info(f"Writing final video to {output_path}...")
        # Suppress moviepy stdout progress bars to prevent JSON parse errors in Node.js
        video_with_new_audio.write_videofile(
            output_path, 
            codec='libx264', 
            audio_codec='aac',
            temp_audiofile='temp_audio_merge.m4a',
            remove_temp=True,
            preset='medium',
            threads=4,
            logger=None # This is crucial to prevent stdout pollution
        )
        
        video_clip.close()
        audio_clip.close()
        video_with_new_audio.close()
        
        result = {
            "success": True,
            "data": {
                "output_path": output_path
            }
        }
        print(json.dumps(result))
    except Exception as e:
        logger.error(str(e))
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "error": "Missing arguments. Usage: python merge_audio_video.py <video_path> <audio_path> <output_path>"
        }))
        sys.exit(1)
        
    video_path = sys.argv[1]
    audio_path = sys.argv[2]
    output_path = sys.argv[3]
    
    merge_audio_video(video_path, audio_path, output_path)
