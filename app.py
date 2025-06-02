from flask import Flask, request, jsonify
import pandas as pd
from recommender import generate_recommendations_from_df

app = Flask(__name__)
songs_df = pd.read_csv("Spotify_Song_Attributes.csv")

@app.route('/recommend', methods=['POST'])
def recommend():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    try:
        listening_df = pd.read_json(file)
        recommendations, error = generate_recommendations_from_df(listening_df, songs_df)
        if error:
            return jsonify({'error': error}), 400
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return "Music Recommender API is live!"
