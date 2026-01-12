from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from .interview_ai import generate_interview_question, analyze_answer, generate_round_transition, generate_final_message
import json


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def generate_question(request):
    """
    Generate dynamic interview question using Gemini AI
    """
    try:
        data = request.data
        conversation_history = data.get('conversation_history', [])
        user_profile = data.get('user_profile', {})
        current_round = data.get('current_round', 'Technical')
        previous_answer = data.get('previous_answer', None)
        
        # Format conversation history
        history_text = "\n".join([
            f"{'AI' if msg['type'] == 'ai' else 'Candidate'}: {msg['message']}"
            for msg in conversation_history[-10:]  # Last 10 messages for context
        ])
        
        question = generate_interview_question(
            history_text,
            user_profile,
            current_round,
            previous_answer
        )
        
        return Response({
            'success': True,
            'question': question,
            'round': current_round
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'question': 'Can you tell me about a challenging project you worked on?'
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def analyze_response(request):
    """
    Analyze candidate's answer using Gemini AI
    """
    try:
        data = request.data
        question = data.get('question', '')
        answer = data.get('answer', '')
        context = data.get('context', '')
        
        analysis = analyze_answer(question, answer, context)
        
        return Response({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'analysis': 'Response recorded.'
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def transition_round(request):
    """
    Generate transition message between rounds
    """
    try:
        data = request.data
        current_round = data.get('current_round', '')
        next_round = data.get('next_round', '')
        performance_summary = data.get('performance_summary', 'Good performance')
        
        transition = generate_round_transition(
            current_round,
            next_round,
            performance_summary
        )
        
        return Response({
            'success': True,
            'message': transition
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': f"Let's move on to the {next_round} round."
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def conclude_interview(request):
    """
    Generate final interview message
    """
    try:
        data = request.data
        overall_performance = data.get('overall_performance', 'Thank you for participating')
        
        final_message = generate_final_message(overall_performance)
        
        return Response({
            'success': True,
            'message': final_message
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Thank you for your time today!'
        }, status=500)
