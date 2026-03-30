package com.example.send.ChangePassword;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.example.send.Explore.DonationFragment;
import com.example.send.GoogleMap.TestMapActivity;
import com.example.send.R;
import com.example.send.databinding.ActivityChangePasswordBinding;
import com.example.send.databinding.ActivitySettingBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public class ChangePasswordActivity extends AppCompatActivity {

    private PreferenceManager preferenceManger;
    private ActivityChangePasswordBinding binding;
    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);
        preferenceManger = new PreferenceManager(getApplicationContext());
        binding = ActivityChangePasswordBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        setListeners();


    }

    private void setListeners(){
        binding.changePasswordButton.setOnClickListener(v -> {
            if (binding.currentPasswordEditText.getText().toString().trim().isEmpty()){
                binding.currentPasswordEditText.setError("Enter current password");
            }else if (binding.newPasswordEditText.getText().toString().trim().isEmpty()){
                binding.newPasswordEditText.setError("Enter new password");
            }else if (binding.confirmPasswordEditText.getText().toString().trim().isEmpty()){
                binding.confirmPasswordEditText.setError("Enter confirm password");
            }else if (!binding.newPasswordEditText.getText().toString().equals(binding.confirmPasswordEditText.getText().toString())){
                binding.confirmPasswordEditText.setError("Password does not match");
            }else {
                  // Change password
                changePassword();
            }
        });
    }


    private void changePassword() {
        Log.d("ChangePasswordActivity", "changePassword: " + preferenceManger.getString(Constants.KEY_NAME));
        String userId = preferenceManger.getString(Constants.KEY_USER_ID);
        String newPassword = binding.newPasswordEditText.getText().toString();
        String currentPassword = binding.currentPasswordEditText.getText().toString();

        // Check if the current password is correct
        FirebaseFirestore database = FirebaseFirestore.getInstance();
        database.collection(Constants.KEY_COLLECTION_USERS)
                .whereEqualTo(Constants.KEY_USER_ID, userId)
                .whereEqualTo(Constants.KEY_PASSWORD, currentPassword)
                .get()
                .addOnSuccessListener(querySnapshot -> {
                    if (!querySnapshot.isEmpty()) {
                        updatePassword(userId, newPassword);
                    } else {
                        showToast("Incorrect current password");
                    }
                })
                .addOnFailureListener(e -> {
                    showToast("Failed to check current password: " + e.getMessage());
                });
    }

    private void updatePassword(String userId, String newPassword) {
        FirebaseFirestore database = FirebaseFirestore.getInstance();
        database.collection(Constants.KEY_COLLECTION_USERS)
                .whereEqualTo(Constants.KEY_USER_ID, userId)
                .get()
                .addOnSuccessListener(querySnapshot -> {
                    if (!querySnapshot.isEmpty()) {
                        for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                            document.getReference().update(Constants.KEY_PASSWORD, newPassword)
                                    .addOnSuccessListener(aVoid -> {
                                        mySQLDatabaseUpdate();
                                    })
                                    .addOnFailureListener(e -> {
                                        showToast("Failed to change password: " + e.getMessage());
                                    });
                        }
                    } else {
                        showToast("User not found.");
                    }
                })
                .addOnFailureListener(e -> {
                    showToast("Failed to update password: " + e.getMessage());
                });
    }

    private void showToast(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }


    private void mySQLDatabaseUpdate() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        ChangePasswordApiService service = retrofit.create(ChangePasswordApiService.class);

        String newPassword = binding.newPasswordEditText.getText().toString();
        String userId = preferenceManger.getString(Constants.KEY_USER_ID);

        ChangePasswordRequest request = new ChangePasswordRequest(newPassword, userId);
        String token = preferenceManger.getString(Constants.SQL_USER_TOKEN);
        String authToken = "Bearer " + token;
        service.changePassword(authToken,request)
                .enqueue(new Callback<ChangePasswordResponse>() {
                    @Override
                    public void onResponse(Call<ChangePasswordResponse> call, Response<ChangePasswordResponse> response) {
                        if (response.isSuccessful()) {
                            ChangePasswordResponse changePasswordResponse = response.body();
                            int affectedRows = changePasswordResponse.getAffectedRows();
                            if (affectedRows > 0) {
                                clear();
                                showToast("Password changed successfully.");
                            } else {
                                showToast("Failed to change password.");
                            }
                        } else {
                            showToast("Error: " + response.message());
                        }
                    }

                    @Override
                    public void onFailure(Call<ChangePasswordResponse> call, Throwable t) {
                        showToast("Error: " + t.getMessage());
                    }
                });
    }

    public interface ChangePasswordApiService {
        @POST("changeuserpassword")
        Call<ChangePasswordResponse> changePassword(@Header("Authorization") String token,@Body ChangePasswordRequest request);
    }

    public class ChangePasswordRequest {
        private String password;
        private String id;

        public ChangePasswordRequest(String password, String id) {
            this.password = password;
            this.id = id;
        }

        // Getters and setters
    }

    public class ChangePasswordResponse {
        private int affectedRows;

        public int getAffectedRows() {
            return affectedRows;
        }
    }

    private void clear() {
        binding.currentPasswordEditText.setText(null);
        binding.newPasswordEditText.setText(null);
        binding.confirmPasswordEditText.setText(null);
    }


}