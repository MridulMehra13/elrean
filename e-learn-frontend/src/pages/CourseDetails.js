import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js';


const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [watched, setWatched] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState('videos'); // Default to videos

  // State for PDF viewer (if text mode is selected)
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null); // URL of the currently viewed PDF


  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
        setEnrolled(res.data.isEnrolled);
        // Ensure userProgress is an array, map its keys if it's a Map
        setWatched(res.data.userProgress ? Object.keys(res.data.userProgress) : []);

        // Set default content type based on availability
        if (res.data.videos && res.data.videos.length > 0) {
          setSelectedContentType('videos');
        } else if (res.data.textResources && res.data.textResources.length > 0) {
          setSelectedContentType('text');
          // If text is default, load the first PDF
          setCurrentPdfUrl(`http://localhost:5000${res.data.textResources[0].url}`);
          setPageNumber(1);
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/course/${id}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolled(true);

      // Fetch the updated course data after enrollment
      const res = await axios.get(`http://localhost:5000/api/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data);
      // If enrolled, re-evaluate default content type
      if (res.data.videos && res.data.videos.length > 0) {
        setSelectedContentType('videos');
      } else if (res.data.textResources && res.data.textResources.length > 0) {
        setSelectedContentType('text');
        setCurrentPdfUrl(`http://localhost:5000${res.data.textResources[0].url}`);
        setPageNumber(1);
      }


    } catch (err) {
      console.error("Enrollment failed", err);
    }
  };

  const handleVideoClick = async (video) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/progress/${id}/video`, {
        videoTitle: video.title,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!watched.includes(video.title)) {
        setWatched((prev) => [...prev, video.title]);
      }
    } catch (err) {
      console.error("Error tracking progress:", err);
    }
  };

  // For PDF viewer
  function onDocumentLoadSuccess({ numPages }) {
      setNumPages(numPages);
      setPageNumber(1); // Always reset to page 1 when a new document loads
  }

  const goToPrevPage = () => setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  const goToNextPage = () => setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));


  if (loading) return <p className="text-white">Loading...</p>;
  if (!course) return <p className="text-white">Course not found</p>;

  const hasVideos = course.videos && course.videos.length > 0;
  const hasTextResources = course.textResources && course.textResources.length > 0;


  const progressPercent = course.videos.length > 0 ?
                            Math.floor((watched.length / course.videos.length) * 100) :
                            0; // Handle division by zero

  return (
    <div className="text-white max-w-5xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
      <p className="mb-2 text-gray-300">{course.description}</p>

      {!enrolled ? (
        <button
          onClick={handleEnroll}
          className="bg-blue-600 px-4 py-2 rounded text-white mb-4"
        >
          Enroll Now
        </button>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-green-400">✅ You are enrolled</p>
            <div className="w-full bg-gray-700 h-2 rounded mt-2">
              <div
                className="h-2 rounded bg-green-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{progressPercent}% completed</p>
          </div>

          <div className="mb-4 flex gap-2">
            {hasVideos && (
                <button
                    onClick={() => {
                        setSelectedContentType('videos');
                        setCurrentPdfUrl(null); // Clear PDF when switching to video
                    }}
                    className={`px-4 py-2 rounded ${selectedContentType === 'videos' ? 'bg-indigo-600' : 'bg-gray-700'} text-white`}
                >
                    Video Content
                </button>
            )}
            {hasTextResources && (
                <button
                    onClick={() => {
                        setSelectedContentType('text');
                        // Set the first text resource as current PDF if not already set
                        if (!currentPdfUrl && course.textResources && course.textResources.length > 0) {
                            setCurrentPdfUrl(`http://localhost:5000${course.textResources[0].url}`);
                            setPageNumber(1);
                        }
                    }}
                    className={`px-4 py-2 rounded ${selectedContentType === 'text' ? 'bg-green-600' : 'bg-gray-700'} text-white`}
                >
                    Text Content
                </button>
            )}
          </div>

          <div>
            {selectedContentType === 'videos' && hasVideos && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Course Videos</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.videos.map((video, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded shadow">
                      <img
                        src={
                          video.thumbnail ||
                          (video.source === "youtube"
                            ? `http://img.youtube.com/vi/${video.url.split("v=")[1]?.split("&")[0]}/hqdefault.jpg`
                            : "/default-thumbnail.jpg")
                        }
                        alt={video.title}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                      <h4 className="text-sm font-medium mb-1 text-white">{video.title}</h4>
                      <a
                        href={video.source === "youtube" ? video.url : `http://localhost:5000${video.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleVideoClick(video)}
                        className="inline-block text-blue-400 hover:underline text-sm"
                      >
                        ▶️ Watch Now
                      </a>
                      {watched.includes(video.title) && (
                        <span className="ml-2 text-green-400 text-xs">✓ Watched</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedContentType === 'text' && hasTextResources && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Text Based Resources</h3>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {course.textResources.map((resource, index) => (
                    <div
                      key={index}
                      className={`bg-gray-800 p-3 rounded shadow cursor-pointer
                        ${currentPdfUrl === `http://localhost:5000${resource.url}` ? 'border-2 border-green-500' : ''}`}
                      onClick={() => {
                          setCurrentPdfUrl(`http://localhost:5000${resource.url}`);
                          setPageNumber(1); // Reset page number when a new PDF is selected
                      }}
                    >
                      <h4 className="text-base font-medium mb-1">{resource.title}</h4>
                      <p className="text-gray-400 text-sm mb-2">{resource.summary}</p>
                      <span className="inline-block text-green-400 text-sm">
                        📄 Click to View
                      </span>
                    </div>
                  ))}
                </div>

                {/* PDF Viewer Area */}
                {currentPdfUrl && (
                    <div className="mt-8 bg-gray-800 p-4 rounded shadow-lg overflow-auto max-h-[80vh]">
                        <h4 className="text-lg font-semibold mb-3">Viewing: {course.textResources.find(res => `http://localhost:5000${res.url}` === currentPdfUrl)?.title}</h4>
                        <Document
                            file={currentPdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(error) => console.error("Error loading PDF document:", error)}
                            className="pdf-document-viewer" // Add a class for potential styling
                            >
                            <Page
                                pageNumber={pageNumber}
                                renderTextLayer={true} // Enable text layer for selection
                                renderAnnotationLayer={true} // Enable annotations like links
                                width={Math.min(window.innerWidth * 0.7, 800)} // Adjust width dynamically
                            />
                        </Document>
                        <div className="flex justify-center items-center gap-4 mt-4">
                            <button
                                onClick={goToPrevPage}
                                disabled={pageNumber <= 1}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <p className="text-lg">Page {pageNumber} of {numPages || '--'}</p>
                            <button
                                onClick={goToNextPage}
                                disabled={pageNumber >= numPages}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                {!currentPdfUrl && hasTextResources && (
                    <p className="text-gray-400 text-center mt-6">
                        Select a text resource above to view its content.
                    </p>
                )}
                {!hasTextResources && (
                  <p className="text-gray-400">No text resources available for this course.</p>
                )}
              </div>
            )}

            {/* Message if no content is available for the selected type */}
            {selectedContentType === 'videos' && !hasVideos && (
                <p className="text-gray-400 text-center mt-6">
                    No videos available for this course. Please select "Text Content" if available.
                </p>
            )}
            {selectedContentType === 'text' && !hasTextResources && (
                <p className="text-gray-400 text-center mt-6">
                    No text resources available for this course. Please select "Video Content" if available.
                </p>
            )}
            {/* No content at all */}
            {!hasVideos && !hasTextResources && (
                <p className="text-gray-400 text-center mt-6">No content available for this course.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetails;