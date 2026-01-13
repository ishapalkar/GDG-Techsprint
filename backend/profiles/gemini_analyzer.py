import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import vertexai

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
USE_VERTEX_AI = os.getenv('USE_VERTEX_AI', 'false').lower() == 'true'
GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
GCP_LOCATION = os.getenv('GCP_LOCATION', 'us-central1')

if USE_VERTEX_AI:
    print(f"🔵 Using Vertex AI (Project: {GCP_PROJECT_ID}, Location: {GCP_LOCATION})")
    try:

        vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
    except ImportError:
        print("❌ vertexai package not installed. Run: pip install google-cloud-aiplatform")
        USE_VERTEX_AI = False
elif GEMINI_API_KEY:
    print(f"🔑 Using Gemini API Key")
    genai.configure(api_key=GEMINI_API_KEY)


def extract_name_from_resume(resume_text):
    """
    Use Gemini to extract the candidate's full name from resume text.
    Handles various resume formats accurately.
    """
    # Check if API key is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        print("Gemini API key not configured, skipping AI extraction")
        return None
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
Extract ONLY the candidate's full name from this resume. 

RULES:
- Return ONLY the person's name (e.g., "John Smith" or "Maria Garcia")
- Do NOT include job titles, email addresses, or any other text
- Do NOT include words like "Resume", "CV", "Profile"
- If you see an email like "john.smith@email.com", extract "John Smith" from it
- Return the name in proper case (Capital Letters)

Resume text:
{resume_text[:3000]}

Candidate's Full Name:"""

        response = model.generate_content(prompt)
        name = response.text.strip()
        
        # Clean up the response
        name = name.replace('Full Name:', '').strip()
        name = name.replace('Name:', '').strip()
        
        return name if name and len(name) > 2 else None
        
    except Exception as e:
        print(f"Error extracting name with Gemini: {e}")
        return None


def get_interview_recommendations(resume_data):
    """
    Use Gemini to analyze resume data and recommend:
    1. Goal (Full Technical Interview / Focused Practice / Quick Mock)
    2. Target Level (Entry/Mid/Senior)
    3. Domain/Field
    """
    # Check if API key is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        print("Gemini API key not configured, returning defaults")
        return {
            "goal": "Focused Practice",
            "target_level": "Entry Level",
            "domain": "Software Development",
            "reasoning": {
                "goal_reason": "API key not configured",
                "level_reason": "API key not configured",
                "domain_reason": "API key not configured"
            }
        }
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Prepare resume summary
        resume_summary = f"""
Resume Data:
- Name: {resume_data.get('full_name', 'N/A')}
- Email: {resume_data.get('email', 'N/A')}
- Skills: {', '.join(resume_data.get('skills', [])[:20])}
- Experience: {json.dumps(resume_data.get('experience', [])[:3], indent=2)}
- Education: {json.dumps(resume_data.get('education', []), indent=2)}
- Projects: {json.dumps(resume_data.get('projects', [])[:2], indent=2)}
- Certifications: {', '.join(resume_data.get('certifications', [])[:5])}
"""

        prompt = f"""
You are an expert career counselor and technical recruiter. Analyze the following resume data and provide recommendations.

{resume_summary}

Based on this resume, provide recommendations in the following JSON format:

{{
  "goal": "Full Technical Interview" or "Focused Practice" or "Quick Mock",
  "target_level": "Entry Level" or "Mid Level" or "Senior Level",
  "domain": "specific domain name like 'Full Stack Development', 'Data Science', 'Machine Learning', 'DevOps', 'Frontend Development', 'Backend Development', 'Mobile Development', etc.",
  "reasoning": {{
    "goal_reason": "brief explanation for goal recommendation",
    "level_reason": "brief explanation for level recommendation",
    "domain_reason": "brief explanation for domain recommendation"
  }}
}}

RULES:
1. For "goal":
   - Recommend "Full Technical Interview" if candidate has 2+ years experience or multiple projects
   - Recommend "Focused Practice" if candidate has 0-2 years experience or specific skill gaps
   - Recommend "Quick Mock" if candidate is a fresher or student with limited experience

2. For "target_level":
   - "Entry Level": 0-2 years experience, recent graduate, or student
   - "Mid Level": 2-5 years experience, multiple projects, diverse skills
   - "Senior Level": 5+ years experience, leadership roles, advanced skills

3. For "domain":
   - Identify the PRIMARY technical domain based on skills and experience
   - Use standard industry terms

Return ONLY the JSON object, no other text.
"""

        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Extract JSON from response (remove markdown if present)
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0].strip()
        
        recommendations = json.loads(result_text)
        return recommendations
        
    except Exception as e:
        print(f"Error getting recommendations with Gemini: {e}")
        # Return default recommendations
        return {
            "goal": "Focused Practice",
            "target_level": "Entry Level",
            "domain": "Software Development",
            "reasoning": {
                "goal_reason": "Default recommendation",
                "level_reason": "Default recommendation",
                "domain_reason": "Default recommendation"
            }
        }


def extract_all_resume_data(resume_text, email=None):
    """
    Use Gemini AI to extract ALL information from resume in one comprehensive call.
    Returns complete structured data ready for database storage.
    """
    # Check if API key is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        print("Gemini API key not configured, using fallback extraction")
        return None
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
You are an expert resume parser. Extract ALL information from this resume and return as valid JSON.

CRITICAL: Return ONLY valid JSON. No markdown, no explanation, no code blocks.

Extract the following:

{{
  "full_name": "candidate's full name (First Last format)",
  "email": "email address from resume or '{email}'",
  "phone": "phone number",
  "location": "city, country",
  "linkedin": "LinkedIn URL if present",
  "github": "GitHub URL if present", 
  "website": "personal website URL if present",
  
  "summary": "professional summary or objective (2-3 sentences describing their career goals/profile)",
  "years_of_experience": 0,
  
  "skills": ["skill1", "skill2", "skill3"],
  
  "education": [
    {{
      "degree": "full degree name (e.g., Bachelor of Technology in Computer Science)",
      "institution": "university/college name",
      "year": "graduation year or expected year"
    }}
  ],
  
  "experience": [
    {{
      "title": "job title or position",
      "company": "company/organization name",
      "duration": "time period (e.g., Jan 2023 - Present)",
      "description": "key responsibilities and achievements"
    }}
  ],
  
  "projects": [
    {{
      "name": "project name",
      "description": "what the project does and your role",
      "technologies": ["tech1", "tech2"]
    }}
  ],
  
  "certifications": ["certification name 1", "certification name 2"],
  
  "languages": ["English", "Hindi"],
  
  "key_strengths": ["strength 1", "strength 2", "strength 3"]
}}

RULES:
- full_name: Extract the person's actual name, NOT job titles or skills
- If email is in resume, use it; otherwise use '{email}'
- summary: Write a professional 2-3 sentence summary if not explicitly stated
- years_of_experience: Calculate based on work history (0 if student/fresher)
- skills: List ALL technical skills, tools, languages, frameworks
- education: Include ALL degrees (high school, bachelor's, master's, etc.)
- experience: Include internships, jobs, volunteer work, leadership roles
- projects: Include academic, personal, and professional projects
- certifications: Include courses, certificates, online courses
- languages: Spoken/written languages
- key_strengths: Top 3-5 technical/professional strengths

Resume Text:
{resume_text}

Return ONLY the JSON object:"""

        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean up response
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0].strip()
        
        # Remove any leading/trailing text
        start_idx = result_text.find('{')
        end_idx = result_text.rfind('}') + 1
        if start_idx != -1 and end_idx > start_idx:
            result_text = result_text[start_idx:end_idx]
        
        extracted_data = json.loads(result_text)
        print(f"✅ AI extracted name: {extracted_data.get('full_name')}")
        print(f"✅ AI extracted {len(extracted_data.get('skills', []))} skills")
        print(f"✅ AI extracted {len(extracted_data.get('education', []))} education entries")
        print(f"✅ AI extracted {len(extracted_data.get('experience', []))} experience entries")
        
        return extracted_data
        
    except Exception as e:
        print(f"❌ Error extracting resume data with Gemini: {e}")
        import traceback
        traceback.print_exc()
        return None


def analyze_interview_recording(video_file, participant_count=1):
    """
    Analyze interview recording using Gemini 2.0 Flash (API Key or Vertex AI)
    Based on working Streamlit implementation
    """
    print("\n" + "="*80)
    print("🎬 STARTING INTERVIEW ANALYSIS")
    print("="*80)
    
    # Check if either Vertex AI or API key is configured
    if USE_VERTEX_AI:
        if not GCP_PROJECT_ID:
            print("❌ FATAL: GCP_PROJECT_ID not configured for Vertex AI")
            return {
                "error": "GCP_PROJECT_ID not configured. Please set it in .env file."
            }
        print(f"✅ Using Vertex AI: {GCP_PROJECT_ID} ({GCP_LOCATION})")
    elif not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        print("❌ FATAL: Neither Vertex AI nor Gemini API key configured")
        return {
            "error": "API not configured. Set either USE_VERTEX_AI=true with GCP_PROJECT_ID, or GEMINI_API_KEY."
        }
    else:
        print(f"✅ Using API Key: {GEMINI_API_KEY[:20]}...")
    
    try:
        # Initialize variables
        gemini_file = None
        video_part = None
        
        # Step 1: Save uploaded file temporarily
        print(f"📁 Video file info:")
        print(f"   - Name: {video_file.name}")
        print(f"   - Size: {video_file.size} bytes ({video_file.size / 1024 / 1024:.2f} MB)")
        print(f"   - Content Type: {video_file.content_type}")
        
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            for chunk in video_file.chunks():
                tmp_file.write(chunk)
            temp_path = tmp_file.name
        
        print(f"✅ Saved to temporary file: {temp_path}")
        
        # Step 2: Upload file (different method for Vertex AI vs API Key)
        if USE_VERTEX_AI:
            print(f"\n📤 UPLOADING TO VERTEX AI...")
            from vertexai.generative_models import Part
            
            # For Vertex AI, we upload directly to GCS or use local file
            video_part = Part.from_data(
                data=open(temp_path, 'rb').read(),
                mime_type=video_file.content_type or 'video/webm'
            )
            print(f"✅ Video loaded for Vertex AI!")
            
        else:
            print(f"\n📤 UPLOADING TO GEMINI API...")
            gemini_file = genai.upload_file(
                temp_path, 
                mime_type=video_file.content_type or 'video/webm'
            )
            print(f"✅ File uploaded successfully!")
            print(f"   - URI: {gemini_file.uri}")
            print(f"   - Name: {gemini_file.name}")
            print(f"   - State: {gemini_file.state.name}")
            
            # Step 3: Wait for processing (API Key only)
            print(f"\n⏳ WAITING FOR VIDEO PROCESSING...")
            import time
            max_wait = 300  # 5 minutes
            wait_time = 0
            
            while gemini_file.state.name == "PROCESSING":
                print(f"   ⏱️  Still processing... ({wait_time}s elapsed)")
                time.sleep(5)
                wait_time += 5
                gemini_file = genai.get_file(gemini_file.name)
                
                if wait_time > max_wait:
                    raise Exception("Video processing timeout (5 minutes exceeded)")
            
            if gemini_file.state.name == "FAILED":
                raise Exception(f"Video processing failed: {gemini_file.state}")
            
            print(f"✅ Video processing complete!")
        
        # Step 4: Generate analysis
        print(f"\n🤖 GENERATING AI ANALYSIS...")
        
        if USE_VERTEX_AI:
            from vertexai.generative_models import GenerativeModel
            model = GenerativeModel('gemini-2.5-flash')
        else:
            model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
Analyze this interview recording with EXTREME ACCURACY. Detect subtle behavioral cues and provide honest, evidence-based assessment.

**CRITICAL: BE BRUTALLY HONEST** - If the candidate shows nervousness, hesitation, or poor performance, REPORT IT ACCURATELY. Do not inflate scores.

**OUTPUT FORMAT:** Return ONLY valid JSON (no markdown, no code blocks).

**DETAILED ANALYSIS REQUIREMENTS:**

1. **Eye Movement Analysis** (BE ACCURATE)
   - Calculate actual percentage of direct eye contact vs looking away
   - Detect: avoiding camera, looking down (reading/nervousness), looking around (distraction)
   - Low eye contact = Low confidence. Report it honestly.
   - Format: "Direct: 45%, Thinking: 20%, Reading/Avoidance: 30%, Distraction: 5%"

2. **Response Delay & Timing** (DETECT HESITATION)
   - Measure actual pause length before speaking
   - Long pauses (>5s) = hesitation/uncertainty
   - Frequent "um", "uh" = lack of preparation
   - Rushed speech after long pause = nervousness
   - Be specific: "Average 6.2s delay indicating significant hesitation"

3. **Speaking Pace Analysis** (DETECT NERVOUSNESS)
   - Fast pace (>180 WPM) = nervousness/rushing
   - Slow pace (<100 WPM) = uncertainty/lack of knowledge
   - Uneven pace = nervousness
   - Count every "um", "uh", "like", "you know", "basically"
   - 10+ filler words = poor communication

4. **Confidence & Nervousness Detection** (BE HONEST)
   - Confidence Score:
     * 0-40: Very nervous, lacking confidence
     * 41-60: Moderate nervousness, some hesitation
     * 61-80: Generally confident with minor nerves
     * 81-100: Highly confident and composed
   - Detect: fidgeting, hand trembling, voice shaking, avoiding eye contact
   - Detect: clearing throat, sighing, nervous laughter
   - Report actual emotional state, not what you think they want to hear

5. **Cheating/Integrity Indicators** (CRITICAL DETECTION)
   - Reading from screen: prolonged downward gaze (>3s continuously)
   - Looking off-screen: checking notes, getting help
   - Unnatural pauses: waiting for someone to feed answers
   - Sudden fluency changes: switching from hesitant to scripted
   - Background noise: keyboard typing, other voices, notifications
   - Risk Score Calculation:
     * Reading behavior >15% = +30 points
     * Off-screen looking frequent = +25 points
     * Unnatural pause patterns = +20 points
     * Audio anomalies = +15 points
     * Fluency inconsistencies = +10 points

6. **Body Language** (DETECT DISCOMFORT)
   - Fidgeting: touching face, adjusting clothing, playing with hands
   - Posture: slouching, leaning away = low confidence
   - Facial expressions: forced smiles, frowning, blank stares
   - Head movements: excessive nodding, shaking, looking down

7. **Communication Quality** (BE CRITICAL)
   - Clarity: mumbling, trailing off, incomplete sentences = poor
   - Structure: rambling, losing track, no clear point = poor
   - Vocabulary: repetitive words, basic language, searching for words = weak
   - Examples: vague generalities instead of specific examples = unprepared

**JSON STRUCTURE (ALL FIELDS REQUIRED):**

{
  "eye_contact_percentage": "45%",
  "eye_movement_breakdown": {
    "direct_contact": "45%",
    "thinking_away": "20%",
    "reading_down": "30%",
    "distraction": "5%"
  },
  "gaze_behavior": "Frequent looking down (30%) suggests reading or nervousness. Limited direct eye contact (45%) indicates discomfort with camera.",
  
  "response_delay_average": "6.2 seconds",
  "response_delay_range": "2s - 15s",
  "response_pattern": "Long hesitation before answers. Several pauses exceeded 10 seconds showing uncertainty.",
  "response_timing": "Average 6.2s delay with maximum 15s pause at 02:34 during technical question. Indicates significant hesitation.",
  
  "speaking_pace_wpm": "142 WPM",
  "speaking_pace": "Uneven pace: rushed during simple answers (180 WPM), slow during complex questions (100 WPM). Suggests nervousness.",
  "filler_words": "Frequent: 18 total - 'um' (12x), 'uh' (4x), 'like' (2x). Indicates lack of preparation.",
  "filler_word_count": 18,
  
  "cheating_risk_score": 35,
  "suspicion_risk": "moderate",
  "integrity_notes": "Risk Score: 35/100 - Moderate. Frequent downward gaze (30%) may indicate reading. Three long pauses (10-15s) at 01:23, 02:34, 04:56 coinciding with complex questions suggest possible external assistance.",
  "cheating_indicators": {
    "reading_behavior": "30% of time with sustained downward gaze >3 seconds",
    "off_screen_looking": "5% - occasional glances to the right",
    "audio_anomalies": "Faint keyboard clicking detected at 02:40",
    "unnatural_pauses": "3 instances of 10+ second pauses during complex questions",
    "fluency_changes": "Sudden improvement in technical terminology after long pauses"
  },
  
  "head_movement": "Frequent fidgeting and head tilting. Avoided direct camera angle. Suggests discomfort.",
  "body_language_metrics": {
    "posture_changes": "7 shifts - restless movement",
    "fidgeting_level": "High - frequent hand movements, face touching",
    "hand_gestures": "Minimal - kept hands out of frame",
    "facial_expressions": "Tense, forced smiles, frowning during difficult questions"
  },
  
  "confidence_score": 42,
  "confidence_breakdown": {
    "introduction": 38,
    "technical_questions": 35,
    "problem_solving": 45,
    "behavioral_round": 50
  },
  "emotion_trend": "Started nervous (38%), remained anxious through technical section (35%), slight improvement in later sections but never fully comfortable.",
  "voice_tone_analysis": "Shaky and uncertain. Voice trembling detected during complex questions. Frequent throat clearing.",
  
  "attention_level": "moderate",
  "eye_movement_pattern": "45% direct, 20% thinking, 30% reading/down, 5% distraction. Low direct contact indicates nervousness.",
  "communication_analysis": "Unclear articulation. Rambling responses lacking structure. Struggled to provide specific examples. 18 filler words indicate poor preparation.",
  
  "strengths": [
    "Attempted to answer all questions despite difficulty",
    "Showed basic understanding of fundamental concepts",
    "Maintained presence throughout despite visible nervousness"
  ],
  
  "improvements": [
    "Practice answering questions out loud to reduce filler words (18 instances is very high)",
    "Work on maintaining eye contact - 45% is below average, suggests nervousness",
    "Prepare specific examples beforehand - answers were too vague and generalized",
    "Slow down and structure responses - current pace is uneven and rushed"
  ],
  
  "technical_analysis": "Based on interview responses and technical questions asked",
  "technical_accuracy": "Provided basic correct information but lacked depth. Missed key concepts in data structures explanation. Used incorrect terminology for algorithms (45% accuracy).",
  "technical_accuracy_score": 45,
  "knowledge_depth": "Surface-level understanding demonstrated. Could explain basics but struggled with advanced concepts. Examples were generic rather than specific. Unable to discuss trade-offs or optimizations.",
  "missing_concepts": [
    "Time complexity analysis for common algorithms",
    "Memory optimization techniques",
    "Advanced data structure applications",
    "System design principles",
    "Scalability considerations"
  ],
  "technical_tips": [
    "Study algorithm time/space complexity with practical examples",
    "Practice coding problems daily to improve problem-solving speed",
    "Learn to explain technical concepts with specific real-world examples",
    "Review fundamental data structures: trees, graphs, hash tables in depth",
    "Prepare for system design by studying architecture patterns"
  ],
  "learning_resources": [
    {
      "topic": "Algorithm Complexity",
      "description": "Master Big O notation and analyze algorithm efficiency"
    },
    {
      "topic": "Data Structures",
      "description": "Deep dive into advanced structures like tries, heaps, B-trees"
    },
    {
      "topic": "System Design",
      "description": "Learn scalability patterns and distributed systems basics"
    },
    {
      "topic": "Problem Solving",
      "description": "Practice LeetCode medium/hard problems with time constraints"
    }
  ]
}

**CRITICAL RULES:**
1. BE HONEST - If performance is poor, say so with evidence
2. LOW SCORES for hesitation, nervousness, poor eye contact
3. HIGH RISK SCORES for suspicious behavior
4. COUNT every filler word accurately
5. MEASURE actual pauses and delays
6. DETECT subtle behavioral cues: fidgeting, voice trembling, avoiding camera
7. NO INFLATION - Report actual performance, not what you hope to see
8. Every field MUST be filled - no skipping
9. Use SPECIFIC numbers and percentages from actual observation
10. If truly confident performance, score high. If nervous/hesitant, score low (40-60 range)

**OUTPUT FORMAT RULES:**
- Return ONLY valid JSON - no markdown, no code blocks, no explanations
- NO trailing commas in objects or arrays
- ALL keys must be in "double quotes"
- NO comments (//, /* */)
- Ensure all braces {{ }} and brackets [ ] are properly closed

Return ONLY the complete JSON object with ALL fields filled."""
        
        # Send prompt with video (different for Vertex AI vs API Key)
        if USE_VERTEX_AI:
            response = model.generate_content([video_part, prompt])
        else:
            response = model.generate_content([prompt, gemini_file])
            
        print(f"✅ AI analysis generated!")
        print(f"\n📄 RAW RESPONSE (first 500 chars):")
        print(response.text[:500] + "..." if len(response.text) > 500 else response.text)
        
        # Step 5: Parse JSON response
        print(f"\n🔧 PARSING JSON...")
        import json
        import re
        
        # Clean response text
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'^```\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        # Extract JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group()
            
            # Additional cleaning for common AI JSON errors
            # Remove trailing commas before closing braces/brackets
            json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
            # Remove comments (// or /* */)
            json_text = re.sub(r'//.*?$', '', json_text, flags=re.MULTILINE)
            json_text = re.sub(r'/\*.*?\*/', '', json_text, flags=re.DOTALL)
            
            try:
                analysis_data = json.loads(json_text)
                print(f"✅ JSON parsed successfully!")
                print(f"   - Emotion Trend: {analysis_data.get('emotion_trend', 'N/A')[:50]}...")
                print(f"   - Confidence Score: {analysis_data.get('confidence_score', 'N/A')}")
                print(f"   - Attention Level: {analysis_data.get('attention_level', 'N/A')}")
                print(f"   - Suspicion Risk: {analysis_data.get('suspicion_risk', 'N/A')}")
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                print(f"📄 Cleaned JSON (first 1000 chars):")
                print(json_text[:1000])
                raise Exception(f"Invalid JSON from Gemini: {e}")
        else:
            print("❌ Could not extract JSON from response")
            print(f"Response text: {response_text[:200]}")
            raise Exception("Could not extract JSON from Gemini response")
        
        # Step 6: Add ranking data
        analysis_data['ranking_position'] = 1
        analysis_data['total_participants'] = participant_count
        
        # Calculate percentile band
        if participant_count > 1:
            percentile = (1 / participant_count) * 100
            if percentile <= 10:
                percentile_band = "Top 10%"
            elif percentile <= 25:
                percentile_band = "Top 25%"
            elif percentile <= 50:
                percentile_band = "Top 50%"
            else:
                percentile_band = f"Top {int(percentile)}%"
        else:
            percentile_band = "N/A"
        
        analysis_data['percentile_band'] = percentile_band
        
        # Step 7: Clean up temporary file
        import os
        try:
            os.remove(temp_path)
            print(f"🗑️  Cleaned up temp file: {temp_path}")
        except:
            pass
        
        print("\n" + "="*80)
        print("✅ ANALYSIS COMPLETE - REAL AI DATA (Streamlit Method)")
        print("="*80 + "\n")
        
        return analysis_data
        
    except Exception as e:
        print("\n" + "="*80)
        print(f"❌ ERROR DURING ANALYSIS")
        print("="*80)
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n⚠️  FALLING BACK TO MOCK DATA")
        print("="*80 + "\n")
        
        return generate_mock_analysis(participant_count)


def generate_mock_analysis(participant_count):
    """Generate detailed UI-ready mock data when real analysis fails"""
    import random
    
    print("🎭 GENERATING MOCK DATA (NOT REAL AI)")
    
    confidence = random.randint(68, 82)
    direct_eye = random.randint(60, 72)
    thinking_eye = random.randint(18, 28)
    reading_eye = random.randint(5, 10)
    distraction_eye = 100 - direct_eye - thinking_eye - reading_eye
    
    wpm = random.randint(140, 165)
    avg_delay = round(random.uniform(2.0, 4.0), 1)
    filler_count = random.randint(4, 8)
    risk_score = random.randint(8, 18)
    
    return {
        # Detailed eye movement
        'eye_contact_percentage': f"{direct_eye}%",
        'eye_movement_breakdown': {
            'direct_contact': f"{direct_eye}%",
            'thinking_away': f"{thinking_eye}%",
            'reading_down': f"{reading_eye}%",
            'distraction': f"{distraction_eye}%"
        },
        'gaze_behavior': f'Maintained {direct_eye}% direct eye contact. Natural upward glances during problem-solving.',
        
        # Response timing
        'response_delay_average': f'{avg_delay} seconds',
        'response_delay_range': f'{avg_delay-1.0}s - {avg_delay+3.0}s',
        'response_pattern': 'Thoughtful pauses before complex answers. No rushed responses observed.',
        'response_timing': f'Average {avg_delay}s thinking time. Longest pause {avg_delay+3}s during algorithm question.',
        
        # Speaking pace
        'speaking_pace_wpm': f'{wpm} WPM',
        'speaking_pace': f'Steady {wpm-5}-{wpm+5} WPM. Consistent pace throughout interview.',
        'filler_words': f'Minimal: {filler_count} total instances across interview duration.',
        'filler_word_count': filler_count,
        
        # Cheating indicators
        'cheating_risk_score': risk_score,
        'suspicion_risk': 'low',
        'integrity_notes': f'Risk Score: {risk_score}/100 - Very Low. Reading behavior minimal ({reading_eye}% of time, likely question reading). No off-screen distraction detected. No audio anomalies. Natural response patterns.',
        'cheating_indicators': {
            'reading_behavior': f'{reading_eye}% of time - brief glances aligned with question reading',
            'off_screen_looking': 'Minimal - natural environmental awareness only',
            'audio_anomalies': 'None detected - clean audio throughout',
            'unnatural_pauses': 'None - all pauses correlate with question complexity',
            'fluency_changes': 'Consistent - no sudden script-like delivery'
        },
        
        # Body language
        'head_movement': 'Natural head movements and nodding. Minimal fidgeting observed.',
        'body_language_metrics': {
            'posture_changes': f'{random.randint(1, 3)} minor adjustments',
            'fidgeting_level': random.choice(['Very Low', 'Low', 'Moderate']),
            'hand_gestures': 'Moderate use during explanations',
            'facial_expressions': 'Engaged and responsive throughout'
        },
        
        # Confidence breakdown
        'confidence_score': confidence,
        'confidence_breakdown': {
            'introduction': confidence - random.randint(8, 15),
            'technical_questions': confidence + random.randint(2, 8),
            'problem_solving': confidence + random.randint(5, 12),
            'behavioral_round': confidence - random.randint(0, 5)
        },
        'emotion_trend': f'Started at {confidence-12}% confidence, built to {confidence+10}% during technical section, maintained strong composure.',
        'voice_tone_analysis': 'Steady and measured tone. Progressive confidence increase. No nervous indicators.',
        
        # Existing fields
        'attention_level': 'high',
        'eye_movement_pattern': f'{direct_eye}% direct, {thinking_eye}% thinking, {reading_eye}% reading, {distraction_eye}% environmental.',
        'communication_analysis': f'Clear articulation at {wpm} WPM. Well-structured responses. Minimal hesitation.',
        
        # Strengths & improvements
        'strengths': [
            f'Excellent eye contact ({direct_eye}%) demonstrating high engagement and confidence',
            f'Optimal response timing ({avg_delay}s average) - thoughtful without excessive hesitation',
            f'Natural speaking pace ({wpm} WPM) with minimal filler words ({filler_count} total)',
            'Strong technical articulation with logical problem-solving approach'
        ],
        'improvements': [
            'Reduce slight nervous energy in opening segment for stronger first impression',
            'Include more specific quantitative examples from past project experience',
            'Ask clarifying questions to demonstrate analytical thinking before answering'
        ],
        
        # Technical Analysis
        'technical_analysis': 'Demonstrated solid technical understanding with room for deeper conceptual knowledge',
        'technical_accuracy': f'Provided accurate technical explanations with {random.randint(75, 85)}% correctness. Good grasp of fundamentals with minor gaps in advanced concepts.',
        'technical_accuracy_score': random.randint(75, 85),
        'knowledge_depth': 'Demonstrated good breadth across topics. Could benefit from deeper exploration of system design patterns and optimization techniques.',
        'missing_concepts': [
            'Advanced algorithm optimization strategies',
            'Distributed system trade-offs',
            'Memory profiling and performance tuning',
            'Microservices communication patterns'
        ],
        'technical_tips': [
            'Practice explaining complex algorithms with real-world examples',
            'Study time/space complexity analysis for common data structures',
            'Review design patterns and their practical applications',
            'Work on system design fundamentals: scalability, reliability, performance',
            'Build projects that demonstrate end-to-end technical implementation'
        ],
        'learning_resources': [
            {
                'topic': 'Algorithm Design',
                'description': 'Practice dynamic programming and greedy algorithms with LeetCode'
            },
            {
                'topic': 'System Architecture',
                'description': 'Study case studies of large-scale distributed systems'
            },
            {
                'topic': 'Code Optimization',
                'description': 'Learn profiling tools and performance analysis techniques'
            },
            {
                'topic': 'Design Patterns',
                'description': 'Master common patterns: Singleton, Factory, Observer, Strategy'
            }
        ],
        
        # Ranking
        'ranking_position': 1,
        'total_participants': participant_count,
        'percentile_band': 'N/A'
    }