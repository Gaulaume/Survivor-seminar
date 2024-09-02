FROM python:3.9


WORKDIR /code


COPY ./requirements1.txt /code/requirements1.txt


RUN pip install --no-cache-dir --upgrade -r /code/requirements1.txt


COPY ../. /code/app


CMD ["fastapi", "run", "../main.py" , "--port", "80"]
