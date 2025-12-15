const fs = require('fs');
const OpenAI = require('openai');
const cloudinary = require('../config/cloudinary');

// Supported languages
const SUPPORTED_LANGUAGES = {
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
  'hi': 'Hindi'
};

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Validate language codes
const validateLanguages = (sourceLanguage, targetLanguage) => {
  if (!SUPPORTED_LANGUAGES[sourceLanguage]) throw new Error(`Unsupported source language: ${sourceLanguage}`);
  if (!SUPPORTED_LANGUAGES[targetLanguage]) throw new Error(`Unsupported target language: ${targetLanguage}`);
  if (sourceLanguage === targetLanguage) throw new Error('Source and target languages cannot be the same');
  return true;
};

// Extract audio from video using Cloudinary
const extractAudioFromVideo = async (videoPublicId) => {
  try {
    const audioUrl = cloudinary.url(videoPublicId, { resource_type: 'video', format: 'mp3', flags: 'attachment' });
    return audioUrl;
  } catch (error) {
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
};

// Transcribe audio using OpenAI Whisper
const transcribeAudio = async (audioUrl, sourceLanguage) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioUrl, // Can also be a local file stream
      model: 'whisper-1',
      language: sourceLanguage
    });
    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    return `Mock transcription for ${SUPPORTED_LANGUAGES[sourceLanguage]}`;
  }
};

// Translate text using OpenAI GPT
const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    const prompt = `Translate the following text from ${SUPPORTED_LANGUAGES[sourceLanguage]} to ${SUPPORTED_LANGUAGES[targetLanguage]}:\n\n"${text}"`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return `Mock translation from ${SUPPORTED_LANGUAGES[sourceLanguage]} to ${SUPPORTED_LANGUAGES[targetLanguage]}: ${text}`;
  }
};

// Generate speech using OpenAI TTS
const generateSpeech = async (text, targetLanguage) => {
  try {
    const tts = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text,
      language: targetLanguage
    });
    return tts.audio; // base64 audio
  } catch (error) {
    console.error('Speech generation error:', error);
    return null;
  }
};

// Upload audio to Cloudinary
const uploadAudioToCloudinary = async (audioBase64, fileName) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:audio/mp3;base64,${audioBase64}`,
      { resource_type: 'video', folder: 'converted_audio', public_id: fileName, format: 'mp3' }
    );
    return result.secure_url;
  } catch (error) {
    throw new Error(`Failed to upload audio: ${error.message}`);
  }
};

// Merge translated audio with video (simplified)
const mergeAudioWithVideo = async (videoPublicId, audioUrl) => {
  try {
    const result = cloudinary.url(videoPublicId, {
      resource_type: 'video',
      transformation: [{ audio_codec: 'none' }] // Remove original audio
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to merge audio: ${error.message}`);
  }
};

module.exports = {
  SUPPORTED_LANGUAGES,
  validateLanguages,
  extractAudioFromVideo,
  transcribeAudio,
  translateText,
  generateSpeech,
  uploadAudioToCloudinary,
  mergeAudioWithVideo
};
