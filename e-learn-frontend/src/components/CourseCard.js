import { motion } from "framer-motion";

const CourseCard = ({ course, progress = 0, isEnrolled = false, onEnroll }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-indigo-600 dark:border-indigo-400"
    >
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{course.title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        By {course.teacher?.name || "Unknown"}
      </p>

      {isEnrolled ? (
        <>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            Progress: {progress}%
          </p>
        </>
      ) : (
        <button
          onClick={() => onEnroll(course._id)}
          className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Enroll
        </button>
      )}
    </motion.div>
  );
};

export default CourseCard;
