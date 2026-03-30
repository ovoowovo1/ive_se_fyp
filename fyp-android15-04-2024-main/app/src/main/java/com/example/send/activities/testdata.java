package com.example.send.activities;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Context;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.bumptech.glide.Glide;
import com.example.send.R;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Header;
import retrofit2.http.POST;

public class testdata extends AppCompatActivity {


    private PreferenceManager preferenceManager;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_testdata);
        RecyclerView recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new GridLayoutManager(this, 2)); // 2 columns


        // Initialize your list of DonateItems
        List<DonateItem> donateItems = new ArrayList<>();

        // Set the adapter
        DonateItemAdapter adapter = new DonateItemAdapter(this, donateItems);
        recyclerView.setAdapter(adapter);

        // Load data and update the adapter
        loadData(adapter);
    }





    public void loadData(DonateItemAdapter adapter){
        showToast("loadData() called");

        preferenceManager = new PreferenceManager(this);

        // Initialize Retrofit service
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:8081/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        DonateDataApiService service = retrofit.create(DonateDataApiService.class);


        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String userId = preferenceManager.getString(Constants.SQL_USER_ID);
        String authToken = "Bearer " + token;

        Call<List<DonateItem>> call = service.getDonateItems(authToken);
        call.enqueue(new Callback<List<DonateItem>>() {
            @Override
            public void onResponse(Call<List<DonateItem>> call, Response<List<DonateItem>> response) {
                if (response.isSuccessful()) {
                    List<DonateItem> donateItems = response.body();
                    adapter.donateItems.clear();
                    adapter.donateItems.addAll(donateItems);
                    adapter.notifyDataSetChanged();
                } else {
                    showToast("Error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<DonateItem>> call, Throwable t) {
                showToast("Error: " + t.getMessage());
            }
        });

    }

    public interface DonateDataApiService {
        @POST("androiddonatedatalastes")
        Call<List<DonateItem>> getDonateItems (@Header("Authorization") String token);
    }

    public class DonateItem {
        private String Donate_Item_ID;
        private String First_Photo_ID;
        private String First_Photo;
        private String Donate_User_ID;
        private String Donate_Item_Name;

        // Add getters and setters here

        // Getter for Donate_Item_Name
        public String getDonate_Item_Name() {
            return Donate_Item_Name;
        }

        // Getter for First_Photo
        public String getFirst_Photo() {
            return First_Photo;
        }
    }


    private void showToast(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }


    public class DonateItemAdapter extends RecyclerView.Adapter<DonateItemAdapter.ViewHolder> {

        private List<DonateItem> donateItems;
        private Context context;

        public DonateItemAdapter(Context context, List<DonateItem> donateItems) {
            this.context = context;
            this.donateItems = donateItems;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(context).inflate(R.layout.item_donate, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            DonateItem item = donateItems.get(position);
            holder.textDonateItem.setText(item.getDonate_Item_Name());
            // Use an image loading library like Glide to load the image
            Glide.with(context).load(item.getFirst_Photo()).into(holder.imageDonateItem);
        }

        @Override
        public int getItemCount() {
            return donateItems.size();
        }

        public  class ViewHolder extends RecyclerView.ViewHolder {
            ImageView imageDonateItem;
            TextView textDonateItem;

            public ViewHolder(@NonNull View itemView) {
                super(itemView);
                imageDonateItem = itemView.findViewById(R.id.image_donate_item);
                textDonateItem = itemView.findViewById(R.id.text_donate_item);
            }
        }
    }

}