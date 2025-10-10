.PHONY: help bootstrap dev test lint fmt clean up down

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Set up development environment
	@echo "Setting up development environment..."
	python3 -m venv .venv
	.venv/bin/pip install --upgrade pip setuptools wheel
	.venv/bin/pip install -r requirements.txt
	.venv/bin/pre-commit install
	@echo "Development environment ready!"

dev: ## Start development server
	@echo "Starting development server..."
	.venv/bin/python src/app.py

test: ## Run tests
	@echo "Running tests..."
	.venv/bin/python -m pytest tests/ -v --cov=src --cov-report=term-missing

test-watch: ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	.venv/bin/python -m pytest tests/ -v --cov=src -f

lint: ## Run linting
	@echo "Running linting..."
	.venv/bin/ruff check src/ tests/
	.venv/bin/mypy src/

fmt: ## Format code
	@echo "Formatting code..."
	.venv/bin/black src/ tests/
	.venv/bin/isort src/ tests/
	.venv/bin/ruff format src/ tests/

fmt-check: ## Check code formatting
	@echo "Checking code formatting..."
	.venv/bin/black --check src/ tests/
	.venv/bin/isort --check-only src/ tests/
	.venv/bin/ruff format --check src/ tests/

pre-commit: ## Run pre-commit on all files
	@echo "Running pre-commit..."
	.venv/bin/pre-commit run --all-files

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

install: ## Install dependencies
	@echo "Installing dependencies..."
	.venv/bin/pip install -r requirements.txt

update: ## Update dependencies
	@echo "Updating dependencies..."
	.venv/bin/pip-compile requirements.in
	.venv/bin/pip-sync requirements.txt

check: test lint fmt-check ## Run all checks

ci: ## Run CI checks locally
	@echo "Running CI checks..."
	$(MAKE) pre-commit
	$(MAKE) test
	$(MAKE) lint
