"""
Module: translate_text.py
Purpose: Translate text from source language to target language
Uses Google Translate API (free tier with googletrans)
"""

import sys
import os
import json
import logging
from googletrans import Translator
import time

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TextTranslator:
    def __init__(self):
        """
        Initialize Text Translator
        Uses googletrans library (free, no API key needed)
        """
        self.translator = Translator()
        
        # Language mapping (frontend code to translator format)
        self.language_map = {
            'en': 'en',      # English
            'es': 'es',      # Spanish
            'fr': 'fr',      # French
            'de': 'de',      # German
            'it': 'it',      # Italian
            'pt': 'pt',      # Portuguese
            'ru': 'ru',      # Russian
            'ja': 'ja',      # Japanese
            'ko': 'ko',      # Korean
            'zh': 'zh-cn',   # Chinese (Simplified)
            'ar': 'ar',      # Arabic
            'hi': 'hi',      # Hindi
            'bn': 'bn',      # Bengali
            'te': 'te',      # Telugu
            'mr': 'mr',      # Marathi
            'ta': 'ta',      # Tamil
        }
        
        logger.info("✅ TextTranslator initialized")
    
    def detect_language(self, text):
        """
        Detect language of given text
        
        Args:
            text: Text to detect language from
            
        Returns:
            str: Detected language code (e.g., 'en', 'hi')
        """
        try:
            logger.info("🔍 Detecting language from text...")
            
            # Take first 500 characters for detection
            sample = text[:500] if len(text) > 500 else text
            
            detection = self.translator.detect(sample)
            detected_lang = detection.lang
            confidence = detection.confidence
            
            logger.info(f"✅ Language detected: {detected_lang} (confidence: {confidence:.2%})")
            
            return detected_lang
            
        except Exception as e:
            logger.error(f"❌ Error detecting language: {e}")
            return 'en'  # Default to English
    
    def translate_text(self, text, target_language, source_language=None):
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_language: Target language code (e.g., 'hi', 'es')
            source_language: Source language code (None = auto-detect)
            
        Returns:
            dict: {
                'translated_text': str,
                'source_language': str,
                'target_language': str,
                'original_text': str
            }
        """
        try:
            logger.info(f"🌐 Translating text to {target_language}...")
            
            # Map language codes
            target_lang = self.language_map.get(target_language, target_language)
            source_lang = self.language_map.get(source_language, source_language) if source_language else None
            
            # Detect source language if not provided
            if not source_lang:
                source_lang = self.detect_language(text)
            
            logger.info(f"📝 Source: {source_lang} → Target: {target_lang}")
            
            # Check if translation is needed
            if source_lang == target_lang:
                logger.warning("⚠️ Source and target languages are the same!")
                return {
                    'translated_text': text,
                    'source_language': source_lang,
                    'target_language': target_lang,
                    'original_text': text,
                    'translation_needed': False
                }
            
            # Translate
            translation = self.translator.translate(
                text,
                src=source_lang,
                dest=target_lang
            )
            
            translated_text = translation.text
            
            logger.info(f"✅ Translation completed!")
            logger.info(f"📊 Original length: {len(text)} characters")
            logger.info(f"📊 Translated length: {len(translated_text)} characters")
            
            return {
                'translated_text': translated_text,
                'source_language': source_lang,
                'target_language': target_lang,
                'original_text': text,
                'translation_needed': True
            }
            
        except Exception as e:
            logger.error(f"❌ Translation error: {e}")
            raise Exception(f"Failed to translate text: {str(e)}")
    
    def translate_chunks(self, chunks, target_language, source_language=None):
        """
        Translate multiple text chunks (for long videos)
        
        Args:
            chunks: List of text chunks
            target_language: Target language code
            source_language: Source language code (None = auto-detect)
            
        Returns:
            dict: {
                'translated_chunks': list,
                'translated_text': str (all chunks joined),
                'source_language': str,
                'target_language': str
            }
        """
        try:
            logger.info(f"🔄 Translating {len(chunks)} chunks...")
            
            # Map language codes
            target_lang = self.language_map.get(target_language, target_language)
            source_lang = self.language_map.get(source_language, source_language) if source_language else None
            
            # Detect language from first chunk if not provided
            if not source_lang and chunks:
                source_lang = self.detect_language(chunks[0])
            
            translated_chunks = []
            
            for i, chunk in enumerate(chunks):
                if not chunk or len(chunk.strip()) == 0:
                    translated_chunks.append("")
                    continue
                
                try:
                    # Add small delay to avoid rate limiting
                    if i > 0:
                        time.sleep(0.5)
                    
                    translation = self.translator.translate(
                        chunk,
                        src=source_lang,
                        dest=target_lang
                    )
                    
                    translated_chunks.append(translation.text)
                    logger.info(f"✅ Chunk {i+1}/{len(chunks)} translated")
                    
                except Exception as e:
                    logger.error(f"❌ Error translating chunk {i+1}: {e}")
                    translated_chunks.append(chunk)  # Keep original if translation fails
            
            # Join all chunks
            full_translated_text = " ".join(translated_chunks)
            
            logger.info(f"✅ All {len(chunks)} chunks translated!")
            
            return {
                'translated_chunks': translated_chunks,
                'translated_text': full_translated_text,
                'source_language': source_lang,
                'target_language': target_lang,
                'total_chunks': len(chunks)
            }
            
        except Exception as e:
            logger.error(f"❌ Error translating chunks: {e}")
            raise Exception(f"Failed to translate chunks: {str(e)}")
    
    def batch_translate(self, texts, target_language, source_language=None, max_chars=5000):
        """
        Translate multiple texts efficiently (batching for long content)
        
        Args:
            texts: List of texts or single long text
            target_language: Target language code
            source_language: Source language code (None = auto-detect)
            max_chars: Maximum characters per batch (default: 5000)
            
        Returns:
            dict: Translation results
        """
        try:
            # If single text is provided
            if isinstance(texts, str):
                # Split into chunks if too long
                if len(texts) > max_chars:
                    logger.info(f"📄 Text is {len(texts)} chars, splitting into chunks...")
                    
                    # Split by sentences/paragraphs
                    chunks = []
                    current_chunk = ""
                    
                    sentences = texts.split('. ')
                    
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) < max_chars:
                            current_chunk += sentence + ". "
                        else:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            current_chunk = sentence + ". "
                    
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    
                    logger.info(f"📦 Split into {len(chunks)} chunks")
                    
                    return self.translate_chunks(chunks, target_language, source_language)
                else:
                    # Short text, translate directly
                    return self.translate_text(texts, target_language, source_language)
            else:
                # Multiple texts provided
                return self.translate_chunks(texts, target_language, source_language)
                
        except Exception as e:
            logger.error(f"❌ Batch translation error: {e}")
            raise
    
    def get_supported_languages(self):
        """
        Get list of supported languages
        
        Returns:
            dict: Language codes and names
        """
        return {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'bn': 'Bengali',
            'te': 'Telugu',
            'mr': 'Marathi',
            'ta': 'Tamil'
        }


# ==========================================
# Example Usage
# ==========================================

def main():
    try:
        # Disable logging to stdout to prevent corrupting JSON output
        logging.getLogger().setLevel(logging.ERROR)
        
        if len(sys.argv) < 4:
            print(json.dumps({
                "success": False,
                "error": "Usage: python translate_text.py <text_file> <source_lang> <target_lang>"
            }))
            sys.exit(1)
            
        text_file = sys.argv[1]
        source_lang = sys.argv[2]
        target_lang = sys.argv[3]
        
        if not os.path.exists(text_file):
            print(json.dumps({
                "success": False,
                "error": f"Text file not found: {text_file}"
            }))
            sys.exit(1)
            
        with open(text_file, 'r', encoding='utf-8') as f:
            text = f.read()
            
        translator = TextTranslator()
        
        # Handle 'auto' or missing source language
        if source_lang == 'detecting...' or source_lang == 'auto' or not source_lang or source_lang == 'None':
            source_lang = None
            
        result = translator.batch_translate(
            texts=text,
            target_language=target_lang,
            source_language=source_lang
        )
        
        print(json.dumps({
            "success": True,
            "data": result
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()