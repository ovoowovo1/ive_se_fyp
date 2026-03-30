package com.example.send.bottomNav;

import android.content.Intent;
import android.os.Bundle;

import androidx.fragment.app.Fragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.example.send.Explore.DonationFragment;
import com.example.send.Explore.RequestFragment;
import com.example.send.Me.MeAboutFragment;
import com.example.send.Me.MeDonationFragment;
import com.example.send.Me.MeRequestFragment;
import com.example.send.Me.MeReviewFragment;
import com.example.send.R;
import com.example.send.activities.SettingActivity;


import com.example.send.databinding.FragmentMeBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.material.tabs.TabLayout;
import com.squareup.picasso.Picasso;

import java.text.SimpleDateFormat;
import java.util.Date;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;


public class FragmentMe extends Fragment {

private PreferenceManager preferenceManager;
    private FragmentMeBinding binding;

    //private String apilink = "http://10.0.2.2:8081/";
      private String apilink = "http://192.168.137.1:8081/";

    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilink)
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    private UserService userService;

    private FrameLayout frameLayoutME;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        binding = FragmentMeBinding.inflate(inflater, container, false);
        preferenceManager = new PreferenceManager(getContext());

        // Set an OnClickListener on the button
        setonClickListener();


        return binding.getRoot();
    }







    private void setonClickListener(){
        binding.btnSetting.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //change to setting activity

                Intent intent = new Intent(getActivity(), SettingActivity.class);
                startActivity(intent);
            }
        });

        loadUserData();

        if (getFragmentManager() != null) {
            getFragmentManager().beginTransaction().replace(binding.frameLayoutME.getId(), new MeDonationFragment()).commit();
        }

        binding.tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                Fragment fragment = null;
                switch (tab.getPosition()) {
                    case 0:
                        fragment = new MeDonationFragment();
                        break;
                    case 1:
                        fragment = new MeRequestFragment();
                        break;
                    case 2:
                        fragment = new MeReviewFragment();
                        break;
                    case 3:
                        fragment = new MeAboutFragment();
                        break;

                }
                if (fragment != null) {
                    if (getFragmentManager() != null) {
                        getFragmentManager().beginTransaction().replace(binding.frameLayoutME.getId(), fragment).commit();
                    }
                }
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {
                // 這裡通常不需要處理
            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {
                // 這裡可以處理重新選擇標籤的行為，如果需要的話
            }
        });
    }

    private void loadUserData() {
        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String userId = preferenceManager.getString(Constants.SQL_USER_ID);
        String authToken = "Bearer " + token;
        userService = retrofit.create(UserService.class);
        Call<User> call = userService.getUser(authToken, userId);
        call.enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful()) {
                    User user = response.body();
                    // Get the image URL
                    if(user.get_User_image()!= null){
                        String imageUrl = apilink + user.get_User_image().replace("\\", "/");
                        // Load the image using Picasso
                        Picasso.get().load(imageUrl).into(binding.imageProfile);
                    }else{
                        binding.imageProfile.setImageResource(R.drawable.people);
                    }

                    binding.tvUserName.setText(user.getName());
                    binding.tvUserID.setText(user.getID());
                    binding.tvUserAddress.setText(user.get_User_Location());

                    showToast("no bug  ");
                } else {
                    // Handle error
                    showToast("something have bug. Error code: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                Log.d("FragmentMe", "onFailure: " + t.getMessage());
                showToast("something have bug. Error code: " + t.getMessage());
            }
        });


        UserRatingService userRatingService = retrofit.create(UserRatingService.class);
        Call<Mark> callMark = userRatingService.getRatingMark(authToken, userId);
        callMark.enqueue(new Callback<Mark>() {
            @Override
            public void onResponse(Call<Mark> call, Response<Mark> response) {
                if (response.isSuccessful()) {
                    Mark mark = response.body();
                    // Get the image URL
                    if(mark.getAvgMark()!= null){
                        binding.tvRating.setText(" "+mark.getAvgMark() + " (" + mark.getTotalRatings() + ")");
                        binding.commentRatingBar.setRating(Float.parseFloat(mark.getAvgMark()));
                    }else{
                        binding.tvRating.setText("0.0 (0)");
                        binding.commentRatingBar.setRating(0);
                    }
                } else {
                    // Handle error
                    showToast("something have bug. Error code: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Mark> call, Throwable t) {
                Log.d("FragmentMe", "onFailure: " + t.getMessage());
                showToast("something have bug. Error code: " + t.getMessage());
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



    public interface UserService {
        @GET("user/{user_id}")
        Call<User> getUser(@Header("Authorization") String token, @Path("user_id") String userId);
    }

    public interface  UserRatingService{
        @GET("getUserRatingAvgMark/{user_id}")
        Call<Mark> getRatingMark(@Header("Authorization") String token, @Path("user_id") String userId);
    }



    class User {
        private String ID;
        private String Name;
        private String User_image;
        private String User_AboutMe;

        private String User_Location;

        // Getters
        public String getID() {
            return ID;
        }

        public String getName() {
            return Name;
        }


        public String get_User_image() {
            return User_image;
        }


        public String get_User_Location() { return User_Location; }

    }

    class Mark{
        private String avgMark;
        private String totalRatings;

        public String getAvgMark(){
            return avgMark;
        }

        public String getTotalRatings(){
            return totalRatings;
        }
    }


}