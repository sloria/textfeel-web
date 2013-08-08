#!/usr/bin/env python
from flask import Flask, jsonify, request, render_template, abort
from text.blob import TextBlob
from text.utils import strip_punc

app = Flask(__name__)

##### TextBlob API #####
@app.route("/api/sentiment", methods=['POST'])
def sentiment():
    text = get_text(request)
    sentiment = TextBlob(text).sentiment[0]  # Polarity score
    return jsonify({"result": sentiment})

@app.route("/api/noun_phrases", methods=['POST'])
def noun_phrases():
    text = get_text(request)
    noun_phrases = set(TextBlob(text).noun_phrases)
    # Strip punctuation from ends of noun phrases and exclude long phrases
    stripped = [strip_punc(np) for np in noun_phrases if len(np.split()) <= 5]
    return jsonify({"result": stripped})

@app.route("/api/sentiment/sentences", methods=['POST'])
def sentences_sentiment():
    text = get_text(request)
    blob = TextBlob(text)
    sentences = [{"sentence": str(s), "sentiment": s.sentiment[0]} for s in blob.sentences]
    return jsonify({"result": sentences})

def get_text(req):
    '''Get the text from the request.'''
    if req.form:
        return req.form['text']
    elif req.headers['Content-Type'] == 'application/json':
        return req.json['text']
    else:
        abort(404)

##### Views #####
@app.route("/index")
@app.route("/")
def home():
    return render_template("home.html")

if __name__ == '__main__':
    app.run(debug=True)
