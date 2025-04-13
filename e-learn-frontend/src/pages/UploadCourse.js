import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const UploadCourse = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoType, setVideoType] = useState("youtube");
  const [youtubeLinks, setYoutubeLinks] = useState([""]);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...youtubeLinks];
    updatedLinks[index] = value;
    setYoutubeLinks(updatedLinks);
  };

  const handleAddLink = () => {
    setYoutubeLinks([...youtubeLinks, ""]);
  };

  const handleFileChange = (e) => {
    setUploadedVideos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let videoData = [];

      if (videoType === "youtube") {
        videoData = youtubeLinks.filter(link => link.trim() !== "");
      } else if (videoType === "upload") {
        const uploads = await Promise.all(
          uploadedVideos.map(async (file) => {
            const formData = new FormData();
            formData.append("video", file);

            const { data } = await axios.post("/api/playlist/upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            });

            return {
              fileId: data.fileId,
              title: file.name,
            };
          })
        );

        videoData = uploads;
      }

      const coursePayload = {
        title,
        description,
        videoType,
        videoData,
      };

      await axios.post("/api/courses", coursePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Course uploaded successfully!");
      setTitle("");
      setDescription("");
      setYoutubeLinks([""]);
      setUploadedVideos([]);
    } catch (error) {
      console.error("Course upload failed", error);
      alert("Course upload failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Upload New Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Video Type</label>
          <select
            className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
          >
            <option value="youtube">YouTube Links</option>
            <option value="upload">Upload Videos</option>
          </select>
        </div>

        {videoType === "youtube" && (
          <div className="mb-4">
            {youtubeLinks.map((link, index) => (
              <input
                key={index}
                type="text"
                placeholder={`YouTube Link #${index + 1}`}
                className="w-full px-4 py-2 mb-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
              />
            ))}
            <button
              type="button"
              onClick={handleAddLink}
              className="text-sm text-blue-500 dark:text-blue-300"
            >
              + Add Another Link
            </button>
          </div>
        )}

        {videoType === "upload" && (
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="video/*"
              className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
              onChange={handleFileChange}
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Upload Course
        </button>
      </form>
    </div>
  );
};

export default UploadCourse;
