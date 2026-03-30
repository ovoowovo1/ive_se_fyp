import requests
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from gensim.models import Word2Vec
from sklearn.decomposition import NMF
from datetime import datetime
from flask import Blueprint, jsonify, request
import json


url = 'http://localhost:8081/getRecommendationData'


recommendation_blueprint = Blueprint('recommendation', __name__)

@recommendation_blueprint.route('/recommendation', methods=['GET'])
def recommendation():
    user_id = request.args.get('userID')
    df_browse, df_collect, df_item_meta = get_Database_Data()
    if df_browse is None or df_collect is None or df_item_meta is None:
        print('Error: Some dataframes are None')
        return jsonify({'error': 'Some dataframes are None'}), 500
    
    recommendation_item_data = toHandleData(df_browse, df_collect, df_item_meta ,user_id)

    return jsonify(recommendation_item_data), 200


def get_Database_Data():
    try:
        response = requests.get(url)
    
        if response.status_code == 200:
            data = response.json()

            try:
                df_browse = pd.DataFrame(data['browse'])
                df_browse = df_browse.drop(columns=['ID'])
                df_browse = df_browse.rename(columns={'Donation_Item_ID': 'Item_ID'})
                df_browse['Browse_Date'] = pd.to_datetime(df_browse['Browse_Date'], utc=True).dt.tz_convert('Asia/Taipei').dt.date
                #print(df_browse)
            except KeyError as e:
                print(f"Error processing 'browse' data: {str(e)}")
                None


            try:
                df_collect = pd.DataFrame(data['collect'])
                df_collect = df_collect.rename(columns={'Donate_ID': 'Item_ID'})
                if 'User_collectID' in df_collect.columns:
                    df_collect = df_collect.drop(columns=['User_collectID'])
                df_collect['Collect_Time'] = 200
                #print(df_collect)
            except KeyError as e:
                print(f"Error processing 'collect' data: {str(e)}")
                df_collect = None

            try:
                df_item_meta = pd.DataFrame(data['donate'])
                df_item_meta = df_item_meta.rename(columns={'Donate_Item_ID': 'Item_ID'})
                df_item_meta = df_item_meta.rename(columns={'Donate_Item_type': 'Category'})
                df_item_meta = df_item_meta.rename(columns={'Donate_Item_Describe': 'Description'})
                #print(df_item_meta)
            except KeyError as e:
                print(f"Error processing 'donate' data: {str(e)}")
                df_item_meta = None
            
            return df_browse, df_collect, df_item_meta

        else:
            print('Failed to get data from the API')
            return None, None, None
    except requests.exceptions.RequestException as e:
        print(f'An error occurred while getting data from the API: {str(e)}')
        return None, None, None
    

'''
df_browse, df_collect, df_item_meta = get_Database_Data()


#check none if have none return json error
if df_browse is None or df_collect is None or df_item_meta is None:
    print('Error: Some dataframes are None')
    
print(df_browse)
'''



def toHandleData( df_browse, df_collect, df_item_meta , request_user_id):

    df_all_interactions = pd.concat([df_browse[['User_ID', 'Item_ID', 'Browse_Time', 'Browse_Date']],
                                    df_collect.rename(columns={'Collect_Time': 'Browse_Time'})], ignore_index=True)

    time_decay_factor = 0.8


    df_all_interactions['Browse_Date'] = pd.to_datetime(df_all_interactions['Browse_Date'])

 
    max_date = df_all_interactions['Browse_Date'].max()
    df_all_interactions['Days_Since_Last_Interaction'] = (max_date - df_all_interactions['Browse_Date']).dt.days

    df_all_interactions['Decayed_Browse_Time'] = df_all_interactions['Browse_Time'] * time_decay_factor ** df_all_interactions['Days_Since_Last_Interaction']
    user_item_interaction = df_all_interactions.groupby(['User_ID', 'Item_ID'])['Decayed_Browse_Time'].sum().unstack(fill_value=0)


    description_tokens = [description.split() for description in df_item_meta['Description']]
    w2v_model = Word2Vec(description_tokens, vector_size=50, window=5, min_count=1, workers=4)


    item_features = np.array([np.mean([w2v_model.wv[word] for word in description.split() if word in w2v_model.wv], axis=0)
                            for description in df_item_meta['Description']])


    svd = TruncatedSVD(n_components=10)
    item_features_reduced = svd.fit_transform(item_features)
    item_feature_similarity = cosine_similarity(item_features_reduced)
    item_feature_similarity_df = pd.DataFrame(item_feature_similarity, index=df_item_meta['Item_ID'], columns=df_item_meta['Item_ID'])

    model = NMF(n_components=10, init='random', random_state=0)
    user_factors = model.fit_transform(user_item_interaction)
    item_factors = model.components_


    item_ids = user_item_interaction.columns


    item_similarity_mf = cosine_similarity(item_factors.T)
    item_similarity_mf_df = pd.DataFrame(item_similarity_mf, index=item_ids, columns=item_ids)

   
    common_item_ids = item_similarity_mf_df.index.intersection(item_feature_similarity_df.index)
    item_similarity_combined = (item_similarity_mf_df.loc[common_item_ids, common_item_ids] +
                                item_feature_similarity_df.loc[common_item_ids, common_item_ids]) / 2
    
    
    recommendations = get_item_recommendations(request_user_id, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta)
    print("just testing :\n" , recommendations )
    if recommendations is not None and recommendations.notnull().all().all():
        print("Recommended item IDs and their similarity scores for user ID :\n",recommendations)
        recommendation_item_data = recommendations.to_dict()
        return json.dumps(recommendation_item_data)
    else:
        print("Nedd to use cold start method to get recommendation for user (cold start)")
       
        recommendations_cold_start = get_item_recommendations_cold_start(request_user_id, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta)
        print("Recommended item IDs and their similarity scores for new user ID  (cold start):\n", recommendations_cold_start)
        recommendation_item_data = recommendations_cold_start.to_dict()
        return json.dumps(recommendation_item_data)
   
    


def get_item_recommendations(user_id, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta, top_n=5, similarity_threshold=0.8, content_weight=0.5):
    try:
        interacted_items = user_item_interaction.loc[user_id][user_item_interaction.loc[user_id] > 0].index
        similar_items = item_similarity_combined.loc[interacted_items].sum()

        
        content_similar_items = item_feature_similarity_df.loc[interacted_items].max() > similarity_threshold
        content_similar_items = content_similar_items[content_similar_items].index

        
        for item in content_similar_items:
            if item not in similar_items.index:
                max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
                similar_items = similar_items.append(pd.Series(max_similarity, index=[item]))

        
        all_item_ids = df_item_meta['Item_ID']
        missing_item_ids = all_item_ids[~all_item_ids.isin(similar_items.index)]

        
        for item in missing_item_ids:
            max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
            similar_items = similar_items.append(pd.Series(max_similarity * content_weight, index=[item]))

        similar_items = similar_items.sort_values(ascending=False)
        recommendations = similar_items.loc[~similar_items.index.isin(interacted_items)]

        return recommendations.head(top_n)
    except KeyError as e:
        print(f"Error getting item recommendations: {str(e)}")
        return None




def get_item_recommendations_cold_start(user_id, user_item_interaction, item_similarity_combined, item_feature_similarity_df, df_item_meta, top_n=20, similarity_threshold=0.8, content_weight=0.5):
    if user_id in user_item_interaction.index:
        interacted_items = user_item_interaction.loc[user_id][user_item_interaction.loc[user_id] > 0].index
    else:
        interacted_items = []

    if len(interacted_items) > 0:
        similar_items = item_similarity_combined.loc[interacted_items].sum()
    else:
        similar_items = pd.Series(dtype='float64')

    
    if len(interacted_items) > 0:
        content_similar_items = item_feature_similarity_df.loc[interacted_items].max() > similarity_threshold
        content_similar_items = content_similar_items[content_similar_items].index
    else:
        content_similar_items = []

    
    for item in content_similar_items:
        if item not in similar_items.index:
            max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
            similar_items = similar_items.append(pd.Series(max_similarity, index=[item]))

   
    all_item_ids = df_item_meta['Item_ID']
    missing_item_ids = all_item_ids[~all_item_ids.isin(similar_items.index)]

    
    for item in missing_item_ids:
        if len(interacted_items) > 0:
            max_similarity = item_feature_similarity_df.loc[interacted_items, item].max()
        else:
            
            max_similarity = item_feature_similarity_df[item].mean()
        similar_items = similar_items.append(pd.Series(max_similarity * content_weight, index=[item]))

    similar_items = similar_items.sort_values(ascending=False)
    recommendations = similar_items.loc[~similar_items.index.isin(interacted_items)]

    return recommendations.head(top_n)


