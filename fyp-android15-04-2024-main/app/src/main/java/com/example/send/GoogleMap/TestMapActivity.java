package com.example.send.GoogleMap;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.Manifest;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.SearchView;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.activities.DonateItemDataActivity;
import com.example.send.activities.UserCollection;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptor;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.material.card.MaterialCardView;
import com.google.maps.android.clustering.ClusterManager;
import com.google.maps.android.clustering.view.DefaultClusterRenderer;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public class TestMapActivity extends AppCompatActivity implements OnMapReadyCallback, ClusterManager.OnClusterItemClickListener<MyItem> {

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private final int FINE_PERMISSION_CODE = 1;
    Location currentLocation;
    FusedLocationProviderClient fusedLocationProviderClient;
    private GoogleMap mMap;
    private ClusterManager<MyItem> clusterManager;
    private PreferenceManager preferenceManager;
    private List<DonateItem> donateItems;

    private SearchView mapSearch;

    private ImageButton btnCloseCardView;

    private MaterialCardView cardView;

    private TextView tvDonationName ,tvDonationType, tvDonationDate , tvDonationLocation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test_map);

        fusedLocationProviderClient = new FusedLocationProviderClient(this);
        cardView = findViewById(R.id.cardView);
        btnCloseCardView = findViewById(R.id.btnCloseCardView);
        tvDonationName = findViewById(R.id.tvDonationName);
        tvDonationType = findViewById(R.id.tvDonationType);
        tvDonationDate = findViewById(R.id.tvDonationDate);
        tvDonationLocation = findViewById(R.id.tvDonationLocation);

        setOnclikListeners();
        getLastLocation();

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);
        setSearchView();
    }

    private void getLastLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, FINE_PERMISSION_CODE);
            return;
        }

        Task<Location> task = fusedLocationProviderClient.getLastLocation();
        task.addOnSuccessListener(new OnSuccessListener<Location>() {
            @Override
            public void onSuccess(Location location) {
                if (location != null) {
                    currentLocation = location;
                    Toast.makeText(getApplicationContext(), currentLocation.getLatitude() + " " + currentLocation.getLongitude(), Toast.LENGTH_SHORT).show();

                    LatLng currentLatLng = new LatLng(22.3935,113.9667);
                    MarkerOptions markerOptions = new MarkerOptions().position(currentLatLng).title("Your current location");
                    markerOptions.icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED));
                    mMap.addMarker(markerOptions);
                    mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(currentLatLng, 12));
                }
            }
        });
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        clusterManager = new ClusterManager<>(this, mMap);
        mMap.setOnCameraIdleListener(clusterManager);
        mMap.setOnMarkerClickListener(clusterManager);

        clusterManager.setOnClusterItemClickListener(this);

        clusterManager.setRenderer(new CustomClusterRenderer(this, mMap, clusterManager));

        addMarkersToClusterManager();
    }

    private void addMarkersToClusterManager() {
        getDonationData();
    }

    private LatLng getLocationFromName(String locationName) {
        Geocoder geocoder = new Geocoder(this);
        List<Address> addressList = null;

        try {
            addressList = geocoder.getFromLocationName(locationName, 1);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (addressList != null && addressList.size() > 0) {
            Address address = addressList.get(0);
            return new LatLng(address.getLatitude(), address.getLongitude());
        }

        return null;
    }

    public void getDonationData() {
        preferenceManager = new PreferenceManager(getApplicationContext());

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        DonateDataApiService service = retrofit.create(DonateDataApiService.class);

        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String authToken = "Bearer " + token;

        Call<List<DonateItem>> call = service.getDonateItems(authToken);
        call.enqueue(new Callback<List<DonateItem>>() {
            @Override
            public void onResponse(Call<List<DonateItem>> call, Response<List<DonateItem>> response) {
                if (response.isSuccessful()) {
                    donateItems = response.body();
                    for (DonateItem donateItem : donateItems) {
                        Log.d("DonateItem", donateItem.getName() + " " + donateItem.getPhoto() + " " + donateItem.getLocation());
                        String name = donateItem.getLocation();
                        if (name == null || name.isEmpty()) {
                            continue;
                        }

                        LatLng loc = getLocationFromName(name + ", Hong Kong");
                        if (loc != null) {
                            String markerTitle = donateItem.getName();

                            int overlapCount = 0;
                            for (MyItem item : clusterManager.getAlgorithm().getItems()) {
                                if (item.getPosition().equals(loc)) {
                                    overlapCount++;
                                }
                            }

                            if (overlapCount > 0) {
                                double offsetDistance = 0.0001 * overlapCount;
                                double offsetAngle = Math.random() * 2 * Math.PI;
                                double offsetLat = loc.latitude + offsetDistance * Math.sin(offsetAngle);
                                double offsetLng = loc.longitude + offsetDistance * Math.cos(offsetAngle);
                                loc = new LatLng(offsetLat, offsetLng);
                            }

                            MyItem item = new MyItem(loc, markerTitle, donateItem.getId() , donateItem.getName() , donateItem.getType(), donateItem.getDate() , donateItem.getLocation());

                            String photoUrl = apilink + donateItem.getPhoto().replace("\\", "/");

                            if (photoUrl != null && !photoUrl.isEmpty()) {
                                Picasso.get().load(photoUrl).into(new Target() {
                                    @Override
                                    public void onBitmapLoaded(Bitmap bitmap, Picasso.LoadedFrom from) {
                                        int targetWidth = 100; // Adjust the target width as needed
                                        int targetHeight = 100; // Adjust the target height as needed

                                        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, false);
                                        BitmapDescriptor icon = BitmapDescriptorFactory.fromBitmap(resizedBitmap);
                                        item.setIcon(icon);
                                        clusterManager.addItem(item);
                                        clusterManager.cluster();
                                    }

                                    @Override
                                    public void onBitmapFailed(Exception e, Drawable errorDrawable) {
                                        Log.e("DonateItem", "Error loading photo: " + e.getMessage());
                                        clusterManager.addItem(item);
                                        clusterManager.cluster();
                                    }

                                    @Override
                                    public void onPrepareLoad(Drawable placeHolderDrawable) {
                                        // Optional: Prepare any placeholder drawable while the photo is loading
                                    }
                                });
                            } else {
                                clusterManager.addItem(item);
                                clusterManager.cluster();
                            }
                        }
                    }
                } else {
                    Log.d("DonateItem", "Failed to get donate items");
                }
            }

            @Override
            public void onFailure(Call<List<DonateItem>> call, Throwable t) {
                Log.e("DonateItem", "Error getting donate items: " + t.getMessage());
            }
        });
    }

    private class CustomClusterRenderer extends DefaultClusterRenderer<MyItem> {
        public CustomClusterRenderer(Context context, GoogleMap map, ClusterManager<MyItem> clusterManager) {
            super(context, map, clusterManager);
        }

        @Override
        protected void onBeforeClusterItemRendered(MyItem item, MarkerOptions markerOptions) {
            super.onBeforeClusterItemRendered(item, markerOptions);

            // Customize the marker icon rendering
            markerOptions.icon(item.getIcon());
        }
    }


    @Override
    public boolean onClusterItemClick(MyItem item) {
        // Show the title when the marker is clicked
        Toast.makeText(this, item.getTitle(), Toast.LENGTH_SHORT).show();
        String donationName = item.getTitle();
        String donationType = item.getType();
        String donationDate = item.getDate();
        String donationLocation = item.getLocation();

        tvDonationName.setText(donationName);
        tvDonationType.setText(donationType);
        tvDonationDate.setText(donationDate);
        tvDonationLocation.setText(donationLocation);

        cardView.setVisibility(View.VISIBLE);

        // Example: Setting an OnClickListener for the "View Street Scene" button
        findViewById(R.id.btnViewStreetScene).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                LatLng latLng = item.getPosition();
                openStreetView(latLng);
            }
        });

        // Example: Setting an OnClickListener for the "View Donation Details" button
        findViewById(R.id.btnViewDonationDetails).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Intent to navigate to the Donation Item Details page
                Intent intent = new Intent(TestMapActivity.this, DonateItemDataActivity.class);
                intent.putExtra("Donate_Item_ID", item.getDonationId());
                startActivity(intent);
            }
        });

        return true;
    }


    private void setSearchView() {
        mapSearch = findViewById(R.id.mapSearch);
        mapSearch.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                LatLng location = getLocationFromName(query);
                if (location != null) {
                    mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(location, 12));
                } else {
                    Toast.makeText(TestMapActivity.this, "Location not found", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                return false;
            }
        });
    }

    private void openStreetView(LatLng latLng) {
        Uri streetViewUri = Uri.parse("google.streetview:cbll=" + latLng.latitude + "," + latLng.longitude);
        Intent streetViewIntent = new Intent(Intent.ACTION_VIEW, streetViewUri);
        streetViewIntent.setPackage("com.google.android.apps.maps");

        if (streetViewIntent.resolveActivity(getPackageManager()) != null) {
            startActivity(streetViewIntent);
        } else {
            Toast.makeText(this, "Street View not available", Toast.LENGTH_SHORT).show();
        }
    }


    public interface DonateDataApiService {
        @GET("getMapDonationItemData")
        Call<List<DonateItem>> getDonateItems(@Header("Authorization") String token);
    }



    public class DonateItem {
        private String id;
       private String name;
       private String photo;

       private String location = null;

       private String date ;

       private String type;

       public DonateItem(String id, String name, String photo, String location ,String date , String type){
           this.id = id;
           this.name = name;
           this.photo = photo;
           this.location = location;
           this.date = date;
              this.type = type;
       }

         public String getId() {
              return id;
         }

            public String getName() {
                return name;
            }

            public String getPhoto() {
                return photo;
            }

            public String getLocation() {
                return location;
            }

            public String getDate() {
                return date;
            }

            public String getType() {
                return type;
            }

    }


    private void setOnclikListeners() {
        btnCloseCardView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                cardView.setVisibility(View.GONE);
            }
        });
    }



}