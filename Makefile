.PHONY: help bootstrap dev test lint fmt clean up down

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Set up the legacy Python scaffold
	@echo "Setting up the legacy Python scaffold..."
	python3 -m venv .venv
	.venv/bin/pip install --upgrade pip setuptools wheel
	.venv/bin/pip install -e ".[dev]"
	.venv/bin/pre-commit install
	@echo "Development environment ready!"

dev: ## Start the legacy Python scaffold server
	@echo "Starting the legacy Python scaffold server..."
	.venv/bin/python src/app.py

test: ## Run legacy Python scaffold tests
	@echo "Running legacy Python scaffold tests..."
	.venv/bin/python -m pytest tests/ -v --cov=src --cov-report=term-missing

test-watch: ## Run legacy Python scaffold tests in watch mode
	@echo "Running legacy Python scaffold tests in watch mode..."
	.venv/bin/python -m pytest tests/ -v --cov=src -f

lint: ## Lint the legacy Python scaffold
	@echo "Linting the legacy Python scaffold..."
	.venv/bin/ruff check src/ tests/
	.venv/bin/mypy src/

fmt: ## Format the legacy Python scaffold
	@echo "Formatting the legacy Python scaffold..."
	.venv/bin/black src/ tests/
	.venv/bin/isort src/ tests/
	.venv/bin/ruff format src/ tests/

fmt-check: ## Check legacy Python scaffold formatting
	@echo "Checking legacy Python scaffold formatting..."
	.venv/bin/black --check src/ tests/
	.venv/bin/isort --check-only src/ tests/
	.venv/bin/ruff format --check src/ tests/

pre-commit: ## Run pre-commit on all files
	@echo "Running pre-commit..."
	PATH="$(CURDIR)/.venv/bin:$(PATH)" .venv/bin/pre-commit run --all-files

clean: ## Clean up temporary files
	@echo "Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .coverage htmlcov/ .pytest_cache/ .mypy_cache/

up: ## Start services with docker-compose
	@echo "Starting services..."
	docker-compose up -d

down: ## Stop services
	@echo "Stopping services..."
	docker-compose down

logs: ## Show service logs
	@echo "Showing service logs..."
	docker-compose logs -f

install: ## Install legacy Python scaffold dependencies
	@echo "Installing legacy Python scaffold dependencies..."
	.venv/bin/pip install -e ".[dev]"

update: ## Update legacy Python scaffold dependencies
	@echo "Updating legacy Python scaffold dependencies..."
	.venv/bin/pip install --upgrade -e ".[dev]"

check: test lint fmt-check ## Check the legacy Python scaffold

ci: ## Run CI checks locally
	@echo "Running CI checks..."
	$(MAKE) pre-commit
	$(MAKE) test
	$(MAKE) lint
