.PHONY: help install install-dev test test-unit test-integration test-contract lint format clean

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install production dependencies
	pip install -r requirements.txt

install-dev: install ## Install development dependencies
	pip install -r requirements-dev.txt

test: ## Run all tests
	pytest

test-unit: ## Run unit tests only
	pytest -m unit

test-integration: ## Run integration tests only
	pytest -m integration

test-contract: ## Run contract tests (OpenAPI validation)
	pytest -m contract app/tests/contract/

test-contract-verbose: ## Run contract tests with verbose output
	pytest -v -s -m contract app/tests/contract/

lint: ## Run linters
	ruff check app/
	mypy app/

format: ## Format code with black
	black app/
	ruff check --fix app/

clean: ## Clean up generated files
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache .coverage htmlcov
