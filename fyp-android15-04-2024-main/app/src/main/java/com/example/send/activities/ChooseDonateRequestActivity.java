package com.example.send.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import androidx.appcompat.app.AppCompatActivity;

import com.example.send.R;
import com.example.send.UserRequest.UserCreateRequestActivity;
import com.example.send.databinding.ActivityChooseDonateRequestBinding;
import com.example.send.databinding.ActivitySignInBinding;

public class ChooseDonateRequestActivity extends AppCompatActivity {

    private ActivityChooseDonateRequestBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_choose_donate_request);

        binding = ActivityChooseDonateRequestBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());


        binding.ivDonation.setOnClickListener(v -> {
            Intent intent = new Intent(ChooseDonateRequestActivity.this, UserDonateItem.class);
            startActivity(intent);
        });

        binding.ivRequest.setOnClickListener(v -> {
            Intent intent = new Intent(ChooseDonateRequestActivity.this, UserCreateRequestActivity.class);
            startActivity(intent);
        });



    }
}
