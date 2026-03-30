package com.example.send.Notifications;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.util.Log;

import com.example.send.R;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.firebase.firestore.DocumentChange;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import androidx.appcompat.widget.Toolbar;
import android.widget.TextView;


import java.util.ArrayList;
import java.util.List;

public class NotificationsActivity extends AppCompatActivity {
    private FirebaseFirestore db = FirebaseFirestore.getInstance();
    private List<Notification> notificationsList = new ArrayList<>();
    private RecyclerView recyclerView;
    private NotificationsAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        TextView toolbarTitle = findViewById(R.id.toolbarTitle);
        toolbarTitle.setText("Notifications"); // Set your toolbar title here
        getSupportActionBar().setDisplayShowTitleEnabled(false); // Optional: if you want to use a custom TextView inside the Toolbar for the title


        recyclerView = findViewById(R.id.notificationsRecyclerView); // Make sure this ID matches your layout
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new NotificationsAdapter(this, notificationsList);
        recyclerView.setAdapter(adapter);

        loadNotifications();
    }

    private void loadNotifications() {
        String currentUserId = getCurrentUserId();
        Log.d("LoadNotifications", "Current user ID: " + currentUserId); // Log current user ID

        db.collection("notifications")
                .whereEqualTo("userId", currentUserId)
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .addSnapshotListener(new EventListener<QuerySnapshot>() {
                    @Override
                    public void onEvent(@Nullable QuerySnapshot snapshots, @Nullable FirebaseFirestoreException e) {
                        if (e != null) {
                            Log.w("LoadNotifications", "Listen failed.", e);
                            return;
                        }

                        Log.d("LoadNotifications", "Snapshot listener triggered"); // Log snapshot trigger
                        notificationsList.clear(); // Clear the list before adding new data
                        Log.d("LoadNotifications", "Clearing notifications list"); // Log clearing list

                        for (DocumentChange dc : snapshots.getDocumentChanges()) {
                            if (dc.getType() == DocumentChange.Type.ADDED) {
                                Notification notification = dc.getDocument().toObject(Notification.class);
                                Log.d("LoadNotifications", "Adding notification: " + notification.getMessage()); // Log added notification
                                notificationsList.add(notification);
                            }
                        }

                        adapter.notifyDataSetChanged(); // Notify adapter of data change
                        Log.d("LoadNotifications", "Adapter notified"); // Log adapter notification
                    }
                });
    }


    private String getCurrentUserId() {
        PreferenceManager preferenceManager = new PreferenceManager(getApplicationContext());
        return preferenceManager.getString(Constants.KEY_USER_ID);
    }
}
