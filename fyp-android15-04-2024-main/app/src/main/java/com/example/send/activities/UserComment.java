package com.example.send.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RatingBar;
import android.widget.TextView;

import com.example.send.R;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.SetOptions;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.POST;

public class UserComment extends AppCompatActivity {
    private String apilink = "http://10.0.2.2:8081/";
    private String apilink2 = "http://10.0.2.2:5001/";

    //private String apilink = "http://192.168.137.1:8081/";
    //private String apilink2 = "http://192.168.137.1:5001/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_comment);

        // Assuming PreferenceManager is a utility class that wraps SharedPreferences
        PreferenceManager preferenceManager = new PreferenceManager(getApplicationContext());
        String currentUserId = preferenceManager.getString(Constants.KEY_USER_ID);

        // Retrieve the donateId and receiverId passed from the previous activity
        String donateId = getIntent().getStringExtra("donateId");
        String receiverId = getIntent().getStringExtra("receiverId");

        TextView tvUsername = findViewById(R.id.tvUsername);
        tvUsername.setText("To " + receiverId); // Set the TextView to show the receiverId


        EditText etComment = findViewById(R.id.etComment);
        RatingBar ratingBar = findViewById(R.id.ratingBar);
        Button btnSubmit = findViewById(R.id.btnSubmit);

        // Now you have currentUserId, donateId, and receiverId to use as needed
        Log.d("UserComment", "currentUserId: " + currentUserId + ", donateId: " + donateId + ", receiverId: " + receiverId);

        btnSubmit.setOnClickListener(v -> {
            String commentText = etComment.getText().toString();
            float rating = ratingBar.getRating();
            submitComment(donateId, receiverId, commentText, rating);
        });



    }

    private void submitComment(String donateId, String receiverId, String commentText, float rating) {
        PreferenceManager preferenceManager = new PreferenceManager(getApplicationContext());
        String currentUserId = preferenceManager.getString(Constants.KEY_USER_ID);

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // Use the actual API link variable
                .addConverterFactory(GsonConverterFactory.create())
                .build();


        ApiService apiService = retrofit.create(ApiService.class);
        CommentModel comment = new CommentModel(donateId, "donation", currentUserId, receiverId, commentText, rating);

        apiService.submitComment(comment).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    // Handle success
                    Log.d("SubmitComment", "Comment submitted successfully");
                    sendToFirebaseMarkCommented(donateId, currentUserId);
                    finish();
                } else {
                    // Handle request error
                    Log.e("SubmitComment", "Submission failed: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                // Handle failure
                Log.e("SubmitComment", "Network error: " + t.getMessage());
            }
        });
    }

    public interface ApiService {
        @POST("/api/submitComment")
        Call<Void> submitComment(@Body CommentModel comment);
    }

    public class CommentModel {
        private String donateID;
        private String type;
        private String senderID;
        private String receiverID;
        private String commentText;
        private float rating;

        // Constructor
        public CommentModel(String donateID, String type, String senderID, String receiverID, String commentText, float rating) {
            this.donateID = donateID;
            this.type = type;
            this.senderID = senderID;
            this.receiverID = receiverID;
            this.commentText = commentText;
            this.rating = rating;
        }

        // Getters and Setters

        public String getDonateID() {
            return donateID;
        }

        public void setDonateID(String donateID) {
            this.donateID = donateID;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getSenderID() {
            return senderID;
        }

        public void setSenderID(String senderID) {
            this.senderID = senderID;
        }

        public String getReceiverID() {
            return receiverID;
        }

        public void setReceiverID(String receiverID) {
            this.receiverID = receiverID;
        }

        public String getCommentText() {
            return commentText;
        }

        public void setCommentText(String commentText) {
            this.commentText = commentText;
        }

        public float getRating() {
            return rating;
        }

        public void setRating(float rating) {
            this.rating = rating;
        }
    }



    private void sendToFirebaseMarkCommented(String donateId, String userID) {

            FirebaseFirestore db = FirebaseFirestore.getInstance();
            DocumentReference docRef = db.collection("commentStatus").document(donateId);

            // Update the current user's completion status to true
            Map<String, Object> updates = new HashMap<>();
            updates.put(userID, true);

            docRef.set(updates, SetOptions.merge())
                    .addOnSuccessListener(aVoid -> {
                        Log.d("FirestoreComment", "DocumentSnapshot successfully written!");

                    })
                    .addOnFailureListener(e -> Log.w("FirestoreComment", "Error writing document", e));
        }


}