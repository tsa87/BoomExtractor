#!/usr/bin/env python3
"""
Test script for the workflow backend API
"""
import requests
import json
import os
import sys
from pathlib import Path

# Backend URL
BASE_URL = "http://localhost:8000"


def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False


def test_pdf_upload(pdf_path):
    """Test PDF upload endpoint"""
    print(f"\n📄 Testing PDF upload with: {pdf_path}")

    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return False

    try:
        with open(pdf_path, 'rb') as f:
            files = {
                'file': (os.path.basename(pdf_path), f, 'application/pdf')
            }

            print(
                f"📤 Uploading {os.path.basename(pdf_path)} ({os.path.getsize(pdf_path)} bytes)..."
            )
            response = requests.post(f"{BASE_URL}/api/upload", files=files)

            print(f"Status Code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")

            try:
                result = response.json()
                print(f"Response JSON:")
                print(json.dumps(result, indent=2))

                if response.status_code == 200 and result.get('success'):
                    print("✅ Upload successful!")
                    if 'workflow' in result:
                        workflow = result['workflow']
                        print(f"\n🧬 Workflow Generated:")
                        print(f"  - Stages: {len(workflow.get('stages', {}))}")
                        print(f"  - Steps: {len(workflow.get('steps', {}))}")
                        print(
                            f"  - Stage Edges: {len(workflow.get('stageEdges', []))}"
                        )
                        print(
                            f"  - Step Edges: {len(workflow.get('stepEdges', []))}"
                        )
                else:
                    print(
                        f"❌ Upload failed: {result.get('error', 'Unknown error')}"
                    )

            except json.JSONDecodeError:
                print(f"❌ Invalid JSON response: {response.text}")

        return response.status_code == 200

    except Exception as e:
        print(f"❌ Upload test failed: {e}")
        return False


def test_direct_workflow_generation():
    """Test workflow generation directly"""
    print(f"\n🧪 Testing direct workflow generation...")

    try:
        # Import and test the workflow generator directly
        sys.path.append(os.path.dirname(__file__))
        from app.services.workflow_generator import WorkflowGenerator

        # Find a test PDF
        pdf_path = "../example_paper.pdf"
        if not os.path.exists(pdf_path):
            print("❌ No test PDF found")
            return False

        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()

        generator = WorkflowGenerator()

        print(
            f"📄 Testing with {os.path.basename(pdf_path)} ({len(pdf_bytes)} bytes)"
        )

        # This is async, so we need to handle it properly
        import asyncio
        result = asyncio.run(
            generator.generate_workflow_from_pdf(pdf_bytes,
                                                 os.path.basename(pdf_path)))

        print(f"Direct Generation Result:")
        print(json.dumps(result, indent=2))

        return result.get('success', False)

    except Exception as e:
        print(f"❌ Direct generation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("🚀 Backend API Testing Suite")
    print("=" * 50)

    # Test 1: Health Check
    health_ok = test_health_endpoint()
    if not health_ok:
        print(
            "\n❌ Health check failed - make sure the backend server is running!"
        )
        print("Run: python -m app.main")
        return

    # Test 2: Find PDF file
    pdf_candidates = [
        "../example_paper.pdf", "../../example_paper.pdf",
        "/Users/tonyshen/Code/broadhacks/example_paper.pdf"
    ]

    pdf_path = None
    for candidate in pdf_candidates:
        if os.path.exists(candidate):
            pdf_path = candidate
            break

        upload_ok = False
    direct_ok = False

    if not pdf_path:
        print(f"\n⚠️  No test PDF found. Looked in:")
        for candidate in pdf_candidates:
            print(f"  - {candidate}")
        print("\nSkipping PDF upload test...")
    else:
        # Test 3: PDF Upload via API
        upload_ok = test_pdf_upload(pdf_path)

        # Test 4: Direct workflow generation (bypass API)
        direct_ok = test_direct_workflow_generation()

    print("\n" + "=" * 50)
    print("🏁 Test Summary:")
    print(f"  ✅ Health Check: {'PASS' if health_ok else 'FAIL'}")
    if pdf_path:
        print(f"  ✅ PDF Upload: {'PASS' if upload_ok else 'FAIL'}")
        print(f"  ✅ Direct Generation: {'PASS' if direct_ok else 'FAIL'}")
    else:
        print(f"  ⚠️  PDF tests skipped (no test file)")


if __name__ == "__main__":
    main()
