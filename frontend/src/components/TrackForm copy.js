import axios from "axios";
import React, { useState } from "react";

function TrackForm() {
  const [video, setVideo] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);

  const submitVideo = async () => {
    const formData = new FormData();
    formData.append("video", video);
  
    const res = await axios.post(
      "http://localhost:8000/track",
      formData,
      { responseType: "blob" }
    );
  
    const url = URL.createObjectURL(
      new Blob([res.data], { type: "video/mp4" })
    );
  
    setResultUrl(url);
  };
  
  

  return (
    <div>
      <input type="file" onChange={e => setVideo(e.target.files[0])} />
      <button onClick={submitVideo}>Track</button>

      {resultUrl && <video src={resultUrl} controls />}
    </div>
  );
}

export default TrackForm;
