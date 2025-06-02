# recommender.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors

def generate_recommendations_from_df(listening, songs):
    songs = songs.dropna()

    for df in [listening, songs]:
        df['trackName'] = df['trackName'].str.strip().str.lower()
        df['artistName'] = df['artistName'].str.strip().str.lower()

    merged_df = pd.merge(listening, songs, how='inner', on=['trackName', 'artistName'])
    if merged_df.empty:
        return [], "No matching tracks found."

    features = songs[['energy', 'acousticness', 'valence']]
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    kmeans_4 = KMeans(n_clusters=4, n_init=10, max_iter=300, random_state=42)
    songs['cluster'] = kmeans_4.fit_predict(features_scaled)

    cluster_to_mood = {
        0: 'happy',
        1: 'calm',
        2: 'angry',
        3: 'sad'
    }
    songs['mood'] = songs['cluster'].map(cluster_to_mood)

    mood_counts = songs['mood'].value_counts()
    major_mood = mood_counts.idxmax()

    mood_transition_map = {
        'angry': 'calm',
        'sad': 'happy',
        'happy': 'happy',
        'calm': 'calm'
    }

    source_mood = major_mood
    target_mood = mood_transition_map.get(source_mood, 'calm')

    source_vector = songs[songs['mood'] == source_mood][['energy', 'acousticness', 'valence']].mean().values.reshape(1, -1)
    source_vector_scaled = scaler.transform(source_vector)

    target_songs = songs[songs['mood'] == target_mood]
    if target_songs.empty:
        return [], f"No songs found for mood: {target_mood}"

    target_features_scaled = scaler.transform(target_songs[['energy', 'acousticness', 'valence']])
    knn = NearestNeighbors(n_neighbors=5)
    knn.fit(target_features_scaled)

    distances, indices = knn.kneighbors(source_vector_scaled)
    recommended_songs = target_songs.iloc[indices[0]]

    return recommended_songs[['trackName', 'artistName', 'energy', 'acousticness', 'valence']].to_dict(orient='records'), None
