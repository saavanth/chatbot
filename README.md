
# ezScmFullstack-AI-chatbot
# Multi-Provider Streaming AI Chat Application

## Project Description
This project is a full-stack AI chat application that supports multiple AI providers such as OpenAI, Anthropic Claude, and Google Gemini. It allows real-time streaming of AI responses, multi-session management, file attachments, and seamless switching between AI providers and models. Users can interact with AI in a chat interface while maintaining session histories.

Key Features:
- Multi-provider AI support (OpenAI, Claude, Gemini)
- Real-time token-by-token streaming responses
- Persistent session and message storage
- File attachments for messages
- Responsive and interactive chat interface
- Session management with deletion and search

---

## Technology Stack

### Backend
- **FastAPI** – Python web framework for REST and SSE APIs  
- **SQLAlchemy** – ORM for database management  
- **PostgreSQL/SQLite** – Relational database (choose as per `.env`)  
- **sse-starlette** – Server-Sent Events support for streaming AI responses  

### Frontend
- **React.js** – SPA for chat interface  
- **JavaScript (ES6)** – Frontend logic and state management  
- **CSS/Inline Styles** – Styling and responsive layouts  

---

## Installation & Setup

### Backend
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/multi-provider-ai-chat.git
   cd multi-provider-ai-chat/backend
2.Install dependencies:
   
    pip install -r requirements.txt
3.Configure environment variables:
			
            •	Copy .env.example to .env:
			•	Update the variables:
DATABASE_URL=sqlite:///./chat.db  # or PostgreSQL URL
			
   
   			OPENAI_API_KEY=your_openai_key
			CLAUDE_API_KEY=your_claude_key
			GEMINI_API_KEY=your_gemini_key
4.Run the backend server:
		
  			**uvicorn app.main:app --reload**
5.Frontend
	1.Navigate to the frontend folder:
 	2.	Install dependencies:
  				
	  			npm install
3.Start the React development server:
 		
   			npm run dev
   4.	Open your browser at:
		
  			http://localhost:5173
 
<img width="1680" height="1050" alt="Screenshot 2025-09-11 at 00 38 48" src="https://github.com/user-attachments/assets/82b7bb52-35fc-4a69-9938-18842cb832eb" />


<img width="1680" height="1050" alt="Screenshot 2025-09-11 at 00 37 46" src="https://github.com/user-attachments/assets/105622da-7f4e-4901-b8d2-f64934c3860f" />


DATABASE

<img width="1680" height="1050" alt="Screenshot 2025-09-11 at 00 28 39" src="https://github.com/user-attachments/assets/a088c79e-eb0d-4cd3-9ed0-4bcef586c039" />

<img width="1680" height="1050" alt="Screenshot 2025-09-11 at 00 28 51" src="https://github.com/user-attachments/assets/4becd08f-6662-4d29-8414-a2a6514d57cd" />
<img width="1680" height="1050" alt="Screenshot 2025-09-11 at 00 29 05" src="https://github.com/user-attachments/assets/6fcba42c-2099-49da-a578-b8e1d77dde7c" />
OLLAMA PROVIDER
<img width="1680" height="1050" alt="ollamaprovider" src="https://github.com/user-attachments/assets/2771fee3-236b-4155-9c13-73a2779e42ee" />

