const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');

const Conversion = require('../models/conversion.model');
const { uploadCaptionedVideo } = require('./cloudinary.service');
const { runJsonScript } = require('./pythonRunner.service');
const { CONVERSION_STATUS } = require('../constants');

const execAsync = promisify(exec);

const AI_ENGINE_DIR = process.env.AI_ENGINE_DIR || path.resolve(__dirname, '..', '..', 'ai-engine');
const FALLBACK_PYTHON_DIR = path.join(__dirname, '..', 'python');
const PYTHON_SCRIPTS_DIR = fs.existsSync(AI_ENGINE_DIR) ? AI_ENGINE_DIR : FALLBACK_PYTHON_DIR;

const conversionStatus = new Map();

const getStatusFromMemory = (conversionId) => conversionStatus.get(conversionId);

const setStatusInMemory = (conversionId, status) =>
  conversionStatus.set(conversionId, status);

const updateConversionStatus = async (conversionId, updates) => {
  try {
    await Conversion.findOneAndUpdate({ conversionId }, updates);

    const currentStatus = conversionStatus.get(conversionId);
    if (currentStatus) {
      conversionStatus.set(conversionId, {
        ...currentStatus,
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`Status update for ${conversionId}:`, updates.currentStep);
  } catch (error) {
    console.error('Error updating conversion status:', error);
  }
};

const downloadVideo = async (videoUrl, outputPath) => {
  console.log(`Downloading video: ${videoUrl}`);
  await execAsync(`curl -L "${videoUrl}" -o "${outputPath}"`);
  console.log(`Video downloaded to: ${outputPath}`);
  return outputPath;
};

const extractAudio = async (videoPath, audioPath) => {
  console.log(`Extracting audio from: ${videoPath}`);

  await runJsonScript([
    path.join(PYTHON_SCRIPTS_DIR, 'extract_audio.py'),
    videoPath,
    audioPath
  ]);

  if (!fs.existsSync(audioPath)) {
    throw new Error('Audio file not created');
  }

  console.log(`Audio extracted to: ${audioPath}`);
  return audioPath;
};

const transcribeAudio = async (audioPath) => {
  console.log(`Transcribing audio: ${audioPath}`);

  const result = await runJsonScript([
    path.join(PYTHON_SCRIPTS_DIR, 'audio_to_text.py'),
    audioPath
  ]);

  console.log(`Transcription complete. Language: ${result.language}`);
  return result;
};

const translateText = async (text, sourceLang, targetLang) => {
  console.log(`Translating from ${sourceLang} to ${targetLang}`);

  const tempDir = path.join(os.tmpdir(), 'videolangconver');
  fs.mkdirSync(tempDir, { recursive: true });
  const textFile = path.join(tempDir, `temp_${Date.now()}.txt`);
  fs.writeFileSync(textFile, text, 'utf-8');

  try {
    const result = await runJsonScript([
      path.join(PYTHON_SCRIPTS_DIR, 'translate_text.py'),
      textFile,
      sourceLang,
      targetLang
    ]);
    console.log('Translation complete');
    return result;
  } finally {
    if (fs.existsSync(textFile)) {
      fs.unlinkSync(textFile);
    }
  }
};

const addCaptionsToVideo = async (
  videoPath,
  transcription,
  translation,
  targetLang,
  outputPath
) => {
  console.log('Adding captions to video');

  const tempDir = path.dirname(videoPath);
  const dataFile = path.join(tempDir, 'caption_data.json');

  const captionData = {
    original_text: transcription.text,
    translated_text: translation.translated_text || translation.translatedText,
    chunks: transcription.chunks || [],
    timestamps: transcription.timestamps || [],
    language: translation.target_language || targetLang || 'en',
    video_path: videoPath,
    output_path: outputPath
  };

  fs.writeFileSync(dataFile, JSON.stringify(captionData, null, 2));

  try {
    await runJsonScript([
      path.join(PYTHON_SCRIPTS_DIR, 'add_captions.py'),
      dataFile
    ]);

    if (!fs.existsSync(outputPath)) {
      throw new Error('Captioned video not created');
    }

    console.log(`Captions added to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to add captions: ${error.message}`);
  }
};

const textToSpeech = async (text, targetLang, outputPath) => {
  console.log(`Generating audio for ${targetLang}`);

  const tempDir = path.join(os.tmpdir(), 'videolangconver');
  fs.mkdirSync(tempDir, { recursive: true });
  const textFile = path.join(tempDir, `temp_audio_${Date.now()}.txt`);
  fs.writeFileSync(textFile, text, 'utf-8');

  try {
    await runJsonScript([
      path.join(PYTHON_SCRIPTS_DIR, 'text_to_speech.py'),
      textFile,
      targetLang,
      outputPath
    ]);

    if (!fs.existsSync(outputPath)) {
      throw new Error('Audio file not created');
    }

    console.log(`Audio generated to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate audio: ${error.message}`);
  } finally {
    if (fs.existsSync(textFile)) {
      fs.unlinkSync(textFile);
    }
  }
};

const mergeAudioVideo = async (videoPath, audioPath, outputPath) => {
  console.log('Merging audio and video');

  await runJsonScript([
    path.join(PYTHON_SCRIPTS_DIR, 'merge_audio_video.py'),
    videoPath,
    audioPath,
    outputPath
  ]);

  if (!fs.existsSync(outputPath)) {
    throw new Error('Merged video not created');
  }

  console.log(`Merged video created at: ${outputPath}`);
  return outputPath;
};

const cleanupTempFiles = async (filePaths, tempDir) => {
  try {
    console.log(`Cleaning up temp files in: ${tempDir}`);

    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const jsonFiles = fs
      .readdirSync(tempDir)
      .filter((file) => file.endsWith('.json'));
    for (const file of jsonFiles) {
      fs.unlinkSync(path.join(tempDir, file));
    }

    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        fs.rmdirSync(tempDir);
      }
    }

    console.log('Cleanup completed');
  } catch (error) {
    console.warn('Cleanup warning:', error.message);
  }
};

const startConversionProcess = async (
  conversionId,
  video,
  targetLanguage,
  enableLipsync,
  userId
) => {
  console.log(
    `Starting conversion process for ID: ${conversionId}, User: ${userId}`
  );

  let tempDir;

  try {
    const videoUrl = video.videoUrl;
    const videoTitle = video.title;

    tempDir = path.join(__dirname, '..', '..', 'temp', conversionId);
    fs.mkdirSync(tempDir, { recursive: true });

    await updateConversionStatus(conversionId, {
      progress: 10,
      currentStep: 'Downloading video from Cloudinary...'
    });

    const videoPath = path.join(tempDir, 'original_video.mp4');
    await downloadVideo(videoUrl, videoPath);

    await updateConversionStatus(conversionId, {
      progress: 20,
      currentStep: 'Extracting audio from video...'
    });

    const audioPath = path.join(tempDir, 'extracted_audio.mp3');
    await extractAudio(videoPath, audioPath);

    await updateConversionStatus(conversionId, {
      progress: 30,
      currentStep: 'Transcribing audio to text...'
    });

    const transcriptionResult = await transcribeAudio(audioPath);

    const sourceLanguage = transcriptionResult.language;
    await updateConversionStatus(conversionId, {
      progress: 40,
      currentStep: `Detected language: ${sourceLanguage}. Translating to ${targetLanguage}...`,
      sourceLanguage
    });

    const translationResult = await translateText(
      transcriptionResult.text,
      sourceLanguage,
      targetLanguage
    );

    await updateConversionStatus(conversionId, {
      progress: 50,
      currentStep: 'Adding captions to video...'
    });

    const captionedVideoPath = path.join(tempDir, 'captioned_video.mp4');
    await addCaptionsToVideo(
      videoPath,
      transcriptionResult,
      translationResult,
      targetLanguage,
      captionedVideoPath
    );

    await updateConversionStatus(conversionId, {
      progress: 60,
      currentStep: 'Generating translated audio...'
    });

    const generatedAudioPath = path.join(tempDir, 'translated_audio.mp3');
    await textToSpeech(
      translationResult.translated_text || translationResult.translatedText,
      targetLanguage,
      generatedAudioPath
    );

    await updateConversionStatus(conversionId, {
      progress: 70,
      currentStep: 'Merging new audio with video...'
    });

    const finalVideoPath = path.join(tempDir, 'final_video.mp4');
    await mergeAudioVideo(captionedVideoPath, generatedAudioPath, finalVideoPath);

    await updateConversionStatus(conversionId, {
      progress: 80,
      currentStep: 'Uploading final video to Cloudinary...'
    });

    const cloudinaryResult = await uploadCaptionedVideo(
      finalVideoPath,
      `${videoTitle}_${targetLanguage}`,
      conversionId,
      userId
    );

    await Conversion.findOneAndUpdate(
      { conversionId },
      {
        progress: 100,
        status: CONVERSION_STATUS.COMPLETED,
        currentStep: 'Conversion completed successfully!',
        cloudinaryUrl: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        transcription: transcriptionResult.text,
        translation:
          translationResult.translated_text || translationResult.translatedText,
        duration: cloudinaryResult.duration || video.duration,
        fileSize: cloudinaryResult.size || cloudinaryResult.bytes,
        completedAt: new Date()
      }
    );

    conversionStatus.set(conversionId, {
      ...conversionStatus.get(conversionId),
      progress: 100,
      status: CONVERSION_STATUS.COMPLETED,
      currentStep: 'Conversion completed successfully!',
      cloudinaryUrl: cloudinaryResult.url,
      sourceLanguage
    });

    console.log(`Conversion ${conversionId} completed successfully`);

    setTimeout(() => {
      cleanupTempFiles(
        [
          videoPath,
          audioPath,
          captionedVideoPath,
          generatedAudioPath,
          finalVideoPath
        ],
        tempDir
      );
    }, 300000);
  } catch (error) {
    console.error(`Conversion ${conversionId} failed:`, error);

    await Conversion.findOneAndUpdate(
      { conversionId },
      {
        status: CONVERSION_STATUS.FAILED,
        error: error.message,
        currentStep: `Error: ${error.message}`,
        failedAt: new Date()
      }
    );

    conversionStatus.set(conversionId, {
      ...conversionStatus.get(conversionId),
      status: CONVERSION_STATUS.FAILED,
      error: error.message,
      currentStep: `Error: ${error.message}`
    });
  }
};

module.exports = {
  startConversionProcess,
  getStatusFromMemory,
  setStatusInMemory,
  updateConversionStatus,
  conversionStatus
};
