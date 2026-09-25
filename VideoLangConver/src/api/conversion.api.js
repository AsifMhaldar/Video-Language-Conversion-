import client from './client';

export const startConversion = ({ videoId, targetLanguage, enableLipsync = false }) =>
  client.post('/api/conversions/convert', {
    videoId,
    targetLanguage,
    enableLipsync
  });

export const getConversionStatus = (conversionId) =>
  client.get(`/api/conversions/${conversionId}`);
