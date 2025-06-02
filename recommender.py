# recommender.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors

# Persona mapping
cluster_map = {
    0: {"mood":"Angry", "label":"Intense, emotional, dark",
        "persona":"The Firestorm", "prompt":"Try something calmer?"},
    1: {"mood":"Calm", "label":"Relaxed, acoustic, cheerful",
        "persona":"The Chill Wave", "prompt":"Keep riding this good vibe!"},
    2: {"mood":"Sad", "label":"Soft, acoustic, melancholic",
        "persona":"The Blue Horizon", "prompt":"Want a bit more brightness?"},
    3: {"mood":"Happy", "label":"Energetic, synthetic, joyful",
        "persona":"The Sunburst", "prompt":"Keep that energy up!"}
}

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

    # Apply KMeans clustering
    kmeans_4 = KMeans(n_clusters=4, n_init=10, max_iter=300, random_state=42)
    songs['cluster'] = kmeans_4.fit_predict(features_scaled)

    # Assign clusters to user's listening history
    merged_with_cluster = pd.merge(merged_df, songs[['trackName', 'artistName', 'cluster']], on=['trackName', 'artistName'])
    cluster_counts = merged_with_cluster['cluster'].value_counts()
    if cluster_counts.empty:
        return [], "Could not determine user's dominant cluster."

    # Get dominant and second-most cluster
    top_clusters = cluster_counts.head(2).to_dict()
    dominant_cluster = list(top_clusters.keys())[0]
    dominant_count = top_clusters[dominant_cluster]
    second_cluster = list(top_clusters.keys())[1] if len(top_clusters) > 1 else None
    second_count = top_clusters[second_cluster] if second_cluster is not None else 0

    # Persona info
    persona_info = cluster_map.get(dominant_cluster, {})
    second_mood = cluster_map.get(second_cluster, {}).get("mood", "N/A") if second_cluster is not None else "N/A"

    # Format persona message
    persona_message = (
        f"{persona_info.get('persona')}\n"
        f"Your major mood is \"{persona_info.get('mood')}\"\n"
        f"(You mostly listened to {persona_info.get('mood')} [{dominant_count} songs] "
        f"and {second_mood} [{second_count} songs])\n"
        f"You have been listening to \"{persona_info.get('label')}\"\n"
        f"{persona_info.get('prompt')}"
    )

    # Transition logic
    transition_map = {
        0: 1,  # Angry -> Calm
        2: 3,  # Sad -> Happy
        3: 3,  # Happy -> Happy
        1: 1   # Calm -> Calm
    }
    target_cluster = transition_map.get(dominant_cluster, 1)

    # Get source vector
    source_vector = songs[songs['cluster'] == dominant_cluster][['energy', 'acousticness', 'valence']].mean().values.reshape(1, -1)
    source_vector_scaled = scaler.transform(source_vector)

    # Target songs for recommendation
    target_songs = songs[songs['cluster'] == target_cluster]
    if target_songs.empty:
        return [], f"No songs found for target mood cluster: {target_cluster}"

    target_features_scaled = scaler.transform(target_songs[['energy', 'acousticness', 'valence']])
    knn = NearestNeighbors(n_neighbors=5)
    knn.fit(target_features_scaled)

    distances, indices = knn.kneighbors(source_vector_scaled)
    recommended_songs = target_songs.iloc[indices[0]]

    return {
        "persona": persona_message,
        "recommendations": recommended_songs[['trackName', 'artistName', 'energy', 'acousticness', 'valence']].to_dict(orient='records')
    }, None
