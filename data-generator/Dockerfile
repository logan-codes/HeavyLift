FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default: seed master data + 6-month history, then exit.
# Override CMD to also stream: python generate.py --stream-only
CMD ["python", "generate.py", "--seed-only"]
