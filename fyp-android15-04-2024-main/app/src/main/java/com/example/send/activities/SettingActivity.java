package com.example.send.activities;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;


import com.example.send.Ar.TestKontilActivity;
import com.example.send.ChangePassword.ChangePasswordActivity;
import com.example.send.GoogleMap.TestMapActivity;
import com.example.send.R;
import com.example.send.databinding.ActivitySettingBinding;
import com.example.send.databinding.ActivitySignInBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;

public class SettingActivity extends AppCompatActivity {
    private PreferenceManager preferenceManger;
    private ActivitySettingBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_setting);

        preferenceManger = new PreferenceManager(getApplicationContext());

        binding = ActivitySettingBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        setListeners();
    }


    private void setListeners(){

        binding.llEditProfile.setOnClickListener(v -> {

            Intent intent = new Intent(getApplicationContext(), UserEditInformationActivity.class);
            startActivity(intent);
        });

        binding.llAICS.setOnClickListener(v -> {
            Intent intent = new Intent(getApplicationContext(), aichatActivity.class);
            startActivity(intent);
        });

        binding.llCalender.setOnClickListener(v -> {
            Intent intent = new Intent(getApplicationContext(), TimeTable.class);
            startActivity(intent);
        });

        binding.llContactUs.setOnClickListener(v -> {
            Intent intent = new Intent(getApplicationContext(), ContactUaActivity.class);
            startActivity(intent);
        });

        binding.llChangePassword.setOnClickListener(v -> {
            Intent intent = new Intent(getApplicationContext(), ChangePasswordActivity.class);
            startActivity(intent);
        });

        binding.llTest.setOnClickListener(v -> {
            Intent intent = new Intent(getApplicationContext(), TestKontilActivity.class);
            startActivity(intent);
        });



        binding.llLogOut.setOnClickListener(v -> {
            // Create an AlertDialog Builder
            new AlertDialog.Builder(SettingActivity.this)
                    .setTitle("Logout Confirmation") // Set the dialog title
                    .setMessage("Are you sure you want to log out?") // Set the dialog message
                    .setPositiveButton("Yes", (dialog, which) -> {
                        // User clicked Yes button. Perform the logout action here.
                        preferenceManger.putBoolean(Constants.KEY_IS_SIGNED_IN ,false);
                        preferenceManger.putString(Constants.KEY_USER_ID,null);

                        // Create an Intent to start the SignInActivity
                        Intent intent = new Intent(SettingActivity.this, SignInActivity.class);

                        // Set flags to clear the task and start a new task
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);

                        startActivity(intent);
                        finish(); // This line is redundant because of the set flags, but it's safe to leave it here.
                    })
                    .setNegativeButton("No", (dialog, which) -> {
                        // User clicked No button. Dismiss the dialog and do nothing.
                        dialog.dismiss();
                    })
                    .create() // Create the AlertDialog
                    .show(); // Show the AlertDialog
        });

    }

}


