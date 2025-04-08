import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import ReactMarkdown from "react-markdown";
import { Pencil, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import AlertPopup from "../AlertPopup/AlertPopup";
import "./MDNotes.css";

const MDNotes = () => {
  const { topic_id } = useParams();
  const { user } = useAuth();
  const username = user.username;
  const containerRef = useRef(null);

  const [notes, setNotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [copiedCode, setCopiedCode] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    fetch("https://surya23.pythonanywhere.com/questions/topic/questions-notes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, topic_id }),
    })
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error(err));
  }, [username, topic_id]);

  const triggerAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
  };

  const handleEditClick = () => {
    setEditing(true);
    setEditContent(notes[currentIndex].content);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditContent("");
  };

  const handleSave = () => {
    fetch("https://surya23.pythonanywhere.com/questions/markdown-note/upsert/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        question_id: notes[currentIndex].id,
        content: editContent,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        const updated = [...notes];
        updated[currentIndex].content = editContent;
        setNotes(updated);
        setEditing(false);
      })
      .catch((err) => console.error(err));
  };

  const handlePrev = () => {
    if (editing) handleCancel();
    if (currentIndex === 0) {
      triggerAlert("You're at the first question.", "warning");
      return;
    }
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (editing) handleCancel();
    if (currentIndex === notes.length - 1) {
      triggerAlert("You're at the last question.", "warning");
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTouchStart = (e) => {
    // Only start tracking if we're not interacting with a specific element
    if (
      e.target.tagName === "PRE" ||
      e.target.tagName === "CODE" ||
      e.target.tagName === "A"
    ) {
      return;
    }
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;

    // Prevent scrolling when we're trying to swipe
    e.preventDefault();
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Minimum swipe distance
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Copy code to clipboard
  const copyToClipboard = (code, codeId) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  if (notes.length === 0) {
    return (
      <>
        <Header titleText="Notes" />
        <div className="mdnotes-container">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  const currentNote = notes[currentIndex];

  return (
    <>
      <Header titleText="Notes" />

      {alert.show && (
        <AlertPopup
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      <div
        className="mdnotes-container"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mdnotes-header">
          <h2 className="mdnotes-question-title">Q. {currentNote.question}</h2>
          <button className="mdnotes-edit-button" onClick={handleEditClick}>
            <Pencil size={18} strokeWidth={2.5} className="mdnotes-edit-icon" />
          </button>
        </div>

        <div className="mdnotes-content">
          {editing ? (
            <>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mdnotes-edit-textarea"
              />
              <div className="mdnotes-action-btns">
                <button onClick={handleSave} className="mdnotes-save-btn">
                  Save
                </button>
                <button onClick={handleCancel} className="mdnotes-cancel-btn">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div
              className="mdnotes-markdown-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="mdnotes-heading mdnotes-h1" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="mdnotes-heading mdnotes-h2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="mdnotes-heading mdnotes-h3" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mdnotes-paragraph" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="mdnotes-list mdnotes-ul" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="mdnotes-list mdnotes-ol" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mdnotes-list-item" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="mdnotes-blockquote" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="mdnotes-link" {...props} />
                  ),
                  img: ({ node, ...props }) => (
                    <img className="mdnotes-image" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="mdnotes-table-container">
                      <table className="mdnotes-table" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="mdnotes-thead" {...props} />
                  ),
                  tbody: ({ node, ...props }) => (
                    <tbody className="mdnotes-tbody" {...props} />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr className="mdnotes-tr" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="mdnotes-th" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="mdnotes-td" {...props} />
                  ),
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    const codeId = `code-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`;

                    return !inline && match ? (
                      <div className="mdnotes-code-block">
                        <div className="mdnotes-code-header">
                          <span className="mdnotes-code-language">
                            {match[1]}
                          </span>
                          <button
                            className="mdnotes-copy-button"
                            onClick={() => copyToClipboard(codeString, codeId)}
                          >
                            {copiedCode === codeId ? (
                              <Check
                                size={14}
                                strokeWidth={2.5}
                                className="mdnotes-check-icon"
                              />
                            ) : (
                              <Copy
                                size={14}
                                strokeWidth={2.5}
                                className="mdnotes-copy-icon"
                              />
                            )}
                            {copiedCode === codeId ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="mdnotes-code-content">
                          <SyntaxHighlighter
                            style={nightOwl}
                            language={match[1]}
                            PreTag="div"
                            className="mdnotes-syntax-highlighter"
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ) : (
                      <code
                        className={`mdnotes-inline-code ${className || ""}`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {currentNote.content || "No notes available."}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="mdnotes-action-btns mdnotes-last-ab">
          <button onClick={handlePrev} className="mdnotes-cancel-btn">
            Previous
          </button>
          <button onClick={handleNext} className="mdnotes-save-btn">
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default MDNotes;
