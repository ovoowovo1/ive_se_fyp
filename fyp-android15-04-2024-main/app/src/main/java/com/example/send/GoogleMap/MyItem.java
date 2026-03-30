package com.example.send.GoogleMap;

import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.LatLng;
import com.google.maps.android.clustering.ClusterItem;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class MyItem implements ClusterItem {
    private LatLng position;
    private String title;
    private BitmapDescriptor icon;

    private String donationId;

    private String name;
    private String donationType;

    private String date;

    private String location;


    public MyItem(LatLng position, String title , String donationId ,String name ,String donationType , String date , String location){
        this.position = position;
        this.title = title;
        this.donationId = donationId;
        this.name = name;
        this.donationType = donationType;
        this.date = date;
        this.location = location;
    }

    @Override
    public LatLng getPosition() {
        return position;
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getSnippet() {
        return null;
    }

    public void setIcon(BitmapDescriptor icon) {
        this.icon = icon;
    }

    public BitmapDescriptor getIcon() {
        return icon;
    }

    public String getDonationId() {
        return donationId;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return donationType;
    }

    public String getDate() {

        return utcTime(date);
    }

    public String getLocation() {
        return location;
    }

    private String utcTime(String date){
        ZonedDateTime utcDate = ZonedDateTime.parse(date);


        ZonedDateTime utcPlus8 = utcDate.withZoneSameInstant(ZoneId.of("UTC+8"));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        String formattedDate = utcPlus8.format(formatter);
        return formattedDate;
    }

}