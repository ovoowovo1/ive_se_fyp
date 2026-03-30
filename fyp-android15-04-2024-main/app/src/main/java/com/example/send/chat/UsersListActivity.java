package com.example.send.chat;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.activities.DonateItemDataActivity;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.firebase.Timestamp;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.database.annotations.Nullable;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.gson.annotations.SerializedName;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Path;

public class UsersListActivity extends AppCompatActivity {
        private RecyclerView recyclerView;
        private PreferenceManager preferenceManager;
        private String userId;

        private UsersListAdapter adapter;
        private List<ChatUser> usersList = new ArrayList<>();

        private DonateItemService donateItemService;
        private ListenerRegistration chatListener;
        private UserService userService;
   private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";

        private String token;

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_users_list);

            preferenceManager = new PreferenceManager(getApplicationContext());
            recyclerView = findViewById(R.id.recycler_view);
            recyclerView.setLayoutManager(new LinearLayoutManager(this));
            recyclerView.setHasFixedSize(true);

            userId = preferenceManager.getString(Constants.SQL_USER_ID);
            token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
            token = "Bearer " + token;

            showToast("User ID: " + userId);


            adapter = new UsersListAdapter(usersList);
            recyclerView.setAdapter(adapter);

            fetchChats();


        }

        private void fetchChats() {
            FirebaseFirestore db = FirebaseFirestore.getInstance();
            // Create a reference to the chat collection
            Query query = db.collection("chat")
                    .whereArrayContains("participants", userId)
                    .orderBy("timestamp");

            // Attach a listener to read the data
                 chatListener = query.addSnapshotListener(new EventListener<QuerySnapshot>() {
                @Override
                public void onEvent(@Nullable QuerySnapshot snapshots, @Nullable FirebaseFirestoreException e) {
                    if (e != null) {
                        showToast("Error listening for chat updates: " + e.getMessage());
                        Log.e("fetchChats", "Listen failed.", e);
                        return;
                    }

                    Map<String, ChatUser> chatMap = new HashMap<>();
                    if (snapshots != null) {
                        for (QueryDocumentSnapshot document : snapshots) {
                            // Process the data...
                            // Assuming document contains 'senderId', 'receiverId', 'donateId', 'timestamp'
                            String senderId = document.getString("senderId");
                            String receiverId = document.getString("receiverId");
                            String donateId = document.getString("donateId");
                            String message = document.getString("message");
                            Timestamp timestampObject = document.getTimestamp("timestamp");
                            boolean isRead = document.contains("isRead") ? document.getBoolean("isRead") : false;
                            long timestamp = timestampObject.getSeconds() * 1000;

                           if(senderId == null){
                            Log.d("fetchChats", "senderId is null");
                           }
                            if(receiverId == null){
                                Log.d("fetchChats", "receiverId is null");
                            }
                            if(donateId == null){
                                Log.d("fetchChats", "donateId is null");
                            }
                            if(message == null){
                                Log.d("fetchChats", "message is null");
                            }
                            if(timestampObject == null){
                                Log.d("fetchChats", "timestampObject is null");
                            }


                            String chatPartnerId = senderId.equals(userId) ? receiverId : senderId;
                            String mapKey = chatPartnerId + "-" + donateId;

                            if (!chatMap.containsKey(mapKey)) {
                                ChatUser chatUser = new ChatUser();
                                chatUser.id = chatPartnerId;
                                chatUser.lastMessage = message;
                                chatUser.timestamp = timestamp;
                                chatUser.donateId = donateId;
                                chatUser.unreadCount = !isRead && !senderId.equals(userId) ? 1 : 0;
                                chatMap.put(mapKey, chatUser);
                            } else {
                                ChatUser existingChatUser = chatMap.get(mapKey);
                                if (existingChatUser.timestamp < timestamp) {
                                    existingChatUser.timestamp = timestamp;
                                    existingChatUser.lastMessage = message;
                                    existingChatUser.lastMessageSenderId = senderId;
                                }
                                if (!isRead && !senderId.equals(userId)) {
                                    existingChatUser.unreadCount++;
                                }
                            }
                        }

                        List<ChatUser> chatList = new ArrayList<>(chatMap.values());
                        Collections.sort(chatList, (o1, o2) -> Long.compare(o2.timestamp, o1.timestamp));

                        usersList.clear();
                        usersList.addAll(chatList);
                        adapter.notifyDataSetChanged();
                    }
                }
            });

            // Don't forget to detach the listener when it's no longer needed
            // For example, you might want to remove the listener in the onStop() method of your activity or fragment
            //chatListener.remove();
        }

        public class ChatUser {
            String id;
            String lastMessage;
            String lastMessageSenderId;
            long timestamp;
            String donateId;
            int unreadCount;

            int additionalDonation;  // Assuming this is the right place for it

            // Constructor, getters and setters


            public int getAdditionalDonation() {
                return additionalDonation;
            }

            public void setAdditionalDonation(int additionalDonation) {
                this.additionalDonation = additionalDonation;
            }
        }

        public class UsersListAdapter extends RecyclerView.Adapter<UsersListAdapter.UserViewHolder> {

            private List<UsersListActivity.ChatUser> chatUsers;

            public UsersListAdapter(List<UsersListActivity.ChatUser> chatUsers) {
                this.chatUsers = chatUsers;
            }

            @NonNull
            @Override
            public UserViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
                View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_user, parent, false);
                return new UserViewHolder(view);
            }

            @Override
            public void onBindViewHolder(@NonNull UserViewHolder holder, int position) {
                UsersListActivity.ChatUser chatUser = chatUsers.get(position);
                holder.bind(chatUser);

                if (chatUser.unreadCount > 0) {
                    holder.textViewUnreadCount.setVisibility(View.VISIBLE);
                    holder.textViewUnreadCount.setText(String.valueOf(chatUser.unreadCount));
                } else {
                    holder.textViewUnreadCount.setVisibility(View.GONE);
                }

                // Check if the last message was sent by the logged-in user
                if (chatUser.lastMessageSenderId != null && chatUser.lastMessageSenderId.equals(userId)) {
                    holder.textViewLastMessage.setText("You: " + chatUser.lastMessage);
                } else {
                    holder.textViewLastMessage.setText(chatUser.lastMessage);
                }

            }

            @Override
            public int getItemCount() {
                return chatUsers.size();
            }

            class UserViewHolder extends RecyclerView.ViewHolder {

                TextView textViewUserName, textViewLastMessage, textViewTimestamp, textViewTitle, textViewUnreadCount;
                ImageView imageDonateItem;
                RoundedImageView roundedUserImage;
                RelativeLayout relativeLayout;

                UserViewHolder(View itemView) {
                    super(itemView);
                    textViewUserName = itemView.findViewById(R.id.text_view_username);
                    textViewLastMessage = itemView.findViewById(R.id.text_view_last_message);
                    textViewTimestamp = itemView.findViewById(R.id.text_view_timestamp);
                    textViewTitle = itemView.findViewById(R.id.text_title);
                    imageDonateItem = itemView.findViewById(R.id.image_donation_view_icon);
                    roundedUserImage = itemView.findViewById(R.id.image_view_user_avatar);
                    relativeLayout = itemView.findViewById(R.id.relative_layout_title);
                    textViewUnreadCount = itemView.findViewById(R.id.text_view_unread_count);
                }

                void bind(UsersListActivity.ChatUser chatUser) {
                    relativeLayout.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            Intent intentChat = new Intent(v.getContext(), UserChatActivity.class);
                            intentChat.putExtra("userId", chatUser.id);
                            intentChat.putExtra("DonateId", chatUser.donateId);
                            v.getContext().startActivity(intentChat);
                        }
                    });

                    Retrofit retrofit = new Retrofit.Builder()
                            .baseUrl(apilink)
                            .addConverterFactory(GsonConverterFactory.create())
                            .build();

                    // If donateId starts with "RD", make an API call to get the item_type
                    Log.d("UserViewHolder", "donateId: " + chatUser.donateId);
                    if (chatUser.donateId != null && chatUser.donateId.startsWith("RD")) {
                        Log.d("UserViewHolder", "Fetching item_type for donateId: " + chatUser.donateId);
                        RequestProgressService requestProgressService = retrofit.create(RequestProgressService.class);
                        Call<RequestProgress> call = requestProgressService.getItemType(token, chatUser.donateId);
                        call.enqueue(new Callback<RequestProgress>() {
                            @Override
                            public void onResponse(Call<RequestProgress> call, Response<RequestProgress> response) {
                                if (response.isSuccessful() && response.body() != null) {
                                    String itemType = response.body().getItemType();
                                    textViewTitle.setText(itemType);
                                    roundedUserImage.setImageResource(R.drawable.people);
                                } else {
                                    Log.e("UserViewHolder", "Item type not found: " + response.code());
                                }
                            }

                            @Override
                            public void onFailure(Call<RequestProgress> call, Throwable t) {
                                Log.e("UserViewHolder", "Failed to fetch item type", t);
                            }
                        });
                    } else {
                        userService = retrofit.create(UserService.class);
                        Call<UserImage> userImageCall = userService.getUserImage(token, chatUser.id);
                        userImageCall.enqueue(new Callback<UserImage>() {
                            @Override
                            public void onResponse(Call<UserImage> call, Response<UserImage> response) {
                                if (response.isSuccessful()) {
                                    UserImage userImage = response.body();
                                    if (userImage.getUserImage() == null) {
                                        roundedUserImage.setImageResource(R.drawable.people);
                                    } else {
                                        String imageUrl = apilink + userImage.getUserImage().replace("\\", "/");
                                        Picasso.get().load(imageUrl).into(roundedUserImage);
                                    }
                                } else {
                                    Log.e("UserViewHolder", "Error fetching user image: " + response.code());
                                }
                            }

                            @Override
                            public void onFailure(Call<UserImage> call, Throwable t) {
                                Log.e("UserViewHolder", "Failed to fetch user image", t);
                            }
                        });

                        donateItemService = retrofit.create(DonateItemService.class);
                        Call<Donation> donateItemCall = donateItemService.getDonateItem(token, chatUser.donateId);
                        donateItemCall.enqueue(new Callback<Donation>() {
                            @Override
                            public void onResponse(Call<Donation> call, Response<Donation> response) {
                                if (response.isSuccessful()) {
                                    Donation donation = response.body();
                                    textViewTitle.setText(donation.getDonateItemName());
                                    if (donation.getPhotos() != null && donation.getPhotos().size() > 0) {
                                        String imageUrl = apilink + donation.getPhotos().get(0).getDonatePhoto().replace("\\", "/");
                                        Picasso.get().load(imageUrl).into(imageDonateItem);
                                    }
                                } else {
                                    Log.e("UserViewHolder", "Error fetching donation details: " + response.code());
                                }
                            }

                            @Override
                            public void onFailure(Call<Donation> call, Throwable t) {
                                Log.e("UserViewHolder", "Failed to fetch donation details", t);
                            }
                        });
                    }

                    textViewUserName.setText(chatUser.id); // Ideally, you would want to resolve the actual user name here
                    textViewLastMessage.setText(chatUser.lastMessage);

                    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
                    String formattedDate = dateFormat.format(new Date(chatUser.timestamp));
                    textViewTimestamp.setText(formattedDate);
                }
            }

        }

        public void showToast(String text) {
            Toast.makeText(this, text, Toast.LENGTH_SHORT).show();
        }
    public interface RequestProgressService {
        @GET("/item_type/{donateId}")
        Call<RequestProgress> getItemType(@Header("Authorization") String token, @Path("donateId") String donateId);
    }

    public class RequestProgress {
        @SerializedName("item_type")
        private String itemType;

        public String getItemType() {
            return itemType;
        }
    }




    public interface DonateItemService {
            @GET("/donateitem/{donateitem_id}")
            Call<Donation> getDonateItem(
                    @Header("Authorization") String token,
                    @Path("donateitem_id") String donateItemId);
        }

        public interface UserService {
            @GET("/user/{user_id}")
            Call<UserImage> getUserImage(
                    @Header("Authorization") String token,
                    @Path("user_id") String userId);
        }

        public class Donation {

            @SerializedName("Donate_Item_ID")
            private int donateItemId;

            @SerializedName("Donate_Item_Name")
            private String donateItemName;

            @SerializedName("Donate_Item_type")
            private String donateItemType;

            @SerializedName("Donate_User_ID")
            private String donateUserId;

            @SerializedName("Donate_Item_Post_Date")
            private String donateItemPostDate;

            @SerializedName("Donate_Item_Status")
            private String donateItemStatus;

            @SerializedName("Donate_Status")
            private String donateStatus;

            @SerializedName("Donate_Item_Violation")
            private int donateItemViolation;

            @SerializedName("Donate_Item_Describe")
            private String donateItemDescribe;

            @SerializedName("Donate_Item_Location")
            private String donateItemLocation;

            @SerializedName("Donate_Item_Meetup")
            private String donateItemMeetup;

            @SerializedName("Donate_Item_MeetupLocation")
            private String donateItemMeetupLocation;

            @SerializedName("Donate_Item_MailingDelivery")
            private String donateItemMailingDelivery;

            @SerializedName("Donate_Item_MailingDeliveryMethod")
            private String donateItemMailingDeliveryMethod;

            @SerializedName("photos")
            private List<Photo> photos;

            // Getters and setters for all fields

            public String getDonateItemName() {
                return donateItemName;
            }

            public String getDonateItemStatus() {
                return donateItemStatus;
            }

            public String getDonateUserId() {
                return donateUserId;
            }

            public  String getDonateItemPostDate() {
                return donateItemPostDate;
            }

            public String getDonateItemDescribe() {
                return donateItemDescribe;
            }

            public String getDonateItemType() {
                return donateItemType;
            }

            public String getDonate_Item_Meetup() {
                return donateItemMeetup;
            }

            public String getDonate_Item_MeetupLocation() {
                return donateItemMeetupLocation;
            }

            public String getDonate_Item_MailingDelivery() {
                return donateItemMailingDelivery;
            }

            public String getDonate_Item_MailingDeliveryMethod() {
                return donateItemMailingDeliveryMethod;
            }
            // Getters and Setters...

            public List<Photo> getPhotos() {
                return photos;
            }
        }

        public class Photo {
            @SerializedName("Donate_Photo_ID")
            private int donatePhotoId;

            @SerializedName("Donate_Photo")
            private String donatePhoto;

            public String getDonatePhoto() {
                return donatePhoto;
            }
        }

        public class UserImage {

            @SerializedName("User_image")
            private String userImage;

            public String getUserImage() {
                return userImage;
            }
        }


}

