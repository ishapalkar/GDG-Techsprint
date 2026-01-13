#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install setuptools==69.5.1 wheel

export PIP_NO_BUILD_ISOLATION=1
export PIP_ONLY_BINARY=:all:

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput