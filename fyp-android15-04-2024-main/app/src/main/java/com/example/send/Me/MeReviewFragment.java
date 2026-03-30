package com.example.send.Me;
import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RatingBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.send.R;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.material.button.MaterialButton;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;


import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import retrofit2.http.GET;
import retrofit2.http.Query;

public class MeReviewFragment extends Fragment {
    private RecyclerView reviewsRecyclerView;

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private PreferenceManager preferenceManager;
    private MaterialButton btnReviewAnother , btnReviewOther;

    private AboutAdapter aboutAdapter;

    private ReviewAdapter reviewAdapter;

    private String anotherUserId = null ;
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        if (getArguments() != null) {
            anotherUserId = getArguments().getString("userId");
            //showToast("Another User: " +  anotherUserId);
        }
        return inflater.inflate(R.layout.fragment_me_review, container, false);
    }

    @SuppressLint("ResourceType")
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        reviewsRecyclerView = view.findViewById(R.id.reviewsRecyclerView);
        btnReviewAnother = view.findViewById(R.id.btnReviewAnother);
        btnReviewOther = view.findViewById(R.id.btnReviewOther);
        preferenceManager = new PreferenceManager(getContext());

        btnReviewOther.setOnClickListener(v -> {
            btnReviewOther.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.e9e9e9));
            btnReviewOther.setTextColor(ContextCompat.getColor(requireContext(), R.color.black));

            btnReviewAnother.setBackgroundColor(ContextCompat.getColor(requireContext(), android.R.color.transparent));
            btnReviewAnother.setTextColor(ContextCompat.getColor(requireContext(), R.color.secondary_text));

            clearAdapter();
            loadUserAbout();
        });

        btnReviewAnother.setOnClickListener(v -> {
            btnReviewAnother.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.e9e9e9));
            btnReviewAnother.setTextColor(ContextCompat.getColor(requireContext(), R.color.black));

            btnReviewOther.setBackgroundColor(ContextCompat.getColor(requireContext(), android.R.color.transparent));
            btnReviewOther.setTextColor(ContextCompat.getColor(requireContext(), R.color.secondary_text));

            clearAdapter();
            initializeRetrofit();
        });

        btnReviewOther.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.e9e9e9));
        loadUserAbout();
    }

    private void initializeRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        ReviewApi api = retrofit.create(ReviewApi.class);

        if (anotherUserId != null) {
            loadUserReviews(api, anotherUserId);
        } else {
           String currentUserID = preferenceManager.getString(Constants.KEY_USER_ID);
            loadUserReviews(api, currentUserID);
        }

    }

    private void loadUserReviews(ReviewApi api, String userID) {
        api.getUserReviews(userID).enqueue(new Callback<List<Review>>() {
            @Override
            public void onResponse(Call<List<Review>> call, Response<List<Review>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    updateRecyclerView(response.body());
                } else {
                    Log.e("ReviewFragment", "Response unsuccessful: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<List<Review>> call, Throwable t) {
                Log.e("ReviewFragment", "API call failed: " + t.getMessage());
            }
        });
    }

    private void updateRecyclerView(List<Review> reviews) {
        if (reviews.isEmpty()) {
            Log.d("ReviewFragment", "Review list is empty");
        } else {
            reviewAdapter = new ReviewAdapter(reviews);
            reviewsRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
            reviewsRecyclerView.setAdapter( reviewAdapter);
        }
    }


    public class ReviewAdapter extends RecyclerView.Adapter<ReviewAdapter.ViewHolder> {
        private List<Review> reviews;
        // Updated to match the ISO 8601 format with milliseconds and the 'Z' timezone indicator
        private SimpleDateFormat originalFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        private SimpleDateFormat targetFormat = new SimpleDateFormat("yyyy-MM-dd");

        public ReviewAdapter(List<Review> reviews) {
            this.reviews = reviews;
            originalFormat.setTimeZone(TimeZone.getTimeZone("UTC")); // Ensure the parser expects UTC timezone ('Z')
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_comment, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            Review review = reviews.get(position);
            holder.commentUserID.setText("You");
            holder.commentText.setText(review.getCommentText());
            holder.commentRatingBar.setRating(review.getRating());

            try {
                Date date = originalFormat.parse(review.getCommentDate());
                holder.commentTimestamp.setText(targetFormat.format(date));
            } catch (ParseException e) {
                holder.commentTimestamp.setText("Invalid date"); // Fallback text
                Log.e("ReviewAdapter", "Failed to parse date: " + review.getCommentDate(), e);
            }

            String imageUrl = review.getUser_image();
            if (imageUrl != null && !imageUrl.isEmpty()) {
                Picasso.get().load(apilink + imageUrl.replace("\\", "/")).into(holder.imageProfile);
            } else {
                holder.imageProfile.setImageResource(R.drawable.people);
            }
        }

        @Override
        public int getItemCount() {
            return reviews.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView commentUserID, commentText, commentTimestamp;
            RatingBar commentRatingBar;
            RoundedImageView imageProfile;

            ViewHolder(View itemView) {
                super(itemView);
                imageProfile = itemView.findViewById(R.id.imageProfile);
                commentUserID = itemView.findViewById(R.id.commentUserID);
                commentText = itemView.findViewById(R.id.commentText);
                commentTimestamp = itemView.findViewById(R.id.commentTimestamp);
                commentRatingBar = itemView.findViewById(R.id.commentRatingBar);
            }
        }
    }



    public class Review {
        private String SenderID;
        private String CommentText;
        private String CommentDate;
        private float Rating;
        private String User_image;

        // Getters and setters
        public String getSenderID() {
            return SenderID;
        }

        public void setSenderID(String senderID) {
            SenderID = senderID;
        }

        public String getCommentText() {
            return CommentText;
        }

        public void setCommentText(String commentText) {
            CommentText = commentText;
        }

        public String getCommentDate() {
            return CommentDate;
        }

        public void setCommentDate(String commentDate) {
            CommentDate = commentDate;
        }

        public float getRating() {
            return Rating;
        }

        public void setRating(float rating) {
            Rating = rating;
        }

        public String getUser_image() {
            return User_image;
        }

        public void setUser_image(String user_image) {
            User_image = user_image;
        }
    }


    public interface ReviewApi {
        @GET("api/user-reviews")
        Call<List<Review>> getUserReviews(@Query("userID") String userID);
    }


    public class About {
        private String ReceiverID;

        private String SenderID;
        private String CommentText;
        private String CommentDate;
        private float Rating;
        private String User_image;

        public String getSenderID() {
            return SenderID;
        }

        public void setSenderID(String senderID) {
            SenderID = senderID;
        }

        public String getReceiverID() {
            return ReceiverID;
        }

        public void setReceiverID(String receiverID) {
            ReceiverID = receiverID;
        }

        public String getCommentText() {
            return CommentText;
        }

        public void setCommentText(String commentText) {
            CommentText = commentText;
        }

        public String getCommentDate() {
            return CommentDate;
        }

        public void setCommentDate(String commentDate) {
            CommentDate = commentDate;
        }

        public float getRating() {
            return Rating;
        }

        public void setRating(float rating) {
            Rating = rating;
        }

        public String getUser_image() {
            return User_image;
        }

        public void setUser_image(String user_image) {
            User_image = user_image;
        }
    }

    public interface AboutApi {
        @GET("api/user-about")
        Call<List<About>> getUserAbout(@Query("userID") String userID);
    }


    private void loadUserAbout() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        AboutApi api = retrofit.create(AboutApi.class);

        if(anotherUserId != null) {
            api.getUserAbout(anotherUserId).enqueue(new Callback<List<About>>() {
                @Override
                public void onResponse(Call<List<About>> call, Response<List<About>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        aboutAdapter = new AboutAdapter(response.body());
                        reviewsRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
                        reviewsRecyclerView.setAdapter(aboutAdapter);
                    } else {
                        Log.e("MeAboutFragment", "Response unsuccessful: " + response.message());
                    }
                }

                @Override
                public void onFailure(Call<List<About>> call, Throwable t) {
                    Log.e("MeAboutFragment", "API call failed: " + t.getMessage());
                }
            });
        }else{
            String currentUserID = preferenceManager.getString(Constants.KEY_USER_ID);

            api.getUserAbout(currentUserID).enqueue(new Callback<List<About>>() {
                @Override
                public void onResponse(Call<List<About>> call, Response<List<About>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        aboutAdapter = new AboutAdapter(response.body());
                        reviewsRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
                        reviewsRecyclerView.setAdapter(aboutAdapter);
                    } else {
                        Log.e("MeAboutFragment", "Response unsuccessful: " + response.message());
                    }
                }

                @Override
                public void onFailure(Call<List<About>> call, Throwable t) {
                    Log.e("MeAboutFragment", "API call failed: " + t.getMessage());
                }
            });
        }


    }

    public class AboutAdapter extends RecyclerView.Adapter<AboutAdapter.ViewHolder> {
        private List<About> abouts;
        private SimpleDateFormat originalFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        private SimpleDateFormat targetFormat = new SimpleDateFormat("yyyy-MM-dd");

        public AboutAdapter(List<About> abouts) {
            this.abouts = abouts;
            originalFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_comment, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            About about = abouts.get(position);
            holder.commentUserID.setText("User ID: " + about.getSenderID()); // Display ReceiverID
            holder.commentText.setText(about.getCommentText());
            holder.commentRatingBar.setRating(about.getRating());

            try {
                Date date = originalFormat.parse(about.getCommentDate());
                holder.commentTimestamp.setText(targetFormat.format(date));
            } catch (ParseException e) {
                holder.commentTimestamp.setText("Invalid date");
                Log.e("AboutAdapter", "Failed to parse date: " + about.getCommentDate(), e);
            }

            String imageUrl = about.getUser_image();
            if (imageUrl != null && !imageUrl.isEmpty()) {
                Picasso.get().load(apilink + imageUrl.replace("\\", "/")).into(holder.imageProfile);
            } else {
                holder.imageProfile.setImageResource(R.drawable.people);
            }
        }

        @Override
        public int getItemCount() {
            return abouts.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView commentUserID, commentText, commentTimestamp;
            RatingBar commentRatingBar;
            RoundedImageView imageProfile;

            ViewHolder(View itemView) {
                super(itemView);
                imageProfile = itemView.findViewById(R.id.imageProfile);
                commentUserID = itemView.findViewById(R.id.commentUserID);
                commentText = itemView.findViewById(R.id.commentText);
                commentTimestamp = itemView.findViewById(R.id.commentTimestamp);
                commentRatingBar = itemView.findViewById(R.id.commentRatingBar);
            }
        }
    }

    private void clearAdapter() {
        if (reviewAdapter != null) {
            reviewAdapter.reviews.clear();
            reviewAdapter.notifyDataSetChanged();
        }
        if (aboutAdapter != null) {
            aboutAdapter.abouts.clear();
            aboutAdapter.notifyDataSetChanged();
        }
    }

}
