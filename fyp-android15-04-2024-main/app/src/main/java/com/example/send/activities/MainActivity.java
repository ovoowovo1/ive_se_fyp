package com.example.send.activities;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager2.widget.ViewPager2;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.FrameLayout;

import com.example.send.Notifications.NotificationsActivity;
import com.example.send.R;
import com.example.send.bottomNav.FragmentExplore;
import com.example.send.bottomNav.FragmentForYou;

import com.example.send.bottomNav.FragmentMe;
import com.example.send.chat.UsersListActivity;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationBarView;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.messaging.FirebaseMessaging;

import org.w3c.dom.Document;

public class MainActivity extends AppCompatActivity {


    private ViewPager2 viewPager2;
    //ViewPagerAdapter viewPagerAdapter;
    private BottomNavigationView bottomNavigationView;

    private PreferenceManager preferenceManger;
    private FrameLayout frameLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        viewPager2 = findViewById(R.id.viewPager);
        bottomNavigationView = findViewById(R.id.bottomNav);
        frameLayout = findViewById(R.id.frameLayout);
        preferenceManger = new PreferenceManager(getApplicationContext());

        // Initialize with the explore fragment
        getSupportFragmentManager().beginTransaction().replace(R.id.frameLayout, new FragmentExplore()).commit();

        bottomNavigationView.setOnItemSelectedListener(new NavigationBarView.OnItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                frameLayout.setVisibility(View.VISIBLE);
                viewPager2.setVisibility(View.GONE);
                int itemId = item.getItemId();
                if (itemId == R.id.bottom_explore) {
                    getSupportFragmentManager().beginTransaction().replace(R.id.frameLayout, new FragmentExplore()).commit();
                    return true;
                } else if (itemId == R.id.bottom_forYou) {
                    getSupportFragmentManager().beginTransaction().replace(R.id.frameLayout, new FragmentForYou()).commit();
                    return true;
                }  else if (itemId == R.id.bottom_me) {
                    getSupportFragmentManager().beginTransaction().replace(R.id.frameLayout, new FragmentMe()).commit();
                    return true;
                } else if(itemId == R.id.bottom_add){
                    Intent intent = new Intent(MainActivity.this, ChooseDonateRequestActivity.class);
                    startActivity(intent);

                }else if(itemId == R.id.bottom_activity){
                    Intent intent = new Intent(MainActivity.this, NotificationsActivity.class);
                    startActivity(intent);

                }
                return false;
            }
        });

        // Manually set the bottom navigation item to be selected
       bottomNavigationView.setSelectedItemId(R.id.bottom_explore);


        FirebaseMessaging.getInstance().subscribeToTopic("android_user")
                .addOnCompleteListener(new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        String msg = "Done";
                        if (!task.isSuccessful()) {
                            msg = "Failed";
                        }

                    }
                });


    }


}