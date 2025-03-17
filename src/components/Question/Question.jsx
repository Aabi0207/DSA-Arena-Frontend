// src/components/Question/Question.jsx
import React, { useState } from "react";
import "./Question.css";
import { NotebookPen, Bookmark } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Question = ({ question, onStatusChange }) => {
  const [isSolved, setIsSolved] = useState(question.is_solved);
  const [isSaved, setIsSaved] = useState(question.is_saved);
  const { user } = useAuth();

  const updateStatus = async (questionId, actionType) => {
    try {
      const response = await fetch(`https://surya23.pythonanywhere.com/questions/update-status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          question_id: questionId,
          action: actionType,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to update status");
      return data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const handleCheckboxToggle = async () => {
    const action = isSolved ? "unsolve" : "solve";
    const newSolved = !isSolved;
    try {
      await updateStatus(question.id, action);
      setIsSolved(newSolved);
      onStatusChange?.({ questionId: question.id, isSolved: newSolved, isSaved, difficulty: question.difficulty });
    } catch {
      alert("Failed to update solved status.");
    }
  };

  const handleBookmarkToggle = async () => {
    const action = isSaved ? "unsave" : "save";
    const newSaved = !isSaved;
    try {
      await updateStatus(question.id, action);
      setIsSaved(newSaved);
      onStatusChange?.({ questionId: question.id, isSolved, isSaved: newSaved, difficulty: question.difficulty });
    } catch {
      alert("Failed to update saved status.");
    }
  };

  const getTextColorClass = () => (isSaved ? "question-text saved" : isSolved ? "question-text solved" : "question-text");
  const getIconColorClass = () => (isSaved ? "icon saved" : isSolved ? "icon solved" : "icon");
  const getContainerBorderClass = () => (isSaved ? "question-container saved-border" : isSolved ? "question-container solved-border" : "question-container");

  return (
    <div className={getContainerBorderClass()}>
      <div className="checkbox leftmost">
        <input
          type="checkbox"
          className="custom-checkbox"
          checked={isSolved}
          onChange={handleCheckboxToggle}
          style={{ accentColor: isSolved ? "#00ffff" : undefined }}
        />
      </div>

      <div className="q-name">
        <a
          href={question.link}
          target="_blank"
          rel="noopener noreferrer"
          className={getTextColorClass()}
        >
          {question.question}
        </a>
      </div>

      <div className="checkbox">
        {question.solution ? (
          <a
            href={question.solution}
            target="_blank"
            rel="noopener noreferrer"
            className={getIconColorClass()}
          >
            <NotebookPen size={28} />
          </a>
        ) : (
          <span className={getTextColorClass()}>-</span>
        )}
      </div>

      <div className="checkbox">
        <a href={question.link} target="_blank" rel="noopener noreferrer" className="platform-icon">
          <img src={`/platforms/${question.platform}.png`} alt={question.platform} />
        </a>
      </div>

      <div className="checkbox">
        <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
          {question.difficulty}
        </span>
      </div>

      <div className="checkbox rightmost">
        <button className="bookmark-btn" onClick={handleBookmarkToggle}>
          <Bookmark
            size={28}
            className={`bookmark-icon ${isSaved ? "active" : isSolved ? "solved" : ""}`}
          />
        </button>
      </div>
    </div>
  );
};

export default Question;
