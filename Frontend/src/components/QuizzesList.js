import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import EditQuizModal from "./EditQuizModal";
import { FaHome} from "react-icons/fa";

const QuizzesList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [quizToEdit, setQuizToEdit] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/question/QuizTypes",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Error fetching quizzes.");
        }

        const data = await response.json();
        setQuizzes(data.data || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setError("Error fetching quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizClick = (quizId) => {
    navigate(`/quiz-dashboard/${quizId}`);
  };

  const handleAddQuizClick = () => {
    navigate("/add-quiz");
  };

  const handleLogout = () => {
    fetch("http://localhost:8000/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        navigate("/login");
      })
      .catch((error) => console.error("Logout failed:", error));
  };

  const openDeleteModal = (quiz) => {
    setQuizToDelete(quiz);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setQuizToDelete(null);
  };

  const openEditModal = (quiz) => {
    setQuizToEdit(quiz);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setQuizToEdit(null);
  };

  const handleDeleteQuiz = async () => {
    if (quizToDelete) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/question/deleteQuiz/${quizToDelete.id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Error deleting quiz.");
        }

        setQuizzes((prevQuizzes) =>
          prevQuizzes.filter((item) => item.id !== quizToDelete.id)
        );
      } catch (error) {
        console.error("Error deleting quiz:", error);
        setError("Error deleting quiz.");
      } finally {
        closeDeleteModal();
      }
    }
  };

  const handleEditQuizName = async (quiz, newQuizName, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("name", newQuizName);

      if (imageFile) {
        formData.append("quizTypeImage", imageFile);
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/question/editQuizType/${quiz.id}`,
        {
          method: "PATCH",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error editing quiz name.");
      }

      const updatedQuiz = await response.json();
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((item) =>
          item.id === quiz.id
            ? {
                ...item,
                type: newQuizName,
                url: imageFile ? URL.createObjectURL(imageFile) : item.url,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error editing quiz name:", error);
      setError("Error editing quiz name.");
    } finally {
      closeEditModal();
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div
      className="bg-cover bg-fixed bg-center h-screen overflow-hidden"
      style={{ backgroundImage: "url('path/to/your/background-image.jpg')" }}
    >
      <div className="relative h-full flex flex-col">
        <div className="absolute top-4 left-4 flex items-center space-x-4">
          <Link
            to="/"
            className="text-blue-900 hover:text-black transition-shadow bg-zinc-200 rounded-lg p-2 flex items-center justify-center"
          >
            <FaHome size={30} />
          </Link>
          
        </div>
        <button
          onClick={handleLogout}
          className="absolute top-2 right-2 bg-red-500 w-24 text-white font-bold py-1 px-3 rounded-lg shadow-md hover:bg-red-600 transition"
        >
          Logout
        </button>
        <div className="flex-grow flex flex-col items-center justify-start p-6 overflow-hidden">
          <h2 className="text-4xl font-bold mb-8 mt-12 text-center text-white bg-green-600 py-4 px-6 rounded-lg shadow-lg">
            Select Quiz
          </h2>

          <button
            onClick={handleAddQuizClick}
            className="bg-cyan-600 text-white py-2 px-4 w-96 rounded-lg shadow-2xl hover:bg-cyan-900  transition font-bold text-xl mb-4"
          >
            Add Quiz
          </button>

          <div
            className="w-full overflow-auto pr-4"
            style={{ height: "calc(100vh - 220px)" }}
          >
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-4">
              {quizzes.length ? (
                quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
                  >
                    <div
                      onClick={() => handleQuizClick(quiz.id)}
                      className="cursor-pointer mb-4 text-center"
                    >
                      {quiz.url ? (
                        <img
                          src={quiz.url}
                          alt={quiz.name}
                          className="w-72 h-40 object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-36 bg-gray-300 rounded mb-2 flex items-center justify-center text-gray-600">
                          No Image
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-800">
                        {quiz.type || "Unnamed Quiz"} ({quiz.questionCount}{" "}
                        questions)
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(quiz)}
                        className="bg-yellow-500 font-bold text-white py-1 px-3 rounded-lg shadow-md hover:bg-yellow-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(quiz)}
                        className="bg-red-500 font-bold text-white py-1 px-3 rounded-lg shadow-md hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-600">
                  No quizzes found.
                </p>
              )}
            </div>
          </div>
        </div>
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteQuiz}
        />
        {isEditModalOpen && (
          <EditQuizModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            onConfirm={handleEditQuizName}
            quiz={quizToEdit}
          />
        )}
      </div>
    </div>
  );
};

export default QuizzesList;
