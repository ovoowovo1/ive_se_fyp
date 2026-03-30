package com.example.send.Explore;

import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import android.support.annotation.NonNull;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.content.Intent;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.send.R;
import com.example.send.UserRequest.RequestItemDataActivity;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import java.util.List;


public class RequestFragment extends Fragment {

    private RecyclerView recyclerView;
    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_request, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        recyclerView = view.findViewById(R.id.recyclerView);
        initializeRetrofit();
    }

    private void initializeRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        RequestApi api = retrofit.create(RequestApi.class);
        loadUserRequests(api);
    }



    public interface RequestApi {
        @GET("api/user-requests") // Update this to your correct API endpoint
        Call<List<UserRequest>> getUserRequests();
    }

    private void loadUserRequests(RequestApi api) {
        api.getUserRequests().enqueue(new Callback<List<UserRequest>>() {
            @Override
            public void onResponse(Call<List<UserRequest>> call, Response<List<UserRequest>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.d("RequestFragment", "Data fetched successfully");
                    for (UserRequest request : response.body()) {
                        Log.d("RequestFragment", "Request ID: " + request.getRequest_ID());
                    }
                    updateRecyclerView(response.body());
                } else {
                    Log.e("RequestFragment", "Response unsuccessful: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<List<UserRequest>> call, Throwable t) {
                Log.e("RequestFragment", "API call failed: " + t.getMessage());
            }
        });
    }



    private void updateRecyclerView(List<UserRequest> userRequests) {
        RecyclerView recyclerView = getView().findViewById(R.id.recyclerView);
        UserRequestAdapter adapter = new UserRequestAdapter(userRequests);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }







    //Adapter
    public class UserRequestAdapter extends RecyclerView.Adapter<UserRequestAdapter.ViewHolder> {

        private List<UserRequest> userRequests;

        public UserRequestAdapter(List<UserRequest> userRequests) {
            this.userRequests = userRequests;
        }

        @NonNull
        @Override
        public UserRequestAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_request, parent, false);
            return new ViewHolder(view);
        }



        @Override
        public void onBindViewHolder(@NonNull UserRequestAdapter.ViewHolder holder, int position) {
            UserRequest request = userRequests.get(position);
            holder.userIdTextView.setText(request.getRequest_User_ID());
            holder.itemNameTextView.setText(request.getItem_type());
            holder.itemQuantityTextView.setText("x" + request.getExpect_quantity());
            holder.txtDonatedQuantity.setText(String.valueOf(request.getDonated_quantity()));
            holder.txtExpectQuantity.setText(String.valueOf(request.getExpect_quantity()));

            int progress = (int) ((request.getDonated_quantity() / (float) request.getExpect_quantity()) * 100);
            holder.pgbProgressBar.setProgress(progress);
            holder.txtPercentage.setText(progress + "%");



            String imageUrl = request.getUser_image();
            if (imageUrl != null && !imageUrl.isEmpty()) {
                // Concatenate base URL with the image path
                imageUrl = apilink + imageUrl.replace("\\", "/");
                Picasso.get().load(imageUrl).into(holder.userImageView);
            } else {
                // Set a default image or leave it blank
                holder.userImageView.setImageResource(R.drawable.people); // Replace with your default image resource
            }
            holder.userImageView.setCornerRadius(10); // adjust the corner radius as desired
            holder.userImageView.setOval(true);

            holder.itemView.setOnClickListener(v -> {
                // Create an intent to start RequestItemDataActivity
                Intent intent = new Intent(v.getContext(), RequestItemDataActivity.class);
                // Pass Request_ID as an extra in the intent
                intent.putExtra("Request_ID", request.getRequest_ID());
                v.getContext().startActivity(intent);
            });
        }
        @Override
        public int getItemCount() {
            return userRequests.size();
        }

        public class ViewHolder extends RecyclerView.ViewHolder {
            TextView userIdTextView, itemNameTextView, itemQuantityTextView,txtDonatedQuantity,txtExpectQuantity,txtPercentage;
            RoundedImageView userImageView;

            ProgressBar pgbProgressBar;

            ViewHolder(View itemView) {
                super(itemView);
                userIdTextView = itemView.findViewById(R.id.text_user_ID);
                itemNameTextView = itemView.findViewById(R.id.itemName);
                itemQuantityTextView = itemView.findViewById(R.id.item_quantity);
                userImageView = itemView.findViewById(R.id.image_donate_user);
                txtDonatedQuantity = itemView.findViewById(R.id.txt_Donated_Quantity);
                txtExpectQuantity = itemView.findViewById(R.id.txt_Expect_Quantity);
                pgbProgressBar = itemView.findViewById(R.id.pgb_Progress_Bar);
                txtPercentage = itemView.findViewById(R.id.txt_Percentage);
                // Optionally set corner radius and oval shape
                userImageView.setCornerRadius(10); // Adjust radius as needed
                userImageView.setOval(true);
            }
        }

    }

    //constructor

    public class UserRequest{


        private String Request_ID;
        private String Request_User_ID;
        private String Item_type;
        private int Expect_quantity;
        private int Donated_quantity;

        private String User_image;

        public String getRequest_ID() {
            return Request_ID;
        }

        public void setRequest_ID(String request_ID) {
            Request_ID = request_ID;
        }

        public String getRequest_User_ID() {
            return Request_User_ID;
        }

        public void setRequest_User_ID(String request_User_ID) {
            Request_User_ID = request_User_ID;
        }

        public String getItem_type() {
            return Item_type;
        }

        public void setItem_type(String item_type) {
            Item_type = item_type;
        }

        public int getExpect_quantity() {
            return Expect_quantity;
        }

        public void setExpect_quantity(int Expect_quantity) {
            this.Expect_quantity = Expect_quantity;
        }

        public int getDonated_quantity() {
            return Donated_quantity;
        }

        public void setDonated_quantity(int Donated_quantity) {
            this.Donated_quantity = Donated_quantity;
        }

        public String getUser_image() {
            return User_image;
        }

        public void setUser_image(String user_image) {
            User_image = user_image;
        }
    }

}