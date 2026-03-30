package com.example.send.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.bumptech.glide.Glide;
import com.example.send.R;
import com.example.send.databinding.ActivityAnnouncementPageBinding;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class AnnouncementPage extends AppCompatActivity {

    private ActivityAnnouncementPageBinding binding;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_announcement_page);

        binding = ActivityAnnouncementPageBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        String title = getIntent().getStringExtra("Announcement_Title");
        String imageUrl = getIntent().getStringExtra("Announcement_Image");
        String content = getIntent().getStringExtra("Announcement_Content");

        String dateTime = getIntent().getStringExtra("Announcement_DateTime");
        dateTime = convertUtcToGmt8(dateTime);

        binding.tvAnnouncementDateTime.setText("Announcement time: " + dateTime);
        binding.tvAnnouncementTitle.setText(title);
        binding.tvAnnouncementContent.setText(content);


        Glide.with(this)
                .load(imageUrl)
                .into(binding.ivAnnouncementImage);

    }

    private String convertUtcToGmt8(String utcDateTime) {
        try {
            // 解析 UTC 时间字符串为 Date 对象
            SimpleDateFormat utcFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            utcFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date parsedDate = utcFormat.parse(utcDateTime);

            // 格式化 Date 对象为 GMT+8 时间字符串
            SimpleDateFormat gmt8Format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA);
            gmt8Format.setTimeZone(TimeZone.getTimeZone("GMT+8"));
            return gmt8Format.format(parsedDate);
        } catch (ParseException e) {
            e.printStackTrace();
            return "時間格式錯誤";
        }
    }




}