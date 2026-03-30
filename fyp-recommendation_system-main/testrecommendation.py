import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from gensim.models import Word2Vec
from sklearn.decomposition import NMF
from datetime import datetime

# Hypothetical user browsing data
data_browse = {
    'User_ID': [1, 2, 1, 3, 2, 1, 4, 4, 3],
    'Item_ID': [101, 101, 102, 103, 104, 105, 108, 103, 105],
    'Browse_Time': [5, 3, 2, 6, 2, 4, 3, 7, 5],
    'Browse_Date': ['2023-01-01', '2023-01-02', '2023-01-02', '2023-01-03', '2023-01-03', '2023-01-04', '2024-03-04', '2024-03-05', '2024-03-06']
}

# Hypothetical user item collection data
data_collect = {
    'User_ID': [1, 1, 2, 3, 3, 4 ,5],
    'Item_ID': [105, 103, 102, 104, 101, 103,109],
    'Collect_Time': [10, 10, 10, 10, 10, 10,10]
}

# Hypothetical item metadata
data_item_meta = {
    'Item_ID': [101, 102, 103, 104, 105, 106, 107, 108,109],
    'Category': ['Electronics', 'Electronics', 'Furniture', 'Clothing', 'Furniture', 'Furniture', 'Furniture', 'Furniture','Clothing'],
    'Description': [
        'Smartphone Android 5G 128GB',
        'Tablet 10.1 inch 64GB WiFi',
        'Leather Sofa 3 Seater Modern',
        'Men T-Shirt Cotton Loose Casual',
        'Wooden Dining Table 4 People Nordic',
        'Leather Sofa 3 Sea',
        'yo yoy yo on9',
        'Sofa Seater Modern',
        'this is a clothing item'
    ]
}

df_browse = pd.DataFrame(data_browse)
df_collect = pd.DataFrame(data_collect)
df_item_meta = pd.DataFrame(data_item_meta)

print(df_browse)



# Merge browsing and collecting data, and use total time as interaction strength
df_all_interactions = pd.concat([df_browse[['User_ID', 'Item_ID', 'Browse_Time', 'Browse_Date']],
                                 df_collect.rename(columns={'Collect_Time': 'Browse_Time'})], ignore_index=True)

# Set the time decay factor
time_decay_factor = 0.8

# Convert 'Browse_Date' column to datetime type
df_all_interactions['Browse_Date'] = pd.to_datetime(df_all_interactions['Browse_Date'])

# Calculate the difference between interaction time and the most recent date (in days)
max_date = df_all_interactions['Browse_Date'].max()
df_all_interactions['Days_Since_Last_Interaction'] = (max_date - df_all_interactions['Browse_Date']).dt.days

# Apply the time decay factor
df_all_interactions['Decayed_Browse_Time'] = df_all_interactions['Browse_Time'] * time_decay_factor ** df_all_interactions['Days_Since_Last_Interaction']

# Calculate the total decayed interaction time for each user-item pair
user_item_interaction = df_all_interactions.groupby(['User_ID', 'Item_ID'])['Decayed_Browse_Time'].sum().unstack(fill_value=0)

# Train a Word2Vec model on the item descriptions
description_tokens = [description.split() for description in df_item_meta['Description']]
w2v_model = Word2Vec(description_tokens, vector_size=50, window=5, min_count=1, workers=4)

# Create item features using Word2Vec embeddings
item_features = np.array([np.mean([w2v_model.wv[word] for word in description.split() if word in w2v_model.wv], axis=0)
                          for description in df_item_meta['Description']])

# Apply SVD to reduce the dimensionality of item features
svd = TruncatedSVD(n_components=10)
item_features_reduced = svd.fit_transform(item_features)
item_feature_similarity = cosine_similarity(item_features_reduced)
item_feature_similarity_df = pd.DataFrame(item_feature_similarity, index=df_item_meta['Item_ID'], columns=df_item_meta['Item_ID'])

# Train the matrix factorization model using NMF
model = NMF(n_components=10, init='random', random_state=0)
user_factors = model.fit_transform(user_item_interaction)
item_factors = model.components_

# Get the item IDs from the user-item interaction matrix
item_ids = user_item_interaction.columns

# Calculate the item-item similarity matrix based on the learned item embeddings
item_similarity_mf = cosine_similarity(item_factors.T)
item_similarity_mf_df = pd.DataFrame(item_similarity_mf, index=item_ids, columns=item_ids)

# Combine the item similarities from matrix factorization and content-based filtering
common_item_ids = item_similarity_mf_df.index.intersection(item_feature_similarity_df.index)
item_similarity_combined = (item_similarity_mf_df.loc[common_item_ids, common_item_ids] +
                            item_feature_similarity_df.loc[common_item_ids, common_item_ids]) / 2

def get_item_recommendations(user_id, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta, top_n=5, similarity_threshold=0.8, content_weight=0.5):
    interacted_items = user_item_interaction.loc[user_id][user_item_interaction.loc[user_id] > 0].index
    similar_items = item_similarity_combined.loc[interacted_items].sum()

    # Find items that are content-wise similar to the user's interacted items
    content_similar_items = item_feature_similarity_df.loc[interacted_items].max() > similarity_threshold
    content_similar_items = content_similar_items[content_similar_items].index

    # Add content-similar items to similar_items with their similarity scores
    for item in content_similar_items:
        if item not in similar_items.index:
            max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
            similar_items = similar_items.append(pd.Series(max_similarity, index=[item]))

    # Include all item IDs from the item metadata
    all_item_ids = df_item_meta['Item_ID']
    missing_item_ids = all_item_ids[~all_item_ids.isin(similar_items.index)]

    # Assign content-based similarity scores to missing items
    for item in missing_item_ids:
        max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
        similar_items = similar_items.append(pd.Series(max_similarity * content_weight, index=[item]))

    similar_items = similar_items.sort_values(ascending=False)
    recommendations = similar_items.loc[~similar_items.index.isin(interacted_items)]

    return recommendations.head(top_n)


# Generate recommendations for user ID 3
recommendations = get_item_recommendations(5, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta)
print("Recommended item IDs and their similarity scores for user ID 3:\n",recommendations)



def get_item_recommendations_cold_start(user_id, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta, top_n=10, similarity_threshold=0.8, content_weight=0.5):
    if user_id in user_item_interaction.index:
        interacted_items = user_item_interaction.loc[user_id][user_item_interaction.loc[user_id] > 0].index
    else:
        interacted_items = []

    if len(interacted_items) > 0:
        similar_items = item_similarity_combined.loc[interacted_items].sum()
    else:
        similar_items = pd.Series(dtype='float64')

    # Find items that are content-wise similar to the user's interacted items
    if len(interacted_items) > 0:
        content_similar_items = item_feature_similarity_df.loc[interacted_items].max() > similarity_threshold
        content_similar_items = content_similar_items[content_similar_items].index
    else:
        content_similar_items = []

    # Add content-similar items to similar_items with their similarity scores
    for item in content_similar_items:
        if item not in similar_items.index:
            max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
            similar_items = similar_items.append(pd.Series(max_similarity, index=[item]))

    # Include all item IDs from the item metadata
    all_item_ids = df_item_meta['Item_ID']
    missing_item_ids = all_item_ids[~all_item_ids.isin(similar_items.index)]

    # Assign content-based similarity scores to missing items
    for item in missing_item_ids:
        if len(interacted_items) > 0:
            max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
        else:
            # If the user has no interaction history, use the average similarity score
            max_similarity = item_feature_similarity_df[item].mean()
        similar_items = similar_items.append(pd.Series(max_similarity * content_weight, index=[item]))

    similar_items = similar_items.sort_values(ascending=False)
    recommendations = similar_items.loc[~similar_items.index.isin(interacted_items)]

    return recommendations.head(top_n)

# Generate recommendations for a new user ID 5 (cold start)
recommendations_cold_start = get_item_recommendations_cold_start(5, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta)
print("Recommended item IDs and their similarity scores for new user ID 5 (cold start):\n", recommendations_cold_start)