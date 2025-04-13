import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mt-16"
      >
        <h1 className="text-5xl font-extrabold leading-tight">
          Welcome to <span className="text-indigo-600 dark:text-indigo-400">E-Learn</span>
        </h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          The ultimate e-learning platform with interactive courses, AI-powered recommendations, and gamified learning.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            to="/courses"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Login
          </Link>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-5xl"
      >
        {[
          { title: "📚 Interactive Courses", desc: "Engaging video lessons, quizzes, and assignments." },
          { title: "🤖 AI-Powered Learning", desc: "Personalized course recommendations with AI." },
          { title: "🏆 Earn XP & Level Up", desc: "Track progress and climb the leaderboard!" },
        ].map((feature, index) => (
          <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="mt-20 text-center max-w-4xl"
      >
        <h2 className="text-3xl font-bold">What Our Students Say</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Hear from learners who transformed their careers with E-Learn.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { quote: "The AI-powered recommendations helped me choose the best courses!", name: "Sarah Williams" },
            { quote: "I love the XP system! Learning has never been this fun and engaging.", name: "Michael Johnson" },
          ].map((testimonial, index) => (
            <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-700 dark:text-gray-300 italic">“{testimonial.quote}”</p>
              <h4 className="mt-2 font-semibold">- {testimonial.name}</h4>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="mt-16 text-center max-w-3xl bg-indigo-600 text-white p-8 rounded-lg shadow-lg"
      >
        <h3 className="text-2xl font-bold">Join 10,000+ Learners Today!</h3>
        <p className="mt-2">Sign up now and start your learning journey with E-Learn.</p>
        <Link
          to="/signup"
          className="inline-block mt-4 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition"
        >
          Sign Up Now
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
