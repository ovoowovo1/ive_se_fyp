package com.example.send.Notifications;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.send.Notifications.Notification; // Ensure this import matches your Notification class location
import com.example.send.R; // Make sure you import R from your project
import java.util.List;

public class NotificationsAdapter extends RecyclerView.Adapter<NotificationsAdapter.ViewHolder> {

    private List<Notification> notificationList;
    private Context context;

    // Constructor
    public NotificationsAdapter(Context context, List<Notification> notificationList) {
        this.context = context;
        this.notificationList = notificationList;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_notification, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        // Get the current notification
        Notification notification = notificationList.get(position);

        // Bind the notification data to the view
        holder.messageTextView.setText(notification.getMessage());
        // Format and display the timestamp, assuming your Timestamp object is a Firebase Timestamp
        holder.timestampTextView.setText(notification.getTimestamp().toDate().toString()); // Adjust formatting as needed

        // You can add more bindings here as per your Notification model attributes
    }

    @Override
    public int getItemCount() {
        return notificationList.size();
    }

    // ViewHolder class to hold the views
    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView messageTextView;
        TextView timestampTextView; // Added reference to the timestamp TextView

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            messageTextView = itemView.findViewById(R.id.notificationMessageTextView);
            timestampTextView = itemView.findViewById(R.id.notificationTimestampTextView); // Initialize the timestamp TextView
        }
    }
}
