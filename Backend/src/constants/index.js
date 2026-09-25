const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  mr: 'Marathi',
  ta: 'Tamil'
};

const CONVERSION_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const COOKIE_NAME = 'token';
const TOKEN_TTL_SECONDS = 60 * 60;
const COOKIE_MAX_AGE_MS = 60 * 60 * 1000;

const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm'
];

const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

module.exports = {
  SUPPORTED_LANGUAGES,
  CONVERSION_STATUS,
  COOKIE_NAME,
  TOKEN_TTL_SECONDS,
  COOKIE_MAX_AGE_MS,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES
};
