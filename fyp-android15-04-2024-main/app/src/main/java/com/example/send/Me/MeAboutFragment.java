package com.example.send.Me;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RatingBar;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.example.send.R;
import com.example.send.databinding.FragmentMeAboutBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Path;
import retrofit2.http.Query;

public class MeAboutFragment extends Fragment {

    private String apilink = "http://10.0.2.2:8081/";
    // private String apilink = "http://192.168.137.1:8081/";

    private String anotherUserId = null ;
    private PreferenceManager preferenceManager;

    private String token = null ;
    private String userId = null ;

    private FragmentMeAboutBinding binding;

    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilink)
            .addConverterFactory(GsonConverterFactory.create())
            .build();


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        binding = FragmentMeAboutBinding.inflate(inflater, container, false);

        // Inflate the layout for this fragment
        if (getArguments() != null) {
            anotherUserId = getArguments().getString("userId");
        }

        preferenceManager = new PreferenceManager(getContext());
        token = "Bearer " + preferenceManager.getString(Constants.SQL_USER_TOKEN);
        userId = preferenceManager.getString(Constants.SQL_USER_ID);


        return binding.getRoot();
    }

    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Call<User> call;

        if (anotherUserId != null) {
            call = retrofit.create(UserDataApiService.class).getDonateItems(token, anotherUserId);
        } else {
            call = retrofit.create(UserDataApiService.class).getDonateItems(token, userId);
        }

        call.enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                if (response.isSuccessful()) {
                    User user = response.body();
                    if (user != null) {
                        if(user.getAboutMe() == null){
                            Log.d("MeAboutFragment", "onResponse: " + "No about me");
                        }else{
                            Log.d("MeAboutFragment", "onResponse: " + user.getAboutMe());
                            binding.textMeAbout.setText(user.getAboutMe());
                        }
                        // Update UI with the retrieved "aboutMe" information

                    }
                } else {
                    Log.d("MeAboutFragment", "onResponse: " + response.errorBody());
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                Log.d("MeAboutFragment", "onFailure: " + t.getMessage());
            }
        });


    }

    public interface UserDataApiService {
        @GET("user/{user_id}")
        Call<User> getDonateItems(@Header("Authorization") String token, @Path("user_id") String userId);

    }

    class User {
        private String User_AboutMe;

        public User(String aboutMe) {
            this.User_AboutMe = aboutMe;
        }

        public void setAboutMe(String aboutMe) {
            this.User_AboutMe = aboutMe;
        }

        public String getAboutMe() {
            return User_AboutMe;
        }
    }


}
