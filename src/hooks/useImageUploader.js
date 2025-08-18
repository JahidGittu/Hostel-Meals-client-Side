import axios from "axios";
import { useState } from "react";

const useImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (imageFile) => {
    setUploading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);

      // console.log(res.data)

      const data = res.data;

      if (!data.success) throw new Error(data.error?.message || 'Upload failed');

      return data.data.display_url;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
};

export default useImageUploader;
