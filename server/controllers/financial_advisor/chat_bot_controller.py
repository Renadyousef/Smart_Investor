from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parents[2] / ".env"

load_dotenv(env_path)

print(os.getenv("NVIDIA_API_KEY"))


from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_nvidia_ai_endpoints import (
    ChatNVIDIA,
    NVIDIAEmbeddings
)

print("Imports OK")

# CONFIG


VECTOR_DB_PATH = "./vector_db"

MODEL_NAME = "qwen/qwen3-next-80b-a3b-instruct"

EMBEDDING_MODEL = "nvidia/llama-nemotron-embed-1b-v2"

# files realted configs
BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"

VECTOR_DB_PATH = str(BASE_DIR / "vector_db")

# LOAD PDF


def load_pdf(pdf_path):

    loader = PyPDFLoader(pdf_path)

    return loader.load()



# CHUNKING for large files


def chunk_documents(
    documents,
    chunk_size=1000,
    chunk_overlap=200
):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    return splitter.split_documents(documents)



# METADATA


def add_metadata(
    chunks,
    company,
    year,
    document_type
):
    for chunk in chunks:

        chunk.metadata["company"] = company
        chunk.metadata["year"] = year
        chunk.metadata["document_type"] = document_type

    return chunks


# EMBEDDINGS


def get_embedding_model():

    return NVIDIAEmbeddings(
        model=EMBEDDING_MODEL
    )



# VECTOR STORE


def create_vector_store(chunks):

    embeddings = get_embedding_model()

    return Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=VECTOR_DB_PATH
    )


def load_vector_store():

    embeddings = get_embedding_model()

    return Chroma(
        persist_directory=VECTOR_DB_PATH,
        embedding_function=embeddings
    )



# INGESTION :You only do this once per document update.
# RUN ONCE

# it is ran once for all files
def ingest_documents():

    all_chunks = []

    companies = ["aramco", "sabic", "alrajhi"]

    for company in companies:

        company_folder = DATA_DIR / company

        print(f"\nChecking: {company_folder}")

        pdf_files = list(company_folder.rglob("*.pdf"))

        print(f"Found {len(pdf_files)} PDFs")

        for pdf_path in pdf_files:

            print(f"Processing: {pdf_path}")

            docs = load_pdf(str(pdf_path))

            print(f"Loaded {len(docs)} pages")

            chunks = chunk_documents(docs)

            print(f"Created {len(chunks)} chunks")

            report_type = "Quarterly Report"

            if "annual" in str(pdf_path).lower():
                report_type = "Annual Report"

            chunks = add_metadata(
                chunks=chunks,
                company=company,
                year=2025,
                document_type=report_type
            )

            all_chunks.extend(chunks)

    print(f"\nTotal chunks before embedding: {len(all_chunks)}")

    create_vector_store(all_chunks)

    print(f"Total chunks stored: {len(all_chunks)}")



# RETRIEVAL


def get_retriever():

    db = load_vector_store()

    return db.as_retriever(
        search_kwargs={"k": 5}
    )


def retrieve_documents(question):

    retriever = get_retriever()

    return retriever.invoke(question)


def build_context(documents):

    return "\n\n".join(
        doc.page_content
        for doc in documents
    )



# GENERATION


def financial_advisor(
    user_query,
    context
):

    prompt = f"""
أنت مستشار مالي متخصص في سوق الأسهم السعودي.

الشركات التي تغطيها:
- أرامكو
- سابك
- الراجحي

اعتمد فقط على المعلومات الموجودة في السياق.

مهم جداً:

إذا سأل المستخدم أسئلة مثل:
- هل أشتري؟
- هل أستثمر؟
- أي شركة أفضل؟
- ما هي أفضل فرصة استثمارية؟
- هل السهم مناسب للاستثمار طويل المدى؟
- ما الشركة الأفضل للنمو؟

فلا تبحث عن توصية شراء جاهزة داخل التقرير.

بدلاً من ذلك:

1. استخرج الحقائق المالية والتشغيلية من السياق.
2. حلل نقاط القوة.
3. حلل نقاط الضعف والمخاطر.
4. استخرج فرص النمو المستقبلية المذكورة في التقارير.
5. إذا طلب المستخدم مقارنة بين شركتين فقارن بينهما باستخدام المعلومات المتاحة.
6. قدم تقييماً استثمارياً مبنياً على المعلومات الموجودة في الوثائق فقط.
7. لا تخترع أي معلومة أو رقم غير موجود في السياق.
8. أجب دائماً باللغة العربية.

عند السؤال عن الاستثمار استخدم التنسيق التالي:

الملخص

نقاط القوة

نقاط الضعف والمخاطر

فرص النمو

التقييم الاستثماري

إذا كانت المعلومات المتاحة غير كافية فعلاً للإجابة فقل:
لا توجد معلومات كافية في الوثائق المتاحة.

السياق:
{context}

سؤال المستخدم:
{user_query}
"""

    client = ChatNVIDIA(
        model=MODEL_NAME,
        api_key=os.getenv("NVIDIA_API_KEY"),
        temperature=0.3,
        top_p=0.95,
        max_completion_tokens=4096
    )

    response = client.invoke([
        {
            "role": "system",
            "content": """
أنت محلل مالي ومستشار استثماري متخصص في السوق السعودي.

تعتمد على التقارير السنوية والربع سنوية للشركات المدرجة.

عندما يسأل المستخدم عن:
- الاستثمار
- الشراء
- البيع
- المقارنة بين الشركات

قم بتحليل المعلومات الموجودة في التقارير واستنتاج المزايا والمخاطر وفرص النمو.

لا تخترع أي معلومات أو أرقام غير موجودة في الوثائق.

إذا لم تتوفر معلومات كافية في السياق للإجابة بشكل موثوق فأخبر المستخدم بذلك.

أجب دائماً باللغة العربية.
"""
        },
        {
            "role": "user",
            "content": prompt
        }
    ])

    return response.content



# RAG CHAIN


#Chain built
def ask_financial_advisor(user_query):

    print("1. Retrieving documents...")

    docs = retrieve_documents(user_query)

    print(f"2. Retrieved {len(docs)} docs")

    context = build_context(docs)

    print(f"3. Context length: {len(context)}")

    print("4. Calling Qwen...")

    answer = financial_advisor(
        user_query,
        context
    )

    print("5. Qwen responded")

    return answer


# tesring calls

if __name__ == "__main__":

    question = "هل أشتري سهم أرامكو؟"

    answer = ask_financial_advisor(question)

    print("\nQUESTION:")
    print(question)

    print("\nANSWER:")
    print(answer)
