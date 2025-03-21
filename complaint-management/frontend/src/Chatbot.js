import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello, I am Ms. CoRe, Welcome to CoRe MS, The Complaints and Requests Management System of Faculty of Engineering, University of Ruhuna' 
    },
    { 
      sender: 'bot', 
      text: userType === 'admin' ? 
        'How can I assist you today? Would you like to view past complaints?' : 
        'How can I assist you today? Would you like to add a new complaint or view past ones?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('initial');
  const [complaintData, setComplaintData] = useState({ title: '', description: '' });
  const [searchResults, setSearchResults] = useState([]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleUserInput = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage) return;
    addMessage('user', userMessage);
    setInput('');

    try {
      // Send user message to the NLP endpoint
      const res = await fetch('http://localhost:5001/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage })
      });
      const nlpResult = await res.json();
      console.log('NLP result:', nlpResult);

      // Determine action based on the detected intent
      if (nlpResult.intent === 'complaint.add') {
        if (userType === 'user') {
          addMessage('bot', 'What is the complaint title?');
          setStep('getTitle');
        } else {
          addMessage('bot', 'As an admin, you can only view complaints. Please type "view".');
        }
      } else if (nlpResult.intent === 'complaint.view') {
        addMessage('bot', 'Please provide the complaint ID or describe the issue.');
        setStep('getComplaintIdOrQuery');
      } else if (nlpResult.intent === 'general.cancel') {
        addMessage('bot', 'Operation cancelled.');
        setStep('initial');
      } else {
        // Fallback to manual input processing if NLP result is inconclusive
        processUserInputFallback(userMessage);
      }
    } catch (err) {
      console.error(err);
      addMessage('bot', 'Error processing your message with NLP.');
      processUserInputFallback(userMessage);
    }
  };

  // Fallback processing if NLP does not determine an intent
  const processUserInputFallback = async (userMessage) => {
    if (step === 'initial') {
      if (userType === 'user') {
        if (/add/i.test(userMessage)) {
          addMessage('bot', 'What is the complaint title?');
          setStep('getTitle');
        } else if (/view/i.test(userMessage)) {
          addMessage('bot', 'Please provide the complaint ID or describe the issue.');
          setStep('getComplaintIdOrQuery');
        } else {
          addMessage('bot', 'Please type "add" for new complaint or "view" for past complaints.');
        }
      } else {
        if (/view/i.test(userMessage)) {
          addMessage('bot', 'Please provide the complaint ID or describe the issue.');
          setStep('getComplaintIdOrQuery');
        } else {
          addMessage('bot', 'As an admin, you can only view complaints. Please type "view" to continue.');
        }
      }
    } else if (step === 'getTitle') {
      setComplaintData(prev => ({ ...prev, title: userMessage }));
      addMessage('bot', 'What is the complaint description?');
      setStep('getDescription');
    } else if (step === 'getDescription') {
      setComplaintData(prev => ({ ...prev, description: userMessage }));
      addMessage('bot', 'Do you want to save this complaint? (yes/no)');
      setStep('confirmSave');
    } else if (step === 'confirmSave') {
      if (/yes/i.test(userMessage)) {
        try {
          const userId = localStorage.getItem('user_id');
          if (!userId) {
            addMessage('bot', 'You must be logged in to submit a complaint.');
            setStep('initial');
            return;
          }
          const res = await fetch('http://localhost:5001/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              title: complaintData.title,
              description: complaintData.description
            })
          });
          const data = await res.json();
          if (res.ok) {
            addMessage('bot', `Complaint saved successfully with ID ${data.complaint_id}.`);
          } else {
            addMessage('bot', 'There was an error saving your complaint.');
          }
        } catch (err) {
          console.error(err);
          addMessage('bot', 'Error connecting to the server.');
        }
      } else {
        addMessage('bot', 'Complaint not saved. You can restart the process if you wish.');
      }
      setStep('initial');
    } else if (step === 'getComplaintIdOrQuery') {
      if (/^\d+$/.test(userMessage)) {
        fetchComplaintById(userMessage);
      } else {
        fetchComplaintByQuery(userMessage);
      }
    } else if (step === 'selectComplaintFromResults') {
      handleComplaintSelection(userMessage);
    }
  };

  const fetchComplaintById = async (complaintId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/complaints/${complaintId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || `Complaint not found (Status: ${res.status})`);
      }

      addMessage('bot', `Found complaint: "${data.title}".`);
      addMessage('bot', `Details: ${data.description}`);
      addMessage('bot', `Status: ${data.status}`);
    } catch (err) {
      console.error("Fetch error:", err);
      addMessage('bot', err.message || 'Error fetching complaint details.');
    }
    setStep('initial');
  };

  const fetchComplaintByQuery = async (query) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/complaints/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || `Search failed (Status: ${res.status})`);
      }

      if (data.length === 0) {
        addMessage('bot', `No complaints found for "${query}". Try different keywords.`);
      } else {
        setSearchResults(data);
        addMessage('bot', `Found ${data.length} matching complaints:`);
        data.forEach((complaint, index) => {
          addMessage('bot', `${index + 1}. ${complaint.title} (ID: ${complaint.complaint_id})`);
        });
        addMessage('bot', 'Enter the number to view details or type "cancel"');
        setStep('selectComplaintFromResults');
      }
    } catch (err) {
      console.error("Search error:", err);
      addMessage('bot', err.message || 'Search failed. Please try again.');
      setStep('initial');
    }
  };

  const handleComplaintSelection = (userMessage) => {
    if (/cancel/i.test(userMessage)) {
      addMessage('bot', 'Search cancelled. How can I help?');
      setStep('initial');
      return;
    }

    const selectedNumber = parseInt(userMessage);
    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > searchResults.length) {
      addMessage('bot', 'Invalid selection. Please enter a valid number or "cancel".');
      return;
    }

    const selectedComplaint = searchResults[selectedNumber - 1];
    addMessage('bot', `Selected Complaint (ID: ${selectedComplaint.complaint_id}):`);
    addMessage('bot', `Title: ${selectedComplaint.title}`);
    addMessage('bot', `Description: ${selectedComplaint.description}`);
    addMessage('bot', `Status: ${selectedComplaint.status}`);
    setStep('initial');
  };

  return (
    <div className="chatbot-container">
      <button 
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src="/MSCoRe.png" 
          alt="Ms. CoRe Assistant"
          className="chatbot-icon"
        />
      </button>
      
      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <img 
              src="/MSCoRe.png" 
              alt="Ms. CoRe" 
              className="chatbot-avatar"
            />
            <div className="chatbot-title">
              <h3>Ms. CoRe Assistant</h3>
              <p>CoRe Management System</p>
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender} animate-slide-in`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form 
            onSubmit={handleUserInput} 
            className="chatbot-input-container"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="chatbot-input"
            />
            <button 
              type="submit" 
              className="chatbot-send-button"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
