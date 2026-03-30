package com.example.send.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.send.databinding.ActivityContactUaBinding;

public class ContactUaActivity extends AppCompatActivity {

    private ActivityContactUaBinding binding;
    private static final String[] helpCategories = {"General Inquiry", "Technical Support", "Other"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityContactUaBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // 设置 MaterialAutoCompleteTextView 的选项
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, helpCategories);
        binding.helpCategoryAutoCompleteTextView.setAdapter(adapter);

        binding.sendButton.setOnClickListener(v -> sendFeedback(
                binding.nameEditText.getText().toString(),
                binding.helpCategoryAutoCompleteTextView.getText().toString(),
                binding.messageEditText.getText().toString()
        ));
    }

    private void sendFeedback(String name, String helpCategory, String message) {
        Intent intent = new Intent(Intent.ACTION_SENDTO);
        intent.setData(Uri.parse("mailto:"));
        intent.putExtra(Intent.EXTRA_EMAIL, new String[]{"contactus@babyitem.com"});
        intent.putExtra(Intent.EXTRA_SUBJECT, "Contact Us Feedback");
        intent.putExtra(Intent.EXTRA_TEXT, "Name: " + name + "\n\nHelp Category: " + helpCategory + "\n\nMessage: " + message);

        if (intent.resolveActivity(getPackageManager()) != null) {
            startActivity(intent);
        } else {
            Toast.makeText(this, "No email app found", Toast.LENGTH_SHORT).show();
        }
    }



}