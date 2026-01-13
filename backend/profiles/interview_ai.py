import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_interview_question(conversation_history, user_profile, current_round, previous_answer=None):
    """
    Generate dynamic interview questions based on conversation history and user answers
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Build context from conversation history
    context = f"""You are an expert technical interviewer conducting a {current_round} interview.
    
User Profile:
- Skills: {user_profile.get('skills', 'Not specified')}
- Experience: {user_profile.get('experience', 'Not specified')}
- Domain: {user_profile.get('domain', 'Software Engineering')}

Interview Guidelines:
- Ask challenging, thought-provoking questions
- Follow up based on previous answers
- Probe deeper into technical concepts
- Test problem-solving abilities
- Be professional but conversational
- Ask one question at a time

Conversation History:
{conversation_history}

"""
    
    if previous_answer:
        context += f"\nCandidate's last answer: {previous_answer}\n"
        prompt = "Based on the candidate's answer, generate a relevant follow-up question or move to a new topic within this round. Keep the question conversational and challenging."
    else:
        prompt = f"Generate the first question for the {current_round} round. Make it engaging and appropriate for the candidate's profile."
    
    try:
        response = model.generate_content(context + prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating question: {e}")
        return f"Can you tell me about your experience with the key technologies in your domain?"


def analyze_answer(question, answer, context):
    """
    Analyze candidate's answer and provide insights
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""As an expert interviewer, analyze this candidate's response:

Question: {question}
Answer: {answer}

Context: {context}

Provide a brief analysis (2-3 sentences) covering:
1. Quality of the answer
2. Technical depth
3. Suggested follow-up areas

Keep it concise and professional."""
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error analyzing answer: {e}")
        return "The candidate provided a response. Let's continue with the next question."


def generate_round_transition(current_round, next_round, performance_summary):
    """
    Generate natural transition between interview rounds
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""You are an interviewer transitioning from {current_round} to {next_round}.

Performance in {current_round}: {performance_summary}

Generate a brief, encouraging transition statement (1-2 sentences) that:
- Acknowledges their effort
- Introduces the next round naturally
- Keeps them motivated

Keep it conversational and professional."""
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating transition: {e}")
        return f"Thank you for your responses. Let's move on to the {next_round} round."


def generate_final_message(overall_performance):
    """
    Generate concluding interview message
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""As an interviewer concluding the interview, generate a brief closing message (2-3 sentences).

Overall Performance Summary: {overall_performance}

The message should:
- Thank them professionally
- Be encouraging
- Indicate next steps will be communicated

Keep it warm and professional."""
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating final message: {e}")
        return "Thank you for your time today. We'll be in touch soon regarding the next steps. Have a great day!"
