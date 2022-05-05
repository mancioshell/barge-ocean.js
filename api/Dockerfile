FROM python:3.8-buster AS build

WORKDIR /app
ENV VIRTUAL_ENV /app/.venv
ENV POETRY_HOME /app/.poetry
ENV POETRY_VERSION 1.1.13
ENV PATH $POETRY_HOME/bin:$VIRTUAL_ENV/bin:$PATH

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/${POETRY_VERSION}/get-poetry.py | python \
    && poetry config virtualenvs.in-project true

COPY poetry.lock pyproject.toml ./

RUN poetry install

FROM python:3.8-slim-buster AS api

WORKDIR /app
ENV PYTHONPATH /app
ENV VIRTUAL_ENV /app/.venv
ENV POETRY_HOME /app/.poetry
ENV PATH $POETRY_HOME/bin:$VIRTUAL_ENV/bin:$PATH

COPY --from=build /app /app
COPY src src

WORKDIR /app/src

CMD ["poetry", "run", "python", "server.py"]