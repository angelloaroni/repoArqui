# Windows without make: run the same commands by hand (see README).
PY ?= python

up:
	docker compose up -d --build

down:
	docker compose down

clean:
	docker compose down -v

health:
	$(PY) scripts/healthcheck.py --wait 90

demo:
	$(PY) scripts/demo_01_happy_path.py

demo-all:
	sh scripts/demo-all.sh

reset:
	$(PY) scripts/reset_demo.py

logs:
	docker compose logs -f booking-api outbox-relay crm-consumer notification-consumer analytics-consumer

install-dev:
	$(PY) -m pip install -r requirements-dev.txt

lint:
	ruff check .

test:
	$(PY) -m pytest
