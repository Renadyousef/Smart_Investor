#Logic of evalution is a method called LLM AS JUDGE
#  Generate 10 Saudi market questions.
# Run retrieval.
# Use LLM judge to evaluate retrieved chunks.
# Run generation.
# Use LLM judge to evaluate answer.
# Calculate percentages.


import os
import json
import re

from pathlib import Path
from dotenv import load_dotenv

from langchain_nvidia_ai_endpoints import ChatNVIDIA


# import your existing RAG pipeline
from chat_bot_controller import (
    retrieve_documents,
    build_context,
    financial_advisor
)



# ENV


env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(env_path)


MODEL_NAME = "nvidia/nemotron-3-nano-30b-a3b"




# LLM JUDGE


def get_judge():

    return ChatNVIDIA(
        model=MODEL_NAME,
        api_key=os.getenv("NVIDIA_API_KEY"),
        temperature=0
    )




# 10 TEST QUESTIONS


def generate_questions():

    return [

        "ما هي أبرز نقاط القوة المالية لشركة أرامكو؟",

        "ما هي المخاطر الرئيسية التي تواجه أرامكو حسب التقارير المالية؟",

        "كيف كان أداء أرامكو في الربع الأول؟",

        "ما هي استراتيجية النمو المستقبلية لشركة سابك؟",

        "ما هي أهم التحديات التي أثرت على أداء سابك؟",

        "كيف تغيرت أرباح سابك خلال الفترة الأخيرة؟",

        "ما هي عوامل نمو مصرف الراجحي؟",

        "كيف كان الأداء المالي لمصرف الراجحي في التقرير السنوي؟",

        "ما هي أهم المخاطر الاستثمارية في مصرف الراجحي؟",

        "قارن بين قوة الأداء المالي لأرامكو وسابك"
    ]




# PARSE JSON FROM JUDGE


def extract_json(text):

    try:
        return json.loads(text)

    except:

        match = re.search(
            r"\{.*\}",
            text,
            re.DOTALL
        )

        if match:
            return json.loads(
                match.group()
            )

        return {}




# RETRIEVAL JUDGE


def evaluate_retrieval(
    question,
    docs
):

    judge = get_judge()


    context = "\n\n".join(
        [
            f"""
Company:
{doc.metadata.get('company')}

Document:
{doc.metadata.get('document_type')}

Content:
{doc.page_content[:700]}
"""
            for doc in docs
        ]
    )


    prompt=f"""

أنت تقيم نظام استرجاع RAG مالي.


السؤال:
{question}


المقاطع المسترجعة:
{context}



قيم من 1 إلى 5:

relevance:
هل المقاطع مرتبطة بالسؤال؟

coverage:
هل تحتوي المعلومات المطلوبة؟

noise:
هل يوجد الكثير من المعلومات غير المتعلقة؟


أرجع JSON فقط:

{{
"relevance":0,
"coverage":0,
"noise":0
}}

"""


    response = judge.invoke(prompt)


    return extract_json(
        response.content
    )




# GENERATION JUDGE


def evaluate_generation(
    question,
    context,
    answer
):

    judge=get_judge()


    prompt=f"""

أنت خبير تقييم لنظام RAG مالي سعودي.


السؤال:
{question}


السياق:
{context}


إجابة النظام:
{answer}



قيم من 1 إلى 5:


faithfulness:
هل الإجابة مبنية على السياق فقط؟


relevance:
هل أجابت السؤال مباشرة؟


completeness:
هل ذكرت المعلومات المهمة؟


safety:
هل تجنبت توصية مالية مباشرة أو معلومات مخترعة؟



أرجع JSON فقط:

{{
"faithfulness":0,
"relevance":0,
"completeness":0,
"safety":0
}}

"""


    response = judge.invoke(prompt)


    return extract_json(
        response.content
    )




# CALCULATE PERCENTAGE after eval
 

def calculate_percentage(scores):

    total=0
    count=0


    for item in scores:

        for value in item.values():

            total += value
            count += 1


    # max score = 5

    return round(
        (total/(count*5))*100,
        2
    )




# MAIN EVALUATION


def run_evaluation():


    questions = generate_questions()


    retrieval_results=[]
    generation_results=[]


    all_results=[]


    for q in questions:


        print("\n================")
        print(q)


        # ---------
        # Retrieval
        # ---------

        docs = retrieve_documents(q)


        retrieval_score = evaluate_retrieval(
            q,
            docs
        )


        retrieval_results.append(
            retrieval_score
        )



        # ---------
        # Generation
        # ---------

        context = build_context(
            docs
        )


        answer = financial_advisor(
            q,
            context
        )


        generation_score = evaluate_generation(
            q,
            context,
            answer
        )


        generation_results.append(
            generation_score
        )



        all_results.append(
            {
                "question":q,

                "retrieved_chunks":
                len(docs),

                "answer":
                answer,

                "retrieval_score":
                retrieval_score,

                "generation_score":
                generation_score
            }
        )



    retrieval_percentage = calculate_percentage(
        retrieval_results
    )


    generation_percentage = calculate_percentage(
        generation_results
    )



    final={

        "retrieval_score_percentage":
        retrieval_percentage,


        "generation_score_percentage":
        generation_percentage,


        "details":
        all_results
    }


    return final





# RUN


if __name__=="__main__":


    result = run_evaluation()


    with open(
        "rag_evaluation_results.json",
        "w",
        encoding="utf-8"
    ) as f:


        json.dump(
            result,
            f,
            ensure_ascii=False,
            indent=4
        )


    print("\n================")
    print("Evaluation Finished")

    print(
        "Retriever:",
        result["retrieval_score_percentage"],
        "%"
    )


    print(
        "Generator:",
        result["generation_score_percentage"],
        "%"
    )