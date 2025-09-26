from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

html_content = open("./data/resume.html", "r").read()

prompt = f"""
You are an HTML-aware editor. Modify the professional summary alone into a ML researcher role; preserve all tags and styling.
Here is the HTML:
{html_content}
"""

resp = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}]
)

updated_html = resp.choices[0].message.content

with open("./data/resume_updated.html", "w") as f:
    f.write(updated_html)