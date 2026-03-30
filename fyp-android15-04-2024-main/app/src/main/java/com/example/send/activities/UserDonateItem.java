package com.example.send.activities;


import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import androidx.core.content.ContextCompat;

import android.app.DatePickerDialog;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.util.TypedValue;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.databinding.ActivitySignInBinding;
import com.example.send.databinding.ActivityUserDonateItemBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.gson.annotations.SerializedName;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.PartMap;
import retrofit2.http.Path;

public class UserDonateItem extends AppCompatActivity {

    private static final int PICK_IMAGES = 1;
    private ArrayList<ImageView> imageViews = new ArrayList<>();
    private ArrayList<Uri> imageUris = new ArrayList<>();

    private Spinner spinnerItemType;

    private String[] itemType;
    private String[] conditionType;

    private String[] mikePowderType;

     private String apilink = "http://10.0.2.2:8081/";
     private  String apilinkPython = "http://10.0.2.2:5001/";

   //private String apilink = "http://192.168.137.1:8081/";
   //private  String apilinkPython = "http://192.168.137.1:5001/";
    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilinkPython)
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    private ActivityUserDonateItemBinding binding;

    private boolean showOrHide = false; // false = hide, true = show

    private String selectedValue = null;



    private ConstraintSet constraintSet = new ConstraintSet();

    private PreferenceManager preferenceManager;

    private List<String> itemTypeList;

    private ArrayAdapter<String> itemTypeAdapter;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_donate_item);

        preferenceManager = new PreferenceManager(this);

        binding = ActivityUserDonateItemBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        //change the button color to green
        binding.btnListIt.setBackgroundColor(ContextCompat.getColor(this, R.color.green));


        imageViews.add(findViewById(R.id.imageView1));
        imageViews.add(findViewById(R.id.imageView2));
        imageViews.add(findViewById(R.id.imageView3));
        imageViews.add(findViewById(R.id.imageView4));
        imageViews.add(findViewById(R.id.imageView5));

        spinnerItemType = findViewById(R.id.spinnerItemType);

        //itemType = getResources().getStringArray(R.array.items_type);
        conditionType = getResources().getStringArray(R.array.condition_group);

       // ArrayAdapter<String> itemTypeAdapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, itemType);
       // spinnerItemType.setAdapter(itemTypeAdapter);
        // Initialize itemTypeList here
        itemTypeList = new ArrayList<>();
        loadItemType();

        ArrayAdapter<String> conditionTypeAdapter = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, conditionType);
        binding.spinnerCondition.setAdapter(conditionTypeAdapter);


        spinnerItemType.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {

                selectedValue = parent.getItemAtPosition(position).toString();
                showToast(selectedValue);
                loadAttributeData(selectedValue);
                showOrHide = true;
                showOrHide(view);

            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                // 這個方法會在Spinner沒有選擇任何項目時調用
            }
        });


        for (ImageView imageView : imageViews) {
            imageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    int index = imageViews.indexOf(v);
                    if (index != -1 && index < imageUris.size()) {
                        new AlertDialog.Builder(UserDonateItem.this)
                                .setTitle("Delete")
                                .setMessage("Do you really want to delete this image?")
                                .setPositiveButton(android.R.string.yes, (dialog, whichButton) -> {
                                    imageUris.remove(index);
                                    refreshImageViews();
                                })
                                .setNegativeButton(android.R.string.no, null).show();
                    } else if (imageUris.size() < imageViews.size()) {
                        Intent intent = new Intent();
                        intent.setType("image/*");
                        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                        intent.setAction(Intent.ACTION_GET_CONTENT);
                        startActivityForResult(Intent.createChooser(intent, "Select Pictures"), PICK_IMAGES);
                    }
                }
            });
        }
    }

    public void loadItemType() {
        Retrofit retrofititemtype = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        ItemtypeApi service = retrofititemtype.create(ItemtypeApi.class);
        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String userId = preferenceManager.getString(Constants.SQL_USER_ID);
        showToast("this is UserID " + userId);
        String authToken = "Bearer " + token;

        Call<List<Itemtype>> call = service.getItemtype(authToken);
        call.enqueue(new Callback<List<Itemtype>>() {
            @Override
            public void onResponse(Call<List<Itemtype>> call, Response<List<Itemtype>> response) {
                if (response.isSuccessful()) {
                    List<Itemtype> itemtypes = response.body();
                    if (itemtypes != null) {
                        showToast("Response body is not null.");
                        for (Itemtype itemtype : itemtypes) {
                            String itemType = itemtype.getItemType();
                            if (itemType != null) {
                                showToast("add item type " + itemType);
                                itemTypeList.add(itemType);
                            }
                        }
                        itemTypeAdapter = new ArrayAdapter<>(getApplicationContext(), android.R.layout.simple_spinner_item, itemTypeList);
                        spinnerItemType.setAdapter(itemTypeAdapter);
                    } else {
                        showToast("Response body is null.");
                    }
                } else {
                    showToast("Error code: " + response.code());
                }

                // Log the response for troubleshooting
                Log.d("ItemTypeResponse", "Response: " + response.toString());
            }

            @Override
            public void onFailure(Call<List<Itemtype>> call, Throwable t) {
                showToast("Error: " + t.getMessage());
            }
        });
    }

    public void loadAttributeData(String name) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        getAttributeDataService service = retrofit.create(getAttributeDataService.class);
        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String authToken = "Bearer " + token;

        Call<List<AttributeData>> call = service.getAttribute(authToken, name);
        call.enqueue(new Callback<List<AttributeData>>() {
            @Override
            public void onResponse(Call<List<AttributeData>> call, Response<List<AttributeData>> response) {
                if(response.isSuccessful()){
                    LinearLayout optionalDetailsLayout = findViewById(R.id.optionalDetails);
                    optionalDetailsLayout.removeAllViews(); // 移除所有視圖

                    for (AttributeData attribute : response.body()) {
                        switch (attribute.getAttribute_Type()) {
                            case "textbox":
                                createEditText(attribute, optionalDetailsLayout);
                                break;
                            case "select":
                                createSpinner(attribute, optionalDetailsLayout);
                                break;
                            case "radiobutton":
                                createRadioGroup(attribute, optionalDetailsLayout);
                                break;
                            case "datepicker":
                                createDatePickerButton(attribute, optionalDetailsLayout);
                                break;
                            default:
                                showToast("Unknown Type: " + attribute.getAttribute_Type());
                                break;
                        }
                    }
                }else{
                    showToast("Error code: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<AttributeData>> call, Throwable t) {
                showToast("Error: " + t.getMessage());
            }
        });
    }


    // 方法来创建TextView
    private void createTextView(AttributeData attribute, LinearLayout parentLayout) {
        TextView textView = new TextView(this);
        textView.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        textView.setText(attribute.getAttribute_Name());
        parentLayout.addView(textView);
    }

    // 方法来创建EditText
    private void createEditText(AttributeData attribute, LinearLayout parentLayout) {
        EditText editText = new EditText(this);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        layoutParams.setMargins(0, 8, 0, 8); // 设置一些边距，可以根据需要调整
        editText.setLayoutParams(layoutParams);
        editText.setHint(attribute.getAttribute_Name()); // 设置提示文本为属性名称
        editText.setTag(attribute.getAttribute_Name()); // 设置标签为属性名称
        parentLayout.addView(editText);
    }

    // 方法来创建Spinner
    private void createSpinner(AttributeData attribute, LinearLayout parentLayout) {
        createTextView(attribute, parentLayout);
        Spinner spinner = new Spinner(this);
        spinner.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        // 添加提示作为第一个选项
        List<String> optionsWithPrompt = new ArrayList<>(attribute.getOptions());
        optionsWithPrompt.add(0, "please select");

        ArrayAdapter<String> spinnerArrayAdapter = new ArrayAdapter<>(
                this, android.R.layout.simple_spinner_dropdown_item, optionsWithPrompt);
        spinner.setAdapter(spinnerArrayAdapter);
        spinner.setTag(attribute.getAttribute_Name()); // 设置标签为属性名称
        parentLayout.addView(spinner);
    }

    // 方法来创建RadioGroup和RadioButton
    private void createRadioGroup(AttributeData attribute, LinearLayout parentLayout) {
        createTextView(attribute, parentLayout);
        RadioGroup radioGroup = new RadioGroup(this);
        radioGroup.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        radioGroup.setOrientation(LinearLayout.HORIZONTAL);

        for (String option : attribute.getOptions()) {
            RadioButton radioButton = new RadioButton(this);
            radioButton.setLayoutParams(new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT));
            radioButton.setText(option);
            radioGroup.addView(radioButton);
        }
        radioGroup.setTag(attribute.getAttribute_Name()); // 设置标签为属性名称

        radioGroup.clearCheck(); // 显式清除任何选中的RadioButton

        parentLayout.addView(radioGroup);
    }

    private void createDatePickerButton(AttributeData attribute, LinearLayout parentLayout) {
        createTextView(attribute, parentLayout);

        // 创建并设置按钮
        Button datePickerButton = new Button(this);
        datePickerButton.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        datePickerButton.setText("选择日期"); // 设置按钮文字
        datePickerButton.setTag(attribute.getAttribute_Name());

        // 为按钮设置点击事件监听器
        datePickerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 当按钮被点击时显示日期选择对话框
                showDatePickerDialog(datePickerButton);
            }
        });

        // 将按钮添加到布局中
        parentLayout.addView(datePickerButton);
    }

    private void showDatePickerDialog(final Button datePickerButton) {
        // 获取当前日期作为对话框的默认选项
        final Calendar c = Calendar.getInstance();
        int year = c.get(Calendar.YEAR);
        int month = c.get(Calendar.MONTH);
        int day = c.get(Calendar.DAY_OF_MONTH);

        // 创建并显示日期选择对话框
        DatePickerDialog datePickerDialog = new DatePickerDialog(this,
                new DatePickerDialog.OnDateSetListener() {
                    @Override
                    public void onDateSet(DatePicker view, int year, int monthOfYear, int dayOfMonth) {
                        // 格式化日期
                        String selectedDate = year + "-" + (monthOfYear + 1) + "-" + dayOfMonth;
                        // 更新按钮文本
                        datePickerButton.setText(selectedDate);
                    }
                }, year, month, day);
        datePickerDialog.show();
    }




    private Map<String, String> getUserInput(LinearLayout layout) {
        Map<String, String> userInput = new HashMap<>();
        for (int i = 0; i < layout.getChildCount(); i++) {
            View view = layout.getChildAt(i);
            if (view instanceof EditText) {
                String key = (String) view.getTag();
                String value = ((EditText) view).getText().toString();
                userInput.put(key, value);
            } else if (view instanceof Spinner) {
                String key = (String) view.getTag();
                String value = ((Spinner) view).getSelectedItem().toString();
                userInput.put(key, value);
            } else if (view instanceof RadioGroup) {
                String key = (String) view.getTag();
                RadioGroup radioGroup = (RadioGroup) view;
                int selectedId = radioGroup.getCheckedRadioButtonId();
                if (selectedId != -1) {
                    RadioButton radioButton = radioGroup.findViewById(selectedId);
                    String value = radioButton.getText().toString();
                    userInput.put(key, value);
                }
            }else if (view instanceof DatePicker) {
                String key = (String) view.getTag();
                DatePicker datePicker = (DatePicker) view;
                int year = datePicker.getYear();
                int month = datePicker.getMonth() + 1; // Month is 0-based
                int day = datePicker.getDayOfMonth();
                String value = year + "-" + month + "-" + day;
                userInput.put(key, value);
            }else if (view instanceof Button){
                String key = (String) view.getTag();
                String value = ((Button) view).getText().toString();
                userInput.put(key, value);

            }
            // ...处理其他视图类型...
        }
        return userInput;
    }



    public interface ItemtypeApi {
        @POST("androiddonateclassificationdata")
        Call<List<Itemtype>> getItemtype(@Header("Authorization") String token);
    }

    public interface getAttributeDataService{
        @GET("/getclassification/{name}")
        Call<List<AttributeData>> getAttribute(
                @Header("Authorization") String token,
                @Path("name") String name);
    }


    public class Itemtype {
        @SerializedName("classification_Name")
        private String itemType;

        public String getItemType() {
            return itemType;
        }
    }

    public class AttributeData {
      private String Attribute_Name;
      private String Attribute_Type;
      private String Attribute_DataType;
      private String Attribute_Length;

      private List<String> options;

        public String getAttribute_Name() {
            return Attribute_Name;
        }

        public String getAttribute_Type() {
            return Attribute_Type;
        }

        public String getAttribute_DataType() {
            return Attribute_DataType;
        }

        public String getAttribute_Length() {
            return Attribute_Length;
        }

        public List<String> getOptions() {
            return options;
        }

    }



    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == PICK_IMAGES && resultCode == RESULT_OK) {
            if (data.getClipData() != null) {
                ClipData mClipData = data.getClipData();
                for (int i = 0; i < mClipData.getItemCount(); i++) {
                    Uri imageUri = mClipData.getItemAt(i).getUri();
                    if (imageUris.size() < imageViews.size()) {
                        imageUris.add(imageUri);
                        ImageView imageView = imageViews.get(imageUris.size() - 1);
                        imageView.setImageURI(imageUri);
                        imageView.setPadding(2, 2, 2, 2); // Set padding to 2dp
                        imageView.setTag("user_selected");
                    }
                }

                // Upload the first image
                if (!imageUris.isEmpty()) {
                    uploadImage(imageUris.get(0));
                }

            } else if (data.getData() != null) {
                Uri imageUri = data.getData();
                if (imageUris.size() < imageViews.size()) {
                    imageUris.add(imageUri);
                    ImageView imageView = imageViews.get(imageUris.size() - 1);
                    imageView.setImageURI(imageUri);
                    imageView.setPadding(2, 2, 2, 2); // Set padding to 2dp
                    imageView.setTag("user_selected");
                }

                // Upload the image
                if (!imageUris.isEmpty()) {
                    uploadImage(imageUris.get(0));
                }

            }
        }
    }

    private void refreshImageViews() {
        for (int i = 0; i < imageViews.size(); i++) {
            ImageView imageView = imageViews.get(i);
            if (i < imageUris.size()) {
                imageView.setImageURI(imageUris.get(i));
                imageView.setPadding(2, 2, 2, 2); // Set padding to 2dp
                imageView.setTag("user_selected");
            } else {
                imageView.setImageResource(R.drawable.addone); // Reset to the default image
                imageView.setPadding(30, 30, 30, 30); // Reset padding to 30dp
            }
        }
    }

    public interface UploadAPIs {
        @Multipart
        @POST("/predict")
        Call<ResponseBody> uploadImage(@Part MultipartBody.Part part);
    }

    private void uploadImage(Uri imageUri) {
        if (imageUri == null) {
            showToast("No image selected for uploading.");
            return;
        }

        try {
            // Decode the Uri into a Bitmap
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(this.getContentResolver(), imageUri);

            // Compress the Bitmap as JPEG into a byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);
            byte[] bitmapData = baos.toByteArray();

            // Create a RequestBody
            RequestBody requestBody = RequestBody.create(MediaType.parse("image/jpeg"), bitmapData);

            // Create MultipartBody.Part
            MultipartBody.Part part = MultipartBody.Part.createFormData("image", "image.jpg", requestBody);

            UploadAPIs uploadAPIs = retrofit.create(UploadAPIs.class);

            Call<ResponseBody> call = uploadAPIs.uploadImage(part);
            call.enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    try {
                        JSONObject jsonObject = new JSONObject(response.body().string());
                        String apiItemType = jsonObject.getString("class");
                        setSpinnerItemType(apiItemType);
                        showToast("Image uploaded successfully. Class: " + apiItemType);
                    } catch (JSONException | IOException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    showToast("Failed to upload image");
                    Log.e("Upload error", t.getMessage());

                }
            });
        } catch (IOException e) {
            showToast("Failed to create file from image Uri");
            Log.e("Upload error", e.getMessage());
        }
    }

    public void setSpinnerItemType(String apiItemType) {
        apiItemType = apiItemType.trim();
        showToast(apiItemType);

        switch (apiItemType) {
            case "0 milk powder":
                spinnerItemType.setSelection(5);
                break;
            case "1 baby strolle...":
                spinnerItemType.setSelection(1);
                break;
            case "2 other":
                spinnerItemType.setSelection(6);
                break;
            case "3 baby bottle":
                spinnerItemType.setSelection(0);
                break;
            case "4 crib":
                spinnerItemType.setSelection(2);
                break;
            case "5 diapers":
                spinnerItemType.setSelection(4);
                break;
            case "6 clothes":
                spinnerItemType.setSelection(3);

        }
    }


    public void showOrHide(View view) {

        if ( showOrHide == false ) {
            binding.optionalDetails.setVisibility(View.VISIBLE);
            //the drawableRight change to arrow_up
            binding.tvShowOrHide.setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.ic_arrow_up, 0);
            binding.tvShowOrHide.setText("Hide ");
            showOrHide = true;
        } else {
            binding.optionalDetails.setVisibility(View.GONE);
            //the drawableRight change to arrow_down
            binding.tvShowOrHide.setCompoundDrawablesWithIntrinsicBounds(0, 0, R.drawable.ic_arrow_down, 0);
            binding.tvShowOrHide.setText("Show ");
            showOrHide = false;
        }

    }



    private void showToast(String message) {
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }


    public interface donateItemData {

        @Multipart
        @POST("UserAddDonateItem")
        Call<ResponseBody> donateData(
                @Header("Authorization") String token,
                @Part("userID") RequestBody userId,
                @Part("itemName") RequestBody itemName,
                @Part("itemType") RequestBody itemType,
                @Part("itemStatus") RequestBody itemStatus,
                @Part("itemDescribe") RequestBody itemDescribe,
                @Part List<MultipartBody.Part> images,

                @Part("meetUpBoolean") RequestBody meetUpboolean,
                @Part("mailingAndDeliveryBoolean") RequestBody mailingAndDeliveryboolean,
                @Part("meetUpLocation") RequestBody meetUpLocation,
                @Part("mailingAndDeliveryMethod") RequestBody mailingAndDeliveryMethod,

                @PartMap Map<String, RequestBody> additionalParts
        );
    }


    public void listItems(View view) {


        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apilink)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        donateItemData donateItemData = retrofit.create(donateItemData.class);

        if(checkEmpty()) {
            showToast("cannot be empty");
            return;
        }

        String token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        String userId = preferenceManager.getString(Constants.SQL_USER_ID);
        String authToken = "Bearer " + token;

        String itemName = binding.itemName.getText().toString();
        String itemType = binding.spinnerItemType.getSelectedItem().toString();
        String condition = binding.spinnerCondition.getSelectedItem().toString();
        String description = binding.description.getText().toString();


        String meetUp = "";
        if(binding.ckbMeetUp.isChecked()) {
            meetUp = "T";
        } else {
            meetUp = "F";
        }

        String mailingAndDelivery = "";
        if (binding.ckbMailingAndDelivery.isChecked()) {
            mailingAndDelivery = "T";
        } else {
            mailingAndDelivery = "F";
        }

        String meetUpLocation = binding.etMeetUp.getText().toString();
        String mailingAndDeliveryMethod = binding.etMailingAndDelivery.getText().toString();

        List<MultipartBody.Part> imageParts = new ArrayList<>();
        Bitmap defaultBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.addone);

        for (ImageView imageView : imageViews) {
            // Check if this ImageView has a user-selected image
            if (imageView.getTag() != null && imageView.getTag().equals("user_selected")) {
                Drawable drawable = imageView.getDrawable();
                if (drawable != null) {
                    Bitmap bitmap;
                    if (drawable instanceof BitmapDrawable) {
                        bitmap = ((BitmapDrawable) drawable).getBitmap();
                    } else {
                        continue;  // Skip this iteration if the drawable is not a BitmapDrawable
                    }

                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, bos);
                    byte[] bitmapData = bos.toByteArray();
                    RequestBody requestBody = RequestBody.create(MediaType.parse("image/jpeg"), bitmapData);

                    MultipartBody.Part part = MultipartBody.Part.createFormData("imageFiles", "image.jpg", requestBody);
                    imageParts.add(part);
                }
            }
        }

        // Create RequestBody instances from String
        RequestBody userIdBody = RequestBody.create(MediaType.parse("text/plain"), userId);
        RequestBody itemNameBody = RequestBody.create(MediaType.parse("text/plain"), itemName);
        RequestBody itemTypeBody = RequestBody.create(MediaType.parse("text/plain"), itemType);
        RequestBody conditionBody = RequestBody.create(MediaType.parse("text/plain"), condition);
        RequestBody descriptionBody = RequestBody.create(MediaType.parse("text/plain"), description);

        RequestBody meetUpBody = RequestBody.create(MediaType.parse("text/plain"), meetUp);
        RequestBody mailingAndDeliveryBody = RequestBody.create(MediaType.parse("text/plain"), mailingAndDelivery);
        RequestBody meetUpLocationBody = RequestBody.create(MediaType.parse("text/plain"), meetUpLocation);
        RequestBody mailingAndDeliveryMethodBody = RequestBody.create(MediaType.parse("text/plain"), mailingAndDeliveryMethod);

        Map<String, String> optionalDetails = getUserInput(binding.optionalDetails);
        Map<String, RequestBody> additionalParts = new HashMap<>();
        // 遍历你的HashMap并为每个键值对创建一个RequestBody
        for (Map.Entry<String, String> entry : optionalDetails.entrySet()) {
            showToast(entry.getKey() + ": " + entry.getValue());
            RequestBody requestBody = RequestBody.create(MediaType.parse("text/plain"), entry.getValue());
            additionalParts.put(entry.getKey(), requestBody);
        }





        Call<ResponseBody> call = donateItemData.donateData(authToken, userIdBody, itemNameBody, itemTypeBody, conditionBody, descriptionBody , imageParts ,meetUpBody , mailingAndDeliveryBody, meetUpLocationBody, mailingAndDeliveryMethodBody ,additionalParts);


        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    showToast("Donate item insert  successfully");

                    // 創建一個意圖，以跳轉到MainActivity
                    Intent intent = new Intent(getApplicationContext(), MainActivity.class);

                    // 設置標誌以清除這個活動以及之前打開的任何其他活動
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);

                    // 啟動MainActivity
                    startActivity(intent);

                    // 關閉當前活動
                    finish();

                }else if (response.code() == 403) {
                    // Handle 403 Forbidden status code here
                    try {
                        // Assuming the server response includes a JSON with a message key
                        String responseBody = response.errorBody().string();
                        JSONObject jsonObject = new JSONObject(responseBody);
                        String message = jsonObject.optString("message", "Your donation item was blocked by the system"); // Default message if key not found

                        showAlert("Post Failed", message);

                    } catch (IOException | JSONException e) {
                        // This block catches IOException from response.errorBody().string()
                        // and JSONException from parsing the JSON object
                        e.printStackTrace();
                        showAlert("Post Failed", "An error occurred while processing the error message.");
                    }
                } else {
                    showToast("Update failed. Error code: " + response.code());
                }
            }
            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                showToast("Update failed: " + t.getMessage());
            }
        });
    }


    public boolean checkEmpty() {
        boolean isEmpty = false;

        if (binding.itemName.getText().toString().isEmpty()) {
            // Set the border color to red
            binding.itemName.setBackgroundResource(R.drawable.error_border);
            // Set error message
            binding.itemName.setError("Item name cannot be empty");
            isEmpty = true;
        } else {
            // Set the border color to normal
            binding.itemName.setBackgroundResource(R.drawable.background_input_state);
        }

        if (binding.description.getText().toString().isEmpty()) {
            // Set the border color to red
            binding.description.setBackgroundResource(R.drawable.error_border);
            // Set error message
            binding.description.setError("Description cannot be empty");
            isEmpty = true;
        } else {
            // Set the border color to normal
            binding.description.setBackgroundResource(R.drawable.background_input_state);
        }

        if (!binding.ckbMeetUp.isChecked() && !binding.ckbMailingAndDelivery.isChecked()) {
            showToast("Please select at least one of the deal methods");
            isEmpty = true;
        }
        return isEmpty;
    }

    public void toggleDealMethodEditTextVisibility(View view) {
        // Determine which CheckBox was clicked based on its ID
        int viewId = view.getId();
        EditText editText;

        if (viewId == R.id.ckbMeetUp) {
            editText = findViewById(R.id.etMeetUp);
        } else if (viewId == R.id.ckbMailingAndDelivery) {
            editText = findViewById(R.id.etMailingAndDelivery);
        } else {
            return; // Do nothing if neither CheckBox is clicked
        }

        if (editText.getVisibility() == View.VISIBLE) {
            editText.setVisibility(View.GONE); // Hide the associated EditText
        } else {
            editText.setVisibility(View.VISIBLE); // Show the associated EditText
        }
    }

    private void showAlert(String title, String message) {
        new MaterialAlertDialogBuilder(this)
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton(android.R.string.ok, (dialog, which) -> dialog.dismiss())
                .show();
    }



}
