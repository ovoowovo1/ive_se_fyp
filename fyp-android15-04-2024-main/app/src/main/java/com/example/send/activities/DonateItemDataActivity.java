package com.example.send.activities;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.FragmentTransaction;

import android.app.Activity;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;


import com.denzcoskun.imageslider.constants.ScaleTypes;
import com.denzcoskun.imageslider.models.SlideModel;

import com.example.send.Explore.DonationFragment;
import com.example.send.Me.MeDonationFragment;
import com.example.send.R;
import com.example.send.Report.SuspiciousAccount;
import com.example.send.chat.UserChatActivity;

import com.example.send.databinding.ActivityDonateItemDataBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.gson.annotations.SerializedName;
import com.squareup.picasso.Picasso;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

import okhttp3.ResponseBody;

public class DonateItemDataActivity extends AppCompatActivity {

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private ActivityDonateItemDataBinding binding;

    private DonateItemService donateItemService;
    private ClassificationService classificationService;
    private DonateitemdetailService donateitemdetailService;
    private UserService userService;
    private isCollectItemService isCollectItemService;

    private PreferenceManager preferenceManager;

    private String classificationName;
    private String token;
    private String DonationID;
    private String userId ; // not is login user id

    private String currentUserId; // is login user id
    private List<Classification> classifications;

    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilink) // 替换为你的API基础URL
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    private DeleteItemService deleteItemService;

    private int checkIsCollectItem = 2; // 0 is no collect, 1 is collect, 2 is error

    private String DonationImage;

    private long startTime;
    private long totalBrowseTime;
    private static final int REQUEST_CODE_PROFILE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_donate_item_data);
        binding = ActivityDonateItemDataBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        preferenceManager = new PreferenceManager(getApplicationContext());
        token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        token = "Bearer " + token;
        currentUserId = preferenceManager.getString(Constants.KEY_USER_ID);



        donateItemService = retrofit.create(DonateItemService.class);

        Intent intent = getIntent();
        DonationID = intent.getStringExtra("Donate_Item_ID");

        // 通过binding来设定UI组件的值
        binding.tvDonationItemName.setText(DonationID);


        // 这里调用非静态方法，通过实例donateItemService来调用
        Call<Donation> donateItemCall = donateItemService.getDonateItem(token, DonationID);

        donateItemCall.enqueue(new Callback<Donation>() {
            @Override
            public void onResponse(Call<Donation> call, Response<Donation> response) {
                if (response.isSuccessful()) {
                    Donation donation = response.body();
                    // 这里可以更新UI
                    // 例如：binding.tvDonationItemName.setText(donation.getDonateItemName());
                    binding.tvDonationItemName.setText(donation.getDonateItemName());
                    binding.tvCondition.setText(donation.getDonateItemStatus());
                    binding.tvDescription.setText(donation.getDonateItemDescribe());
                    binding.tvType.setText(donation.getDonateItemType());
                    displayFormattedDate(donation.getDonateItemPostDate());
                    binding.tvUserID.setText(donation.getDonateUserId());
                    userId = donation.getDonateUserId();
                    classificationName = donation.getDonateItemType();

                    if(userId.equals(currentUserId)){
                        binding.btnChat.setEnabled(false);
                        binding.btnChat.setText("This is your item");
                        binding.btnMoreOptions.setVisibility(binding.btnMoreOptions.VISIBLE);
                        setMenuListener(); // set menu listener
                    }else{
                        binding.btnMoreOptions.setVisibility(binding.btnMoreOptions.VISIBLE);
                        setReportListener();

                        binding.tvUserID.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                //go to user profile
                                Intent intent = new Intent(DonateItemDataActivity.this, AnotherUserProfileActivity.class);
                                intent.putExtra("userId", userId);
                                startActivityForResult(intent, REQUEST_CODE_PROFILE);
                            }
                        });
                    }



                    if (donation.getDonate_Item_Meetup().equals("T")) {
                        binding.tvMeetUp.setText("Meet up: " + donation.getDonate_Item_MeetupLocation());
                    } else {
                        //visable gone
                        binding.llMeetUp.setVisibility(binding.llMeetUp.GONE);
                    }

                    if (donation.getDonate_Item_MailingDelivery().equals("T")) {
                        binding.tvDelivery.setText("Delivery: " + donation.getDonate_Item_MailingDeliveryMethod());
                    } else {
                        //visable gone
                        binding.llDelivery.setVisibility(binding.llDelivery.GONE);
                    }


                    userService = retrofit.create(UserService.class);
                    Call<UserImage> userImageCall = userService.getUserImage(token, donation.getDonateUserId());
                    userImageCall.enqueue(new Callback<UserImage>() {
                        @Override
                        public void onResponse(Call<UserImage> call, Response<UserImage> response) {
                            if (response.isSuccessful()) {
                                UserImage userImage = response.body();
                                if (userImage != null) {
                                    if (userImage.getUserImage() == null) {

                                        binding.imageViewUserAvatar.setImageResource(R.drawable.people);
                                        return;
                                    } else {
                                        String imageUrl = apilink + userImage.getUserImage().replace("\\", "/");
                                        Log.d("photo", imageUrl);
                                        Picasso.get().load(imageUrl).into(binding.imageViewUserAvatar);
                                    }
                                }
                            } else {
                                showToast("Error: " + response.code());
                            }
                        }

                        @Override
                        public void onFailure(Call<UserImage> call, Throwable t) {
                            showToast("Error: " + t.getMessage());
                        }
                    });


                    ArrayList<SlideModel> slideModels = new ArrayList<>();
                    //put Donate_Photo of images in slideModels

                    for (int i = 0; i < donation.getPhotos().size(); i++) {
                        slideModels.add(new SlideModel(apilink + donation.photos.get(i).getDonatePhoto().replace("\\", "/"), ScaleTypes.FIT));
                    }

                    if(donation.getPhotos().size() >= 1){
                        DonationImage = apilink + donation.photos.get(0).getDonatePhoto().replace("\\", "/");
                    }



                    binding.imageSlider.setImageList(slideModels);
                    classificationService = retrofit.create(ClassificationService.class);
                    classificationService.getClassifications(token, classificationName).enqueue(new Callback<List<Classification>>() {
                        @Override
                        public void onResponse(Call<List<Classification>> call, Response<List<Classification>> response) {
                            if (response.isSuccessful()) {
                                classifications = response.body();
                                // 现在可以遍历这个列表并更新UI或执行其他操作了
                                for (Classification classification : classifications) {
                                    // 使用classification对象的数据
                                    // showToast(classification.getAttribute_Name());

                                }


                                donateitemdetailService = retrofit.create(DonateitemdetailService.class);


                                Call<ResponseBody> donateitemdetailCall = donateitemdetailService.getDonatedetail(token, DonationID);
                                donateitemdetailCall.enqueue(new Callback<ResponseBody>() {
                                    @Override
                                    public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                                        if (response.isSuccessful()) {
                                            try {
                                                // 将响应体转换为字符串
                                                String rawJson = response.body().string();

                                                // 解析JSON字符串
                                                JSONObject jsonObject = new JSONObject(rawJson);
                                                // showToast("Response successful");
                                                // 遍历所有的键
                                                Iterator<String> keys = jsonObject.keys();
                                                while (keys.hasNext()) {
                                                    String key = keys.next();
                                                    for (Classification classification : classifications) {
                                                        if (classification.getAttribute_Name().equals(key)) {

                                                            //show tvDetails visable
                                                            binding.tvDetails.setVisibility(binding.tvDetails.VISIBLE);

                                                            // 创建一个新的TextView
                                                            TextView textView = new TextView(DonateItemDataActivity.this);
                                                            textView.setLayoutParams(new LinearLayout.LayoutParams(
                                                                    LinearLayout.LayoutParams.WRAP_CONTENT,
                                                                    LinearLayout.LayoutParams.WRAP_CONTENT));
                                                            // 设置TextView的文本
                                                            textView.setText(String.format("%s:  %s", key, jsonObject.get(key)));
                                                            // 将TextView添加到容器中
                                                            binding.container.addView(textView);
                                                            break;
                                                        }
                                                    }
                                                }
                                            } catch (IOException | JSONException e) {
                                                e.printStackTrace();
                                            }
                                        } else {
                                            // 处理非成功响应
                                            System.out.println("Response not successful");
                                        }
                                    }

                                    @Override
                                    public void onFailure(Call<ResponseBody> call, Throwable t) {
                                        // 处理请求失败的情况
                                        t.printStackTrace();
                                    }
                                });

                            } else {
                                showToast("Classification请求失败");
                            }
                        }

                        @Override
                        public void onFailure(Call<List<Classification>> call, Throwable t) {
                            showToast("Classification请求失败--");
                        }
                    });


                } else {
                    // 获取错误码
                    int statusCode = response.code();

                    // 尝试获取错误响应的body
                    String errorMessage = "请求失败: " + statusCode;

                    showToast(errorMessage);
                }
            }

            @Override
            public void onFailure(Call<Donation> call, Throwable t) {
                // 处理其他错误
                showToast("请求失败");
            }
        });


        isCollectItemService = retrofit.create(isCollectItemService.class);
        Call<isCollectItem> isCollectItemCall = isCollectItemService.getisCollectItem(token, currentUserId, DonationID);
        isCollectItemCall.enqueue(new Callback<isCollectItem>() {
            @Override
            public void onResponse(Call<isCollectItem> call, Response<isCollectItem> response) {

                Log.d("isCollectItem", currentUserId);

                if (response.isSuccessful()) {
                    isCollectItem isCollectItem = response.body();
                    // 这里可以更新UI
                    // 例如：binding.tvDonationItemName.setText(donation.getDonateItemName());
                    if (isCollectItem.getNums() == 1) {
                        //set btnCollect src is red heart
                        binding.btnCollect.setImageResource(R.drawable.ic_like_red);
                        checkIsCollectItem = 1;
                    } else {
                        checkIsCollectItem = 0;
                    }
                } else {
                    // 获取错误码
                    int statusCode = response.code();
                    // 尝试获取错误响应的body
                    String errorMessage = "请求失败: " + statusCode;
                    showToast(errorMessage);
                    Log.d("isCollectItem", errorMessage);
                }
            }

            @Override
            public void onFailure(Call<isCollectItem> call, Throwable t) {
                // 处理其他错误
                showToast("请求失败");
                Log.d("isCollectItem", "请求失败");
            }
        });

        startTime = System.currentTimeMillis();
        setLinstener();
    }


    private void setLinstener() {

        binding.btnChat.setOnClickListener(v -> {
            Intent intentChat = new Intent(DonateItemDataActivity.this, UserChatActivity.class);

            intentChat.putExtra("userId", userId);
            intentChat.putExtra("DonateId", DonationID);
            startActivity(intentChat);
        });


        binding.btnCollect.setOnClickListener(v -> {
            int tempNum = checkIsCollectItem;
            if(checkIsCollectItem == 0){
                //set btnCollect src is red heart
                binding.btnCollect.setImageResource(R.drawable.ic_like_red);
                tempNum = 1;
            }else if(checkIsCollectItem == 1){
                //set btnCollect src is red heart
                binding.btnCollect.setImageResource(R.drawable.ic_like);
                tempNum = 0;
            }else{
                showToast("Error: " + "checkIsCollectItem is error");
                return;
            }

            CollectCancelApiService service = retrofit.create(CollectCancelApiService.class);
            CollectItemRequest request = new CollectItemRequest(currentUserId , DonationID, tempNum);
            Call<ResponseBody> call = service.collectCancel(token, request);

            call.enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    if (response.isSuccessful()) {
                        if(checkIsCollectItem == 0) {
                            showToast("Collect success");
                            checkIsCollectItem = 1;
                        }else if (checkIsCollectItem == 1) {
                            showToast("Cancel success");
                            checkIsCollectItem = 0;
                        }else{
                            showToast("onResponse Error: " + "checkIsCollectItem is error");
                        }

                    } else {
                        showToast("Update failed: " + response.message());
                    }
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    showToast("Update failed: " + t.getMessage());
                }
            });
        });

    }

    private void setMenuListener(){
        binding.btnMoreOptions.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                PopupMenu popup = new PopupMenu(DonateItemDataActivity.this, v);

                popup.inflate(R.menu.options_menu);

                popup.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    @Override
                    public boolean onMenuItemClick(MenuItem item) {
                        int id = item.getItemId();
                        //if click delete
                        if (id == R.id.menu_delete) {

                            new AlertDialog.Builder(DonateItemDataActivity.this)
                                    .setTitle("Confirm Deletion")
                                    .setMessage("Are you sure you want to delete this item?")
                                    .setPositiveButton("Delete", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            // 用户确认删除操作，执行删除逻辑
                                            doDeleteItemService();

                                        }
                                    })
                                    .setNegativeButton("Cancel", null) // 用户不想删除，什么也不做，关闭对话框
                                    .show();

                            return true;
                            //if click edit
                        } else if (id == R.id.menu_edit) {

                            return true;
                        } else {
                            return false;
                        }
                    }
                });

                popup.show();
            }
        });
    }

    private void setReportListener(){
        binding.btnMoreOptions.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                PopupMenu popup = new PopupMenu(DonateItemDataActivity.this, v);

                popup.inflate(R.menu.report_menu);

                popup.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    @Override
                    public boolean onMenuItemClick(MenuItem item) {
                        int id = item.getItemId();
                        //if click delete
                        if (id == R.id.menu_report) {
                            showReportDialog();
                            return true;
                        } else {
                            return false;
                        }
                    }
                });

                popup.show();
            }
        });
    }


    private void showReportDialog() {
        String[] reportItems = {
                "Suspicious Account",
                "Items wrongly categorized",
                "Selling items",
                // ... 其他选项
        };

        ReportItemAdapter adapter = new ReportItemAdapter(DonateItemDataActivity.this, reportItems);

        AlertDialog.Builder builder = new AlertDialog.Builder(DonateItemDataActivity.this);
        builder.setTitle("Why are you reporting this listing?");

        builder.setAdapter(adapter, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                // 'which' 是被点击项的索引
                String selectedReportReason = reportItems[which];
                // 处理选中的报告原因
                handleReport(selectedReportReason);
            }
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    private void handleReport(String reason) {
        Intent intent = new Intent(DonateItemDataActivity.this, SuspiciousAccount.class);
        intent.putExtra("REPORT_REASON", reason);
        intent.putExtra("DONATE_ID", DonationID);

        intent.putExtra("USER_ID", userId);
        intent.putExtra("DonationName", binding.tvDonationItemName.getText().toString());
        intent.putExtra("DonationImage",DonationImage);

        startActivity(intent);
    }


    private void doDeleteItemService(){
        deleteItemService = retrofit.create(DeleteItemService.class);
        Call<Void> deleteItemCall = deleteItemService.deleteItem(token, DonationID);
        deleteItemCall.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    showToast("Delete success");
                    Intent returnIntent = new Intent();
                    setResult(Activity.RESULT_OK, returnIntent);
                    finish();
                } else {
                    showToast("Delete failed: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                showToast("onFailure Delete failed: " + t.getMessage());
            }
        });
    }



    @Override
    public void onBackPressed() {
        Intent returnIntent = new Intent();
        setResult(Activity.RESULT_OK, returnIntent);
        super.onBackPressed();
    }



    @Override
    protected void onPause() {
        super.onPause();

        // Calculate the total browse time
        long endTime = System.currentTimeMillis();
        totalBrowseTime += endTime - startTime;

        // Check if the total browse time exceeds 10 seconds
        if (totalBrowseTime >= 10000 && !currentUserId.equals(userId) ) {
            // Get the current date
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            String currentDate = sdf.format(new Date());

            // Create a JSON object with the data
            JSONObject jsonObject = new JSONObject();
            try {
                jsonObject.put("userId", currentUserId);
                jsonObject.put("itemId", DonationID);
                jsonObject.put("browseTime", totalBrowseTime);
                jsonObject.put("date", currentDate);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            // Send the data to the API
            sendBrowseDataToAPI(jsonObject);
        }
    }


    private void sendBrowseDataToAPI(JSONObject jsonObject) {
        // Create a RequestBody from the JSON object
        RequestBody requestBody = RequestBody.create(MediaType.parse("application/json"), jsonObject.toString());

        // Create a new instance of the API service
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        UserBrowseDonationItemRecordService service = retrofit.create(UserBrowseDonationItemRecordService.class);

        // Make the API call
        Call<ResponseBody> call = service.sendBrowseData(token, requestBody);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    // Browse data sent successfully
                    Log.d("BrowseData", "Browse data sent successfully");
                } else {
                    // Handle error response
                    Log.e("BrowseData", "Error sending browse data: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                // Handle network failure
                Log.e("BrowseData", "Network failure: " + t.getMessage());
            }
        });
    }


    public void showToast(String text) {
        Toast.makeText(this, text, Toast.LENGTH_SHORT).show();
    }


    public interface UserBrowseDonationItemRecordService {
        @POST("/userbrowerdonationitemrecord")
        Call<ResponseBody> sendBrowseData(
                @Header("Authorization") String token,
                @Body RequestBody requestBody
        );
    }


    public interface DonateItemService {
        @GET("/donateitem/{donateitem_id}")
        Call<Donation> getDonateItem(
                @Header("Authorization") String token,
                @Path("donateitem_id") String donateItemId);
    }


    public interface ClassificationService {
        @GET("/getclassification/{name}")
        Call<List<Classification>> getClassifications(
                @Header("Authorization") String token,
                @Path("name") String name);
    }

    public interface DonateitemdetailService {
        @GET("/donateitemdetail/{donateitem_id}")
        Call<ResponseBody> getDonatedetail(
                @Header("Authorization") String token,
                @Path("donateitem_id") String donateItemId);
    }

    public interface UserService {
        @GET("/user/{user_id}")
        Call<UserImage> getUserImage(
                @Header("Authorization") String token,
                @Path("user_id") String userId);
    }

    public interface isCollectItemService {
        @GET("/androidgetusercollectspecificitemdata/{user_id}/{donate_id}")
        Call<isCollectItem> getisCollectItem(
                @Header("Authorization") String token,
                @Path("user_id") String userId,
                @Path("donate_id") String donateItemId);
    }

    public interface CollectCancelApiService {
        @POST("UserCollectDelectItem")
        Call<ResponseBody> collectCancel(@Header("Authorization") String token,
                                         @Body CollectItemRequest collectItemRequest);
    }

    public interface DeleteItemService {
        @POST("androiduserdeletedonateitem/{donate_id}")
        Call<Void> deleteItem(@Header("Authorization") String token,
                              @Path("donate_id") String donateItemId);
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

    private void displayFormattedDate(String rawDate) {
        try {
            // 解析原始字符串为 Date 对象
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            inputFormat.setTimeZone(TimeZone.getTimeZone("UTC")); // 确保按 UTC 解析
            Date parsedDate = inputFormat.parse(rawDate);

            // 格式化 Date 对象为新的字符串
            SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA);
            outputFormat.setTimeZone(TimeZone.getTimeZone("GMT+8")); // 设置时区为 GMT+8
            String formattedDate = outputFormat.format(parsedDate);

            // 将格式化的日期字符串设置到你的 TextView
            binding.tvTime.setText(formattedDate);
        } catch (Exception e) {
            e.printStackTrace();
            // 处理异常或显示错误消息
        }
    }

    public class Classification{
        private String Attribute_Name;
        private String Attribute_Type;
        private String Attribute_DataType;
        private String Attribute_Length;

        public String getAttribute_Name() {
            return Attribute_Name;
        }

    }

    public class UserImage {

        @SerializedName("User_image")
        private String userImage;

        public String getUserImage() {
            return userImage;
        }
    }

    public class isCollectItem {
        private int nums; // if 0 is no collect, if 1 is collect

        public int getNums() {
            return nums;
        }
    }

    public class CollectItemRequest {
        private String User_ID;
        private String Donate_Item_ID;
        private int Collect_Item_Status;

        // Constructor
        public CollectItemRequest(String User_ID, String Donate_Item_ID, int Collect_Item_Status) {
            this.User_ID = User_ID;
            this.Donate_Item_ID = Donate_Item_ID;
            this.Collect_Item_Status = Collect_Item_Status;
        }
    }


    public class ReportItemAdapter extends ArrayAdapter<String> {
        public ReportItemAdapter(@NonNull Context context, String[] reportItems) {
            super(context, R.layout.report_list_item, reportItems);
        }

        @NonNull
        @Override
        public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {
            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.report_list_item, parent, false);
            }

            TextView tvReportItem = convertView.findViewById(R.id.tvReportItem);
            tvReportItem.setText(getItem(position));

            // You can also handle the arrow icon here if needed

            return convertView;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_CODE_PROFILE && resultCode == RESULT_OK) {
            // Refresh the activity
            recreate();
        }
    }



}