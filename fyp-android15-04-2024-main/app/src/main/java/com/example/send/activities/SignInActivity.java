package com.example.send.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.send.databinding.ActivitySignInBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;

import org.w3c.dom.Document;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.POST;

public class SignInActivity extends AppCompatActivity {

    private ActivitySignInBinding binding;
    private PreferenceManager preferenceManger;

    //private String apilink = "http://10.0.2.2:8081/";
    private String apilink = "http://192.168.137.1:8081/";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        preferenceManger = new PreferenceManager(getApplicationContext());

        if(preferenceManger.getBoolean(Constants.KEY_IS_SIGNED_IN)){
            Intent intent = new Intent(getApplicationContext(),MainActivity.class);
            startActivity(intent);
            finish();
        }


        binding = ActivitySignInBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        setListeners();
    }
    private void setListeners(){
        binding.textCreateNewAccount.setOnClickListener(v ->
                startActivity(new Intent(getApplicationContext(), SignUpActivity.class)));

        binding.buttonSignIn.setOnClickListener(v -> {
            if(inValidSignInDeatails()){
                signIn();
            }
        });

        binding.textForgotPassword.setOnClickListener(v ->
                startActivity(new Intent(getApplicationContext(), ForgetPasswordActivity.class)));


        // this is SQL Login..
        // binding.buttonSignIn.setOnClickListener(v -> handleSignin());

    }

    // 定義 API 接口
    public interface ApiService {
        @POST("Userlogin")
        Call<ApiResponse> login(@Body LoginRequest loginRequest);
    }

    // 定義請求數據類
    public static class LoginRequest {
        String username;
        String password;

        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }
    }

    public class ApiResponse {
        private int status;
        private String msg;

        private String token;

        // Getter 方法
        public int getStatus() {
            return status;
        }

        public String getMsg() {
            return msg;
        }
        public String getToken(){return token;}
        // Setter 方法
        public void setStatus(int status) {
            this.status = status;
        }

        public void setMsg(String msg) {
            this.msg = msg;
        }

        public void setToken(String token) {
            this.token = token;
        }

    }


    public void handleSignin() {
        String username = binding.inputUserID.getText().toString().trim();
        String password = binding.inputPassword.getText().toString().trim();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);
        Call<ApiResponse> call = apiService.login(new LoginRequest(username, password));

        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                ApiResponse apiResponse = response.body();
                if (apiResponse != null) {
                    if (apiResponse.getStatus() == 200) {
                        String token = apiResponse.getToken();
                        preferenceManger.putString(Constants.SQL_USER_TOKEN,token);
                        Intent intent = new Intent(getApplicationContext(),MainActivity.class);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                    } else if (apiResponse.getStatus() == 400) {
                        showToast("no");
                        loading(false);
                    } else {
                        showToast("Unexpected response code: " + apiResponse.getStatus());
                        loading(false);
                    }

                } else {
                    loading(false);
                    showToast("Response body is null");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                // 請求失敗，處理相應邏輯
                showToast("請求失敗");
                loading(false);
            }
        });
    }

    //Video 4
    private void showToast(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }


    private Boolean inValidSignInDeatails(){
        if(binding.inputUserID.getText().toString().trim().isEmpty()){
            showToast("Enter ID");
            return false;
        }else if(binding.inputPassword.getText().toString().trim().isEmpty()){
            showToast("Enter password");
            return false;
        }else{
            return true;
        }
    }

    private void signIn(){
        loading(true);
        FirebaseFirestore database = FirebaseFirestore.getInstance();
        database.collection(Constants.KEY_COLLECTION_USERS)
                .whereEqualTo(Constants.KEY_USER_ID,binding.inputUserID.getText().toString())
                .whereEqualTo(Constants.KEY_PASSWORD,binding.inputPassword.getText().toString())
                .get()
                .addOnCompleteListener(task ->{
                    if(task.isSuccessful() && task.getResult() != null
                            && task.getResult().getDocuments().size() > 0 ){
                        DocumentSnapshot documentSnapshot = task.getResult().getDocuments().get(0);
                        preferenceManger.putBoolean(Constants.KEY_IS_SIGNED_IN ,true);
                        preferenceManger.putString(Constants.KEY_USER_ID,documentSnapshot.getId());
                        preferenceManger.putString(Constants.KEY_NAME,documentSnapshot.getString(Constants.KEY_NAME));

                        preferenceManger.putString(Constants.SQL_USER_ID,binding.inputUserID.getText().toString().trim());
                        handleSignin();
                        //Intent intent = new Intent(getApplicationContext(),MainActivity.class);
                        //intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        //startActivity(intent);
                    }else{
                        loading(false);
                        showToast("Unable to sign In");
                    }
                });

    }

    private void loading(Boolean isLoading){
        if(isLoading){
            binding.buttonSignIn.setVisibility(View.INVISIBLE);
            binding.progressBar.setVisibility(View.VISIBLE);

        }else{
            binding.progressBar.setVisibility(View.INVISIBLE);
            binding.buttonSignIn.setVisibility(View.VISIBLE);
        }
    }

}