#app in ur strucuture is chat_bot_controller.py here
from langchain_nvidia_ai_endpoints import ChatNVIDIA

def financial_advisor(user_query, context):

    prompt = f"""
أنت مستشار مالي متخصص في سوق الأسهم السعودي.

الشركات التي تغطيها:
- أرامكو
- سابك
- الراجحي

استخدم فقط المعلومات الموجودة في السياق.

السياق:
{context}

سؤال المستخدم:
{user_query}
"""

    client = ChatNVIDIA(
        model="qwen/qwen3.5-397b-a17b",
        api_key="$NVIDIA_API_KEY",
        temperature=0.3,
        top_p=0.95,
        max_completion_tokens=4096,
    )

    response = client.invoke([
        {
            "role": "system",
            "content": "أنت محلل مالي متخصص في السوق السعودي."
        },
        {
            "role": "user",
            "content": prompt
        }
    ])

    return response.content