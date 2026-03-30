package com.example.send.Me;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.support.annotation.NonNull;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.activities.DonateItemDataActivity;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public class MeDonationFragment extends Fragment {

    private ActivityResultLauncher<Intent> activityResultLauncher;
    private PreferenceManager preferenceManager;

    private RecyclerView recyclerView;


    private String apilink = "http://10.0.2.2:8081/";
    // private String apilink = "http://192.168.137.1:8081/";

    private String anotherUserId = null ;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        if (getArguments() != null) {
            anotherUserId = getArguments().getString("userId");
            //showToast("Another User: " +  anotherUserId);
        }

        return inflater.inflate(R.layout.fragment_me_donation, container, false);
    }




    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);



        // Initialize your RecyclerView and other UI components here
        recyclerView = view.findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new GridLayoutManager(getContext(), 2)); // 2 columns

        // Initialize your list of DonateItems
        List<DonateItem> donateItems = new ArrayList<>();

        // Set the adapter
        DonateItemAdapter adapter = new DonateItemAdapter(getContext(), donateItems);

        recyclerView.setAdapter(adapter);

        // Load data and update the adapter
        loadData(adapter);

        activityResultLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK) {

                        loadData(adapter);
                    }
                });
    }

    public void loadData(DonateItemAdapter adapter){
        showToast("loadData() called");

        preferenceManager = new PreferenceManager(getContext());


        // Initialize Retrofit service
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();


        if(anotherUserId != null) {
            AotherDonateDataApiService service = retrofit.create(AotherDonateDataApiService.class);

            String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
            String userId = preferenceManager.getString(Constants.SQL_USER_ID);
            showToast("this is UserID " + userId);

            String authToken = "Bearer " + token;

            Call<List<DonateItem>> call;

            call = service.getDonateItems(authToken,anotherUserId ,userId);

            call.enqueue(new Callback<List<DonateItem>>() {
                @Override
                public void onResponse(Call<List<DonateItem>> call, Response<List<DonateItem>> response) {
                    if (response.isSuccessful()) {
                        List<DonateItem> donateItems = response.body();
                        adapter.donateItems.clear();
                        adapter.donateItems.addAll(donateItems);
                        adapter.notifyDataSetChanged();
                    } else {

                    }
                }
                @Override
                public void onFailure(Call<List<DonateItem>> call, Throwable t) {

                }
            });

        }else {
            DonateDataApiService service = retrofit.create(DonateDataApiService.class);


            String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
            String userId = preferenceManager.getString(Constants.SQL_USER_ID);
            showToast("this is UserID " + userId);
            String authToken = "Bearer " + token;

            Call<List<DonateItem>> call;

            call = service.getDonateItems(authToken, userId);

            call.enqueue(new Callback<List<DonateItem>>() {
                @Override
                public void onResponse(Call<List<DonateItem>> call, Response<List<DonateItem>> response) {
                    if (response.isSuccessful()) {
                        List<DonateItem> donateItems = response.body();
                        adapter.donateItems.clear();
                        adapter.donateItems.addAll(donateItems);
                        adapter.notifyDataSetChanged();
                    } else {

                    }
                }
                @Override
                public void onFailure(Call<List<DonateItem>> call, Throwable t) {

                }
            });
        }

    }


    public interface DonateDataApiService {
        @POST("androiduserseethemedonationitemdata/{user_id}")
        Call<List<DonateItem>> getDonateItems(@Header("Authorization") String token, @Path("user_id") String userId);

    }

    public interface AotherDonateDataApiService {
        @POST("androiduserseetheanothermedonationitemdata/{user_id}/{anotheruser_id}")
        Call<List<DonateItem>> getDonateItems(@Header("Authorization") String token, @Path("user_id") String userId ,@Path("anotheruser_id") String anotherUserId);

    }

    public interface CollectCancelApiService {
        @POST("UserCollectDelectItem")
        Call<ResponseBody> collectCancel(@Header("Authorization") String token,
                                         @Body CollectItemRequest collectItemRequest);
    }

    public class DonateItem {
        private String Donate_Item_ID;
        private String First_Photo_ID;
        private String First_Photo;
        private String Donate_User_ID;
        private String Donate_Item_Name;
        private String User_image;
        private String Collection_Status;

        // Add getters and setters here

        public String getDonate_Item_ID() {
            return Donate_Item_ID;
        }

        // Getter for Donate_Item_Name
        public String getDonate_Item_Name() {
            return Donate_Item_Name;
        }

        // Getter for First_Photo
        public String getFirst_Photo() {
            return First_Photo;
        }

        // Getter for Donate_User_ID

        public String getDonate_User_ID() {
            return Donate_User_ID;
        }

        // Getter for User_image
        public String getUser_image() {
            return User_image;
        }

        // Getter for Collection_Status
        public String getCollection_Status() {
            return Collection_Status;
        }
    }

    public class CollectItemRequest {
        private String User_ID;
        private String Donate_Item_ID;
        private int Collect_Item_Status;

        // Constructor
        public CollectItemRequest(String User_ID, String Donate_Item_ID, int Collect_Item_Status) {
            this.User_ID = User_ID;
            this.Donate_Item_ID = Donate_Item_ID;
            this.Collect_Item_Status = Collect_Item_Status;
        }
    }



    public class DonateItemAdapter extends RecyclerView.Adapter<DonateItemAdapter.ViewHolder> {

        private List<DonateItem> donateItems;
        private Context context;

        private HashMap<String, Boolean> likedItems = new HashMap<>();


        public DonateItemAdapter(Context context, List<DonateItem> donateItems) {
            this.context = context;
            this.donateItems = donateItems;
        }

        @NonNull
        @Override
        public DonateItemAdapter.ViewHolder onCreateViewHolder (@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(context).inflate(R.layout.item_donate, parent, false);
            return new DonateItemAdapter.ViewHolder(view);
        }


        @Override
        public void onBindViewHolder(@NonNull DonateItemAdapter.ViewHolder holder, int position) {
            DonateItem item = donateItems.get(position);
            holder.textDonateItem.setText(item.getDonate_Item_Name());
            holder.textUserID.setText(item.getDonate_User_ID());
            // Use an image loading library like Glide to load the image

            String imageUrl = apilink + item.getFirst_Photo().replace("\\", "/");
            Picasso.get().load(imageUrl).into(holder.imageDonateItem);

            if(item.getUser_image() != null) {
                imageUrl = apilink + item.getUser_image().replace("\\", "/");
                Picasso.get().load(imageUrl).into(holder.roundedUserImage);
            }else{
                holder.roundedUserImage.setImageResource(R.drawable.people);
            }

            holder.imageDonateItem.setOnClickListener(e -> {
                showToast("item ID: "+ item.getDonate_Item_ID());
                Intent intent = new Intent(getContext(), DonateItemDataActivity.class);
                intent.putExtra("Donate_Item_ID", item.getDonate_Item_ID());
                activityResultLauncher.launch(intent);

            });

            // Initialize and set the like button state based on Collection_Status
            boolean isCurrentlyLiked = "Collected".equals(item.getCollection_Status());
            likedItems.put(item.getDonate_Item_ID(), isCurrentlyLiked);

            if (isCurrentlyLiked) {
                holder.ibtnCollectItem.setBackgroundResource(R.drawable.ic_like_red);
            } else {
                holder.ibtnCollectItem.setBackgroundResource(R.drawable.ic_like);
            }

            // Set OnClickListener for the like button
            holder.ibtnCollectItem.setOnClickListener(e -> {
                boolean isLiked = likedItems.getOrDefault(item.getDonate_Item_ID(), false);
                if (isLiked) {
                    // Change to not liked state
                    holder.ibtnCollectItem.setBackgroundResource(R.drawable.ic_like);
                    updateCollectionStatus(item.getDonate_Item_ID(), 0);//Cancel
                } else {
                    // Change to liked state
                    holder.ibtnCollectItem.setBackgroundResource(R.drawable.ic_like_red);
                    updateCollectionStatus(item.getDonate_Item_ID(), 1); //Collect
                }
                // Toggle the state in the map
                likedItems.put(item.getDonate_Item_ID(), !isLiked);
            });
        }

        @Override
        public int getItemCount() {
            return donateItems.size();
        }

        public  class ViewHolder extends RecyclerView.ViewHolder {
            ImageView imageDonateItem;
            TextView textDonateItem;
            TextView textUserID;
            ImageButton ibtnCollectItem;
            RoundedImageView roundedUserImage;


            public ViewHolder(@NonNull View itemView) {
                super(itemView);
                imageDonateItem = itemView.findViewById(R.id.image_donate_item);


                textDonateItem = itemView.findViewById(R.id.text_donate_item);
                textUserID = itemView.findViewById(R.id.text_user_ID);
                ibtnCollectItem  = itemView.findViewById(R.id.btn_collect_item);

                roundedUserImage = itemView.findViewById(R.id.image_donate_user);
                roundedUserImage.setCornerRadius(10); // Or any other value you prefer
                roundedUserImage.setOval(true);

            }
        }
    }

    public void updateCollectionStatus(String Donate_Item_ID, int Collection_Status) {
        preferenceManager = new PreferenceManager(getContext());

        // Initialize Retrofit service
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        CollectCancelApiService service = retrofit.create(CollectCancelApiService.class);


        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String userId = preferenceManager.getString(Constants.SQL_USER_ID);
        showToast("this is UserID " + userId);
        String authToken = "Bearer " + token;

        CollectItemRequest request = new CollectItemRequest(userId , Donate_Item_ID, Collection_Status);
        Call<ResponseBody> call = service.collectCancel(authToken, request);

        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    showToast("Update successful");

                } else {
                    showToast("Update failed: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                showToast("Update failed: " + t.getMessage());
            }
        });

    }




    public void showToast(String message){
        if(getContext() != null) {
            Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
        } else {
            Log.e("MeDonationFragment", "Context is null, cannot show toast");
        }
    }






}