// Chatbot.js
import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        'Hello, I am Ms. CoRe, Welcome to CoRe MS, the Complaints and Requests Management System of the Faculty of Engineering, University of Ruhuna.',
    },
    {
      sender: 'bot',
      text:
        userType === 'admin'
          ? 'How can I assist you today? Would you like to view past complaints?'
          : 'How can I assist you today? Would you like to add a new complaint or view past ones?',
    },
  ]);

  const [input, setInput] = useState('');
  const [step, setStep] = useState('initial');
  const [complaintData, setComplaintData] = useState({ title: '', description: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [generalChatCount, setGeneralChatCount] = useState(0);

  // Configure your backend URL in .env as REACT_APP_API_BOT_URL (no trailing slash)
  const BOT_URL = process.env.REACT_APP_API_BOT_URL;

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleUserInput = async e => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage) return;
    addMessage('user', userMessage);
    setInput('');

    // NLP call
    let nlpResult;
    try {
      const res = await fetch(`${BOT_URL}/nlp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      nlpResult = await res.json();
    } catch (err) {
      console.error('NLP error:', err);
      addMessage('bot', 'Error processing your message with NLP.');
      return processUserInputFallback(userMessage);
    }

    const intent = nlpResult.intent;
    let count;

    // Route by intent
    switch (intent) {
      case 'complaint.add':
        if (userType === 'user') {
          addMessage('bot', 'What is the complaint title?');
          setStep('getTitle');
        } else {
          addMessage('bot', 'As an admin, you can only view complaints. Please type "view".');
        }
        break;

      case 'complaint.view':
        addMessage('bot', 'Please provide the complaint ID or describe the issue.');
        setStep('getComplaintIdOrQuery');
        break;

      case 'general.cancel':
        addMessage('bot', 'Operation cancelled.');
        setStep('initial');
        break;

      case 'bot.details':
        count = generalChatCount + 1;
        setGeneralChatCount(count);
        addMessage(
          'bot',
          'I’m Ms. CoRe, the AI assistant for CoRe MS, created by Scorpion X to help you manage your complaints and requests within the Faculty of Engineering, University of Ruhuna.'
        );
        if (count >= 5) {
          addMessage('bot', 'Reminder: I’m here to help with CoRe MS tasks, not general chat.');
          setGeneralChatCount(0);
        }
        setStep('initial');
        break;

      case 'efac.info':
        count = generalChatCount + 1;
        setGeneralChatCount(count);
        addMessage(
          'bot',
          'The Faculty of Engineering of University of Ruhuna was established on 1st July 1999 at Hapugala, Galle. First batch of students was admitted on 27th March 2000. Admission to the Faculty of Engineering, University of Ruhuna, is subject to the University Grants Commission policy on university admissions. The present annual intake to the Faculty is 550. The Faculty of Engineering offers full-time courses leading to the Degree of Bachelor of the Science in Engineering (B.Sc.Eng.), which is accredited by the Institution of Engineers, Sri Lanka (IESL).'
        );
        if (count >= 5) {
          addMessage('bot', 'Reminder: I’m here to help with CoRe MS tasks, not general chat.');
          setGeneralChatCount(0);
        }
        setStep('initial');
        break;

      case 'uor.info':
        count = generalChatCount + 1;
        setGeneralChatCount(count);

        // Hard‑coded summary as a workaround
        addMessage(
          'bot',
          `The University of Ruhuna, established by a Special Presidential Decree in 1978 and elevated to a fully-fledged university in 1984, is Sri Lanka's sixth oldest University. It is the only University in the country's southern region, with ten faculties spread across three prominent locations. The central campus, which is located in Wellamadama, houses the faculties of Science, Humanities and Social Sciences, Management and Finance, and Fisheries and Marine Sciences & Technology. Agriculture and Technology faculties are located in Kamburupitiya, while Engineering, Medicine, and Allied Health Science faculties are located in Galle. Over the past 43 years, the University of Ruhuna has witnessed tremendous progress and development in the academic, research, and outreach spheres and significant improvements in intellectual and infrastructure resources, emerging as a leader in higher education in Sri Lanka.`
        );

        if (count >= 5) {
          addMessage('bot', 'Reminder: I’m here to help with CoRe MS tasks, not general chat.');
          setGeneralChatCount(0);
        }
        setStep('initial');
        break;

      case 'scorpionx.about':
        count = generalChatCount + 1;
        setGeneralChatCount(count);

        addMessage(
          'bot',
          `✨ **Who We Are**  
Scorpion X is a dynamic collective of innovators, developers, and problem‑solvers based at the University of Ruhuna’s Faculty of Engineering.

💻 **Our Expertise**  
• Full‑Stack Development: React, Node.js, MySQL  
• AI & Machine Learning: TensorFlow, scikit‑learn  
• Cybersecurity: Ethical hacking, penetration testing  
• Frontend Design: User‑centric interfaces and animations  

🏆 **Our Achievements**  
• BitCode V5.0 — 2nd Runners Up (Inter‑University National Hackathon)  
• VoltCast 1.0 — 2nd Runners Up (Intra‑University Ideathon)  
• Finalists, CodeX by CodeJam (University of Moratuwa)  

👥 **Core Team**  
• Thanujaya Tennekoon — Lead Developer & AI Enthusiast  
• Ramishka Thennakoon — Full‑Stack Developer  
• Pathum Vimukthi — Cybersecurity Enthusiast  
• Dineth Keragala — Frontend Developer  

🔗 Learn more: https://scorpion-xweb.vercel.app/`
        );

        if (count >= 5) {
          addMessage('bot', 'Reminder: I’m here to help with CoRe MS tasks, not general chat.');
          setGeneralChatCount(0);
        }
        setStep('initial');
        break;

      default:
        // Fallback / general chat
        count = generalChatCount + 1;
        setGeneralChatCount(count);
        processUserInputFallback(userMessage);
        if (count >= 5) {
          addMessage('bot', 'Reminder: I’m here to help with CoRe MS tasks, not general chat.');
          setGeneralChatCount(0);
        }
        break;
    }
  };

  const processUserInputFallback = userMessage => {
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
        submitComplaint();
      } else {
        addMessage('bot', 'Complaint not saved. You can restart the process if you wish.');
        setStep('initial');
      }
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

  const submitComplaint = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        addMessage('bot', 'You must be logged in to submit a complaint.');
        setStep('initial');
        return;
      }
      const res = await fetch(`${BOT_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: complaintData.title,
          description: complaintData.description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addMessage('bot', `Complaint saved successfully with ID ${data.complaint_id}.`);
      } else {
        addMessage('bot', 'There was an error saving your complaint.');
      }
    } catch (err) {
      console.error('Submit complaint error:', err);
      addMessage('bot', 'Error connecting to the server.');
    }
    setStep('initial');
  };

  const fetchComplaintById = async id => {
    try {
      const res = await fetch(`${BOT_URL}/complaints/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      addMessage('bot', `Found complaint: "${data.title}".`);
      addMessage('bot', `Details: ${data.description}`);
      addMessage('bot', `Status: ${data.status}`);
    } catch (err) {
      console.error('Fetch by ID error:', err);
      addMessage('bot', err.message || 'Error fetching complaint details.');
    }
    setStep('initial');
  };

  const fetchComplaintByQuery = async q => {
    try {
      const res = await fetch(`${BOT_URL}/complaints/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      if (data.length === 0) {
        addMessage('bot', `No complaints found for "${q}".`);
      } else {
        setSearchResults(data);
        addMessage('bot', `Found ${data.length} matching complaints:`);
        data.forEach((c, i) =>
          addMessage('bot', `${i + 1}. ${c.title} (ID: ${c.complaint_id})`)
        );
        addMessage('bot', 'Enter the number to view details or type "cancel".');
        setStep('selectComplaintFromResults');
      }
    } catch (err) {
      console.error('Search error:', err);
      addMessage('bot', 'Search failed. Please try again.');
      setStep('initial');
    }
  };

  const handleComplaintSelection = msg => {
    if (/cancel/i.test(msg)) {
      addMessage('bot', 'Search cancelled. How can I help?');
      setStep('initial');
      return;
    }
    const idx = parseInt(msg, 10);
    if (isNaN(idx) || idx < 1 || idx > searchResults.length) {
      addMessage('bot', 'Invalid selection. Please enter a valid number or "cancel".');
      return;
    }
    const chosen = searchResults[idx - 1];
    addMessage('bot', `Complaint ${chosen.complaint_id}: ${chosen.title}`);
    addMessage('bot', `Details: ${chosen.description}`);
    addMessage('bot', `Status: ${chosen.status}`);
    setStep('initial');
  };

  return (
    <div className="chatbot-container">
      <button
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="/MSCoRe.png" alt="Ms. CoRe" className="chatbot-icon" />
      </button>

      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <img src="/MSCoRe.png" alt="Ms. CoRe" className="chatbot-avatar" />
            <div className="chatbot-title">
              <h3>Ms. CoRe Assistant</h3>
              <p>CoRe Management System</p>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.sender} animate-slide-in`}>
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleUserInput} className="chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
