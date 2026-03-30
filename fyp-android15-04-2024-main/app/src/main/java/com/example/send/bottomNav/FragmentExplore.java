package com.example.send.bottomNav;


import android.app.Activity;
import android.content.Context;
import android.content.Intent;


import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;


import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.util.Base64;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import androidx.appcompat.widget.SearchView;
import androidx.viewpager2.widget.ViewPager2;


import android.widget.TextView;
import android.widget.Toast;


import com.denzcoskun.imageslider.ImageSlider;
import com.denzcoskun.imageslider.constants.ScaleTypes;
import com.denzcoskun.imageslider.interfaces.ItemClickListener;
import com.denzcoskun.imageslider.models.SlideModel;
import com.example.send.Explore.DonationFragment;
import com.example.send.Explore.NearByFragment;
import com.example.send.Explore.RequestFragment;
import com.example.send.R;
import com.example.send.activities.AnnouncementPage;
import com.example.send.activities.DonateItemDataActivity;
import com.example.send.activities.ImageSearchResult;
import com.example.send.activities.Search;
import com.example.send.activities.SearchResult;
import com.example.send.activities.UserCollection;
import com.example.send.chat.UsersListActivity;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.material.tabs.TabLayout;
import com.makeramen.roundedimageview.RoundedImageView;
import com.squareup.picasso.Picasso;


import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


import okhttp3.MediaType;
import okhttp3.MultipartBody;

import okhttp3.RequestBody;
import okhttp3.ResponseBody;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;


public class FragmentExplore extends Fragment {

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private PreferenceManager preferenceManager;

    private ImageSlider imageSlider;

    private ImageButton ibtUserCollectItem;

    private ImageButton btnimagesearch , btn_chat;

    private ActivityResultLauncher<Intent> activityResultLauncher;

    private TextView searchTextView;

    private FrameLayout frameLayoutEXPLORE;

    private TabLayout tabLayout;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view =  inflater.inflate(R.layout.fragment_explore, container, false);



        activityResultLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        // 当从 UserCollection 返回时，执行您的刷新逻辑
                        refreshFragment();  // 刷新 Fragment
                    }});


        searchTextView = (TextView) view.findViewById(R.id.tv_search);
        searchTextView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getContext(), Search.class);
                activityResultLauncher.launch(intent);
            }
        });


        btn_chat = (ImageButton) view.findViewById(R.id.btn_chat);
        btn_chat.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getContext(), UsersListActivity.class);
                startActivity(intent);
            }
        });



        ibtUserCollectItem = (ImageButton) view.findViewById(R.id.btn_collect_item);

        ibtUserCollectItem.setOnClickListener(v -> {
            Intent intent = new Intent(getContext(), UserCollection.class);
            activityResultLauncher.launch(intent);
        });


        imageSlider = (ImageSlider) view.findViewById(R.id.image_slider);
        loadAnnouncement();




        frameLayoutEXPLORE = (FrameLayout) view.findViewById(R.id.frameLayoutEXPLORE);

        tabLayout = (TabLayout) view.findViewById(R.id.tabLayout);

        // 初始化時顯示第一個標籤對應的Fragment
        if (getFragmentManager() != null) {
            getFragmentManager().beginTransaction().replace(R.id.frameLayoutEXPLORE, new DonationFragment()).commit();
        }

        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                Fragment fragment = null;
                switch (tab.getPosition()) {
                    case 0:
                        fragment = new DonationFragment();
                        break;
                    case 1:
                        fragment = new RequestFragment();
                        break;
                    case 2:
                        fragment = new NearByFragment();
                        break;

                }
                if (fragment != null) {
                    if (getFragmentManager() != null) {
                        getFragmentManager().beginTransaction().replace(R.id.frameLayoutEXPLORE, fragment).commit();
                    }
                }
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {
                // 這裡通常不需要處理
            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {
                // 這裡可以處理重新選擇標籤的行為，如果需要的話
            }
        });




        return  view;
    }


    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        btnimagesearch = (ImageButton) view.findViewById(R.id.btn_imagesearch);
        btnimagesearch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openGallery();
            }
        });


    }


    public void refreshFragment(){
        if (getFragmentManager() != null) {
            getFragmentManager().beginTransaction().replace(R.id.frameLayoutEXPLORE, new DonationFragment()).commit();
        }
    }






    private static final int PICK_IMAGE_REQUEST = 1;

    private void openGallery() {
        Intent galleryIntent = new Intent(Intent.ACTION_PICK,
                android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(galleryIntent, PICK_IMAGE_REQUEST);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == PICK_IMAGE_REQUEST && resultCode == Activity.RESULT_OK && data != null) {
            Uri selectedImage = data.getData();

            try {
                Bitmap bitmap = MediaStore.Images.Media.getBitmap(requireContext().getContentResolver(), selectedImage);
                File file = new File(requireContext().getCacheDir(), "temp_image.jpg");
                FileOutputStream fos = new FileOutputStream(file);
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos);
                fos.flush();
                fos.close();

                // Pass the file path to the ImageSearchResult activity
                Intent intent = new Intent(getContext(), ImageSearchResult.class);
                intent.putExtra("imagePath", file.getAbsolutePath());
                startActivity(intent);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private String encodeToBase64(Bitmap image, Bitmap.CompressFormat compressFormat, int quality) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        image.compress(compressFormat, quality, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }



    public void loadAnnouncement(){

        ArrayList<SlideModel> slideModels = new ArrayList<>();

        preferenceManager = new PreferenceManager(getContext());
        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        token = "Bearer " + token;
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink) // 替换为你的API基础URL
                .addConverterFactory(GsonConverterFactory.create())
                .build();


        AnnouncementService announcementService = retrofit.create(AnnouncementService.class);
        Call<List<Announcement>> call = announcementService.getAnnouncement(token);


        call.enqueue(new Callback<List<Announcement>>() {
            @Override
            public void onResponse(Call<List<Announcement>> call, Response<List<Announcement>> response) {
                if (response.isSuccessful()) {
                    final List<Announcement> announcementList = response.body(); // 將其聲明為final以便在點擊監聽器內部訪問
                    if (announcementList != null) {
                        for (Announcement announcement : announcementList) {
                            String announcementImage = announcement.getAnnouncement_Image();
                            SlideModel slideModel = new SlideModel(apilink + announcementImage.replace("\\", "/"), ScaleTypes.FIT);
                            slideModels.add(slideModel);
                        }
                        imageSlider.setImageList(slideModels);

                        // 在循環外部設置項目點擊監聽器
                        imageSlider.setItemClickListener(new ItemClickListener() {
                            @Override
                            public void onItemSelected(int i) {
                                // 根據點擊位置獲取公告
                                Announcement clickedAnnouncement = announcementList.get(i);
                                openAnnouncementPage(clickedAnnouncement);
                            }
                        });
                    }
                } else {
                    showToast("Failed to load announcement");
                }
            }

            @Override
            public void onFailure(Call<List<Announcement>> call, Throwable t) {
                showToast("Error: " + t.getMessage());
            }
        });
    }

    public class Announcement{
        private String Announcement_Title;
        private String Announcement_Image;

        private String Announcement_Content;

        private String Announcement_DateTime;

        public String getAnnouncement_Image() {
            return Announcement_Image;
        }

        public String getAnnouncement_Title() {return Announcement_Title;}

        public String getAnnouncement_Content() {return Announcement_Content;}

        public String getAnnouncement_DateTime() {return Announcement_DateTime;}

    }

    public interface AnnouncementService {
        @GET("/androidgetallannouncementdata")
        Call<List<Announcement>> getAnnouncement(
                @Header("Authorization") String token);
    }

    public void openAnnouncementPage(Announcement announcement) {
        Intent intent = new Intent(getContext(), AnnouncementPage.class);
        intent.putExtra("Announcement_Title", announcement.getAnnouncement_Title());
        intent.putExtra("Announcement_Image", apilink + announcement.getAnnouncement_Image().replace("\\", "/"));
        intent.putExtra("Announcement_Content", announcement.getAnnouncement_Content());
        intent.putExtra("Announcement_DateTime", announcement.getAnnouncement_DateTime());
        startActivity(intent);
    }


    public void showToast(String message){
        if(getContext() != null) {
            Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
        } else {
            Log.e("TabExplore", "Context is null, cannot show toast");
        }
    }


}