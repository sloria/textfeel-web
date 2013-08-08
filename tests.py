import os
from flask import json
import run
import unittest
try:
    from nose.tools import *  # PEP8 asserts
except ImportError:
    import sys
    print("nose required.")
    sys.exit(1)

class TestTextfeelAPI(unittest.TestCase):

    def setUp(self):
        run.app.config['TESTING'] = True
        self.app = run.app.test_client()

    def test_get_sentiment(self):
        payload = {"text": "Wow! What an amazing feeling!!"}
        r = self.json_post("/api/sentiment", payload)
        rdata = json_response(r)
        assert_in('result', rdata)
        assert_true(rdata['result'] > 0.0)

    def test_noun_phrases(self):
        payload = {"text": "Jesus wept."}
        r = self.json_post("/api/noun_phrases", payload)
        rdata = json_response(r)
        assert_in('result', rdata)
        assert_equal(rdata['result'], ['jesus'])

    def json_post(self, url, data):
        return self.app.post(url, data=json.dumps(data),
            headers={"Content-Type": 'application/json'})

def json_response(response, code=200):
    # Checks that the status code is OK and returns the json
    assert_equal(response.status_code, code)
    return json.loads(response.data)

if __name__ == '__main__':
    unittest.main()


