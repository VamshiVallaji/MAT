// This is a placeholder for the Feedback Page.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = sessionStorage.getItem('userEmail'); // Get user email from session storage
    if (!userEmail) {
      alert('User not logged in. Please log in again.');
      navigate('/login'); // Assuming you have navigate imported and available
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/users/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, feedback }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setFeedback(''); // Clear the form
      } else {
        alert(`Failed to submit feedback: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('An error occurred while submitting feedback.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center" style={{ color: '#003366' }}>Provide Feedback</h2>
      <div className="card mx-auto mt-4" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          {submitted ? (
            <div className="alert alert-success" role="alert">
              Thank you for your feedback!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="feedbackText" className="form-label">Your Feedback</label>
                <textarea
                  className="form-control"
                  id="feedbackText"
                  rows="5"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Submit Feedback</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
