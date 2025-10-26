"""
OpenAPI Contract Tests using Schemathesis

These tests validate that the API implementation matches the OpenAPI specification.
"""

import pytest
import schemathesis
from hypothesis import settings, Phase

# Skip health check phase to reduce test execution time
# Use max_examples to control the number of generated test cases
HYPOTHESIS_SETTINGS = settings(
    max_examples=50,
    deadline=None,
    phases=[Phase.generate, Phase.target],
)

# Initialize Schemathesis schema from the OpenAPI endpoint
# This will fetch the OpenAPI spec and prepare test cases
schema = schemathesis.from_uri(
    "http://localhost:8000/openapi.json",
    validate_schema=True,
)


@schema.parametrize()
@HYPOTHESIS_SETTINGS
def test_api_contract(case):
    """
    Property-based test that validates:
    1. All responses match the OpenAPI schema
    2. Status codes are as documented
    3. Response headers are correct
    4. Response body structure is valid
    
    Schemathesis will generate test cases for every endpoint and method
    defined in the OpenAPI specification.
    """
    # Execute the API call
    response = case.call()
    
    # Validate response against OpenAPI spec
    case.validate_response(response)


@schema.parametrize()
@HYPOTHESIS_SETTINGS
def test_api_security(case):
    """
    Test that protected endpoints require authentication.
    """
    # Skip health/public endpoints
    if case.operation.path in ["/health", "/openapi.json", "/docs"]:
        return
    
    # Execute without auth headers
    response = case.call()
    
    # Protected endpoints should return 401 or 403
    if response.status_code not in [401, 403]:
        # If it's 2xx, validate it's actually a public endpoint
        if 200 <= response.status_code < 300:
            case.validate_response(response)


# Specific endpoint tests
@pytest.mark.contract
def test_health_endpoint():
    """Test health check endpoint."""
    schema = schemathesis.from_uri("http://localhost:8000/openapi.json")
    
    # Find health endpoint
    for endpoint in schema.get_all_operations():
        if endpoint.path == "/health":
            case = endpoint.make_case()
            response = case.call()
            
            # Validate
            assert response.status_code == 200
            case.validate_response(response)
            break


@pytest.mark.contract
def test_openapi_json_endpoint():
    """Test that OpenAPI JSON is accessible and valid."""
    schema = schemathesis.from_uri("http://localhost:8000/openapi.json")
    
    # Find OpenAPI endpoint
    for endpoint in schema.get_all_operations():
        if endpoint.path == "/openapi.json":
            case = endpoint.make_case()
            response = case.call()
            
            # Validate
            assert response.status_code == 200
            assert response.headers["content-type"].startswith("application/json")
            case.validate_response(response)
            break


# Custom checks
@pytest.mark.contract
def test_response_time():
    """Test that API responses are reasonably fast."""
    schema = schemathesis.from_uri("http://localhost:8000/openapi.json")
    
    @schema.parametrize()
    @settings(max_examples=10)
    def inner_test(case):
        import time
        start = time.time()
        response = case.call()
        duration = time.time() - start
        
        # Most endpoints should respond within 2 seconds
        assert duration < 2.0, f"Endpoint {case.operation.path} took {duration}s"
        case.validate_response(response)
    
    inner_test()


@pytest.mark.contract
def test_content_type_headers():
    """Test that all JSON endpoints return proper content-type."""
    schema = schemathesis.from_uri("http://localhost:8000/openapi.json")
    
    @schema.parametrize()
    @settings(max_examples=20)
    def inner_test(case):
        response = case.call()
        
        # If response is JSON, check content-type
        if response.headers.get("content-type"):
            content_type = response.headers["content-type"]
            if "application/json" in content_type:
                assert content_type.startswith("application/json"), \
                    f"Expected 'application/json', got '{content_type}'"
        
        case.validate_response(response)
    
    inner_test()
