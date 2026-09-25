import sys
import json
import os
from pathlib import Path

# Add the parent directory to sys.path to import your modules
sys.path.append(str(Path(__file__).parent.parent))

def extract_audio_from_video(video_path, audio_path):
    try:
        # Simulate downloading (since we have local file)
        # Just use the local path directly
        
        # Load video using moviepy
        from moviepy.editor import VideoFileClip
        video = VideoFileClip(video_path)
        
        # Check if video has audio
        if video.audio is None:
            video.close()
            raise Exception("Video has no audio track")
        
        # Extract audio
        video.audio.write_audiofile(
            audio_path,
            codec='libmp3lame',
            bitrate='192k',
            logger=None
        )
        
        duration = video.audio.duration
        video.close()
        
        return {
            "success": True,
            "data": {
                "audio_path": audio_path,
                "duration": duration,
                "size": os.path.getsize(audio_path)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    try:
        if len(sys.argv) < 3:
            print(json.dumps({
                "success": False,
                "error": "Usage: python extract_audio.py <input_video> <output_audio>"
            }))
            sys.exit(1)
        
        video_path = sys.argv[1]
        audio_path = sys.argv[2]
        
        # Validate input file
        if not os.path.exists(video_path):
            print(json.dumps({
                "success": False,
                "error": f"Input file not found: {video_path}"
            }))
            sys.exit(1)
        
        result = extract_audio_from_video(video_path, audio_path)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Script error: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()