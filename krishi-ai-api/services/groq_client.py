"""Groq LLM client for the chatbot endpoint."""
import os
from groq import Groq
from config import GROQ_API_KEY

# Premade answers for common questions
PREMADE_REQUESTS = {
    "What is AgroTech AI?": (
        "AgroTech AI is a cutting-edge platform that uses artificial intelligence to improve farming practices. "
        "It helps farmers make better decisions by providing insights based on data, ultimately leading to more efficient and productive agriculture. "
        "To learn more about us, feel free to visit our <a href='https://agro-tech-ai.vercel.app/aboutus' style='color: blue; text-decoration: underline;'>About Us page</a>."
    ),
    "How does the equipment rental platform work?": (
        "Our equipment rental platform lets farmers easily rent advanced farming equipment when they need it. "
        "This on-demand service allows you to access the latest tools without the high costs of ownership, helping you to enhance your farming operations."
    ),
    "Is there any training for using the technology?": (
        "Yes, we provide detailed training modules designed to help farmers learn how to use our technology effectively. "
        "These modules cover everything from basic operations to advanced features, ensuring that you feel confident in using our tools."
    ),
    "How do I get started with AgroTech AI?": (
        "To get started, go to the <a href='https://agro-tech-ai.vercel.app/login' style='color: blue; text-decoration: underline;'>Login</a> in the navigation bar. "
        "From there, select 'Don't have an account? Sign Up' and fill in your name, email, and password to explore our AI-powered tools and services!"
    ),
    "Why use AI in agriculture?": (
        "AI optimizes resources, predicts crop yields, and reduces waste, improving the overall efficiency of farming practices. "
        "Check out our <a href='https://agro-tech-ai.vercel.app' style='color: blue; text-decoration: underline;'>home page</a> to learn more."
    ),
    "How do we do it?": (
        "We use machine learning models to analyze data, optimize crop yields, and automate various agricultural processes. "
        "Visit our <a href='https://agro-tech-ai.vercel.app/aboutus' style='color: blue; text-decoration: underline;'>About Us page</a> to learn more about our approach."
    ),
    "What kind of solutions does AgroTech AI offer?": (
        "AgroTech AI offers solutions like precision farming, automated irrigation, and pest control using AI-driven analytics. "
        "These solutions help farmers increase productivity and improve their overall yield."
    ),
    "What features does AgroTech AI offer?": (
        "Our platform provides features such as soil analysis, crop monitoring, and AI-driven decision-making tools. "
        "Check out the navigation bar on our <a href='https://agro-tech-ai.vercel.app' style='color: blue; text-decoration: underline;'>website</a> to access all the features available."
    ),
    "How do I create an account?": (
        "To sign up, go to the <a href='https://agro-tech-ai.vercel.app/login' style='color: blue; text-decoration: underline;'>Login</a> in the navigation bar, then select 'Don't have an account? Sign Up.' "
        "Fill in your name, email, and password, and you're done! You'll then be able to start exploring our amazing features."
    ),
    "Where can I find more information about your features?": (
        "You can find detailed information about all our features on our <a href='https://agro-tech-ai.vercel.app' style='color: blue; text-decoration: underline;'>home page</a>. "
        "This area provides insights into how each tool works and how it can benefit your farming practices."
    )
}

_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        os.environ["GROQ_API_KEY"] = GROQ_API_KEY
        _client = Groq()
    return _client


async def get_chat_response(user_prompt: str) -> str:
    """Get a response from the chatbot."""
    # Check premade requests first
    if user_prompt in PREMADE_REQUESTS:
        return PREMADE_REQUESTS[user_prompt]

    # Use Groq LLM
    try:
        client = get_client()
        messages = [
            {
                "role": "system",
                "content": "You are an AI assistant for AgroTech AI, an innovative platform that leverages artificial intelligence "
                           "to enhance agricultural practices. Provide helpful and accurate information about AgroTech AI's services "
                           "and agricultural technology."
            },
            {"role": "user", "content": user_prompt}
        ]
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")

