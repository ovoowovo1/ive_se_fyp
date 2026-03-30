package com.example.send.activities;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Instrumentation;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.InetAddresses;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.util.Patterns;
import android.view.View;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.databinding.ActivitySignUpBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.firebase.firestore.FirebaseFirestore;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

public class SignUpActivity extends AppCompatActivity {

    private ActivitySignUpBinding binding;
    private String encodedImage; //video 3
    private PreferenceManager preferenceManager;

    private String apilink = "http://10.0.2.2:8081/";
   // private String apilink = "http://192.168.137.1:8081/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivitySignUpBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        //new add on video 3
        preferenceManager = new PreferenceManager(getApplicationContext());
        setListeners();
    }


    public void handleSignUp() {
        // 获取输入数据
        String userID = binding.inputUserID.getText().toString();
        String userName = binding.inputUserName.getText().toString();
        String userEmail = binding.inputUserEmail.getText().toString();
        String userPassword = binding.inputUserPassword.getText().toString();
        String userConfirmPassword = binding.inputUserConfirmPassword.getText().toString();


        Retrofit retrofit = new Retrofit.Builder().baseUrl(apilink).addConverterFactory(GsonConverterFactory.create()).build();

        MyApiEndpoint apiEndpoint = retrofit.create(MyApiEndpoint.class);

        System.out.println("UserID: " + userID);
        System.out.println("UserName: " + userName);
        System.out.println("UserPassword: " + userPassword);


        Call<ResponseBody> call = apiEndpoint.createUser(userID, userName, userPassword ,userEmail);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                // 如果响应成功，返回到 SignInActivity
                if (response.isSuccessful()) {
                    try {

                        JSONObject jsonObject = new JSONObject(response.body().string());
                        String token = jsonObject.getString(Constants.SQL_USER_TOKEN);

                        preferenceManager.putString(Constants.SQL_USER_ID,binding.inputUserID.getText().toString());
                        preferenceManager.putString(Constants.SQL_USER_TOKEN,token);

                    } catch (JSONException | IOException e) {
                        e.printStackTrace();
                    }
                    finish();
                } else {
                    // 如果响应失败，显示一条消息
                    Toast.makeText(SignUpActivity.this, "创建用户失败", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                // 如果请求失败，显示一条消息
                System.out.println("test xxxxxxxxxx");
                t.printStackTrace();
                Toast.makeText(SignUpActivity.this, "网络错误", Toast.LENGTH_SHORT).show();
            }
        });
    }

    public interface MyApiEndpoint {
        @FormUrlEncoded
        @POST("createuser")
        Call<ResponseBody> createUser(@Field("UserID") String userID, @Field("Name") String userName, @Field("password") String userPassword,@Field("User_Email") String userEmail);
    }


    // all code below is from video 3


    private void setListeners(){
        binding.textSignIn.setOnClickListener(v -> onBackPressed());
        // video 3
        binding.buttonSignUp.setOnClickListener(view -> {
            if (isValidSignUpDetails()){
                signUp();
            }
        });
    }

    private void showToast(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }

    private void signUp() {
        loading(true);
        FirebaseFirestore database = FirebaseFirestore.getInstance();

        String userID = binding.inputUserID.getText().toString();
        String userName = binding.inputUserName.getText().toString();
        String userEmail = binding.inputUserEmail.getText().toString();
        String userPassword = binding.inputUserPassword.getText().toString();

        // Check if user ID already exists
        database.collection(Constants.KEY_COLLECTION_USERS)
                .whereEqualTo(Constants.KEY_USER_ID, userID)
                .get()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        if (task.getResult() != null && !task.getResult().isEmpty()) {
                            // User ID already exists, show error message
                            loading(false);
                            showToast("User ID already exists");
                        } else {
                            // User ID does not exist, create new user
                            HashMap<String, Object> user = new HashMap<>();
                            user.put(Constants.KEY_USER_ID, userID);
                            user.put(Constants.KEY_NAME, userName);
                            user.put(Constants.KEY_EMAIL, userEmail);
                            user.put(Constants.KEY_PASSWORD, userPassword);

                            database.collection(Constants.KEY_COLLECTION_USERS)
                                    .add(user)
                                    .addOnSuccessListener(documentReference -> {
                                        loading(false);
                                        preferenceManager.putBoolean(Constants.KEY_IS_SIGNED_IN, true);
                                        preferenceManager.putString(Constants.KEY_USER_ID, documentReference.getId());
                                        preferenceManager.putString(Constants.KEY_NAME, userName);

                                        preferenceManager.putString(Constants.SQL_USER_ID,binding.inputUserID.getText().toString().trim());
                                        handleSignUp();
                                        Intent intent = new Intent(getApplicationContext(), MainActivity.class);
                                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                        startActivity(intent);
                                    })
                                    .addOnFailureListener(exception -> {
                                        loading(false);
                                        showToast(exception.getMessage());
                                    });
                        }
                    } else {
                        loading(false);
                        showToast("Failed to check user ID");
                    }
                });
    }

    private String getEncodedImage(Bitmap bitmap){
        int previewWidth =150;
        int previewHeight = bitmap.getHeight() * previewWidth / bitmap.getWidth();
        Bitmap previewBitmap = Bitmap.createScaledBitmap(bitmap, previewWidth, previewHeight, false);
        ByteArrayOutputStream byteArrayOutputStream =new ByteArrayOutputStream();
        previewBitmap.compress(Bitmap.CompressFormat.JPEG, 50, byteArrayOutputStream);
        byte[] bytes = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(bytes, Base64.DEFAULT);
    }

//    private final ActivityResultLauncher<Intent> pickImage= registerForActivityResult(  //go to video 3 to see how to do
//            new ActivityResultContracts.StartActivityForResult(),
//            result -> {
//                if(result.getResultCode() == RESULT_OK){
//                    Uri imageUri = result.getData().getData();
//                    try {
//                        InputStream inputStream = getContentResolver().openInputStream(imageUri);
//                        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
//                        binding.inputUserID.setImageBitmap(bitmap);
//                    }catch (FileNotFoundException e){
//                        e.printStackTrace();
//                    }
//
//                }
//            }
//    );



    private Boolean isValidSignUpDetails(){ // create account exception
//        if(encodedImage == null){
//            showToast("Select profile image");
//            return false;
        if(binding.inputUserID.getText().toString().trim().isEmpty()){
            showToast("Enter ID");
           return false;
        } else if(binding.inputUserName.getText().toString().trim().isEmpty()){
            showToast("Enter name");
            return false;
        } else if (binding.inputUserEmail.getText().toString().trim().isEmpty()) {
            showToast("Enter email");
        } else if(!Patterns.EMAIL_ADDRESS.matcher(binding.inputUserEmail.getText().toString()).matches()){
            showToast("Enter valid email");
            return false;
        } else if (binding.inputUserPassword.getText().toString().trim().isEmpty()) {
            showToast("Enter password");
            return false;
        }else if(!binding.inputUserPassword.getText().toString().equals(binding.inputUserConfirmPassword.getText().toString())){
            showToast("Password & confirm password must be same");
            return false;
        }else {
            return true;
        }
        return false;
    }

    private void loading(Boolean isLoading){
        if(isLoading){
            binding.buttonSignUp.setVisibility(View.INVISIBLE);
            binding.progressBar.setVisibility(View.VISIBLE);
        }else {
            binding.progressBar.setVisibility(View.INVISIBLE);
            binding.buttonSignUp.setVisibility(View.VISIBLE);
        }
    }



}