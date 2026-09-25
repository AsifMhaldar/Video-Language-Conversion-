import client from './client';

export const fetchVideos = () => client.get('/api/videos');

export const uploadVideo = ({ file, title, description, onProgress }) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);
  formData.append('description', description);

  return client.post('/api/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
  });
};

export const updateVideoById = (id, payload) =>
  client.patch(`/api/videos/${id}`, payload);

export const deleteVideoById = (id) => client.delete(`/api/videos/${id}`);
