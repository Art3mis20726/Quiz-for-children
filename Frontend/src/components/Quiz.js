import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Questions from "./Questions";
import { FaHome } from "react-icons/fa"; // Import Font Awesome home icon

export default function Quiz() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPercentage, setLoadingPercentage] = useState(0); // Loading percentage state
  const [displayedQuestionIds, setDisplayedQuestionIds] = useState([]); // Track displayed question IDs
  const [maxReached, setMaxReached] = useState(false); // Track if max questions reached
  const maxQuestions = 10; // Maximum number of questions to display

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setLoadingPercentage(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setLoadingPercentage((prev) => (prev < 90 ? prev + 10 : prev));
      }, 100);

      const response = await axios.post(
        `https://quiz-for-children-1.onrender.com/api/v1/question/getQuestion/${id}`,
        { displayedQuestionIds, maxQuestions } // Pass displayed question IDs and max number
      );

      const questionData = response.data.data?.questionWithoutCorrect;

      if (questionData) {
        setQuestions((prevQuestions) => [
          ...prevQuestions,
          questionData,
        ]);
        setDisplayedQuestionIds((prevIds) => [
          ...prevIds,
          questionData._id,
        ]);
      } else {
        console.log("No more unique questions available or max limit reached.");
        setMaxReached(true); // Set maxReached to true if no more questions are available
      }

      clearInterval(interval);
      setLoadingPercentage(100);
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const handleNext = async () => {
    if (currentQuestionIndex === questions.length - 1) {
      if (questions.length >= maxQuestions) {
        setMaxReached(true); // Set maxReached to true if the limit is reached
        return;
      }
      await fetchQuestion(); // Fetch more questions
      setCurrentQuestionIndex(questions.length); // Move to the new question
      return;
    }

    // Increment the current question index if not at the last question
    setCurrentQuestionIndex((prevIndex) => Math.min(prevIndex + 1, questions.length - 1));
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0)); // Ensure index doesn't go below zero
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Link
        to="/"
        className="absolute top-4 left-4 text-blue-900 hover:text-black transition shadow-md bg-zinc-200 rounded-lg py-2 px-2"
      >
        <FaHome size={40} />
      </Link>

      {loading ? (
        <div className="flex flex-col items-center">
          <div className="w-64 bg-gray-200 h-4 rounded-full overflow-hidden mb-4">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${loadingPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-xl font-semibold">
            Loading... {loadingPercentage}%
          </p>
        </div>
      ) : maxReached ? (
        <p className="text-gray-500 text-4xl bg-white py-2 px-2 font-bold">
          Maximum number of questions attended.
        </p>
      ) : currentQuestion ? (
        <>
          <Questions question={currentQuestion} />
          <div className="flex mt-4 space-x-4 ">
            <button
              className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                currentQuestionIndex === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-200 text-white hover:bg-blue-300"
              }`}
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              Prev
            </button>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-lg transition-all duration-200 hover:bg-blue-600"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-4xl bg-white py-2 px-2 font-bold">No questions available.</p>
      )}
    </div>
  );
}
