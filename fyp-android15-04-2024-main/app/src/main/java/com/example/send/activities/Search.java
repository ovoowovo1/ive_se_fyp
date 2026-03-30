package com.example.send.activities;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.Transformation;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.R;
import com.example.send.databinding.ActivitySearchBinding;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;
import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;


public class Search extends AppCompatActivity {

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";
    private PreferenceManager preferenceManager;
    private ActivitySearchBinding binding;

    private RecyclerView rvSearch;

    private ActivityResultLauncher<Intent> searchResultLauncher;
    private List<SearchRecord> searchHistory;

    // Initialize Retrofit service
    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilink)
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);

        searchResultLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                new ActivityResultCallback<ActivityResult>() {
                    @Override
                    public void onActivityResult(ActivityResult result) {
                        if (result.getResultCode() == Activity.RESULT_OK) {
                            // 意味着从 SearchResult 回来了，你可以在这里刷新数据
                            loadSearchHistory();
                            loadSpinnerCategory();
                        }
                    }
                }
        );


        preferenceManager = new PreferenceManager(getApplicationContext());

        binding = ActivitySearchBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        //set the adapter for the spinner conidtion
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(Search.this, android.R.layout.simple_list_item_1, getResources().getStringArray(R.array.condition_group_search));
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        binding.spinnerCondition.setAdapter(adapter);

        //set the adapter for the spinner method
        ArrayAdapter<String> adapter2 = new ArrayAdapter<String>(Search.this, android.R.layout.simple_list_item_1, getResources().getStringArray(R.array.method_group_search));
        adapter2.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        binding.spinnerMethod.setAdapter(adapter2);

        //set the adapter for the spinner category
        loadSpinnerCategory();


        binding.etSearch.requestFocus();
        if (binding.etSearch.requestFocus()) {
            getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE);
        }

        rvSearch = binding.rvSearch;
        rvSearch.setLayoutManager(new LinearLayoutManager(this));
        loadSearchHistory();


        binding.etSearch.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                // 判断是否是“Search”键
                if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                    performSearch(binding.etSearch.getText().toString());
                    return true; // 消费掉事件
                }
                return false; // 未消费事件，继续传递
            }
        });

        binding.tvAdditionOptions.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 切換 LinearLayout 的可見性
                if (binding.llHigherSearch.getVisibility() == View.GONE) {
                    // 使用動畫顯示 LinearLayout
                    expand(binding.llHigherSearch);
                } else {
                    // 使用動畫隱藏 LinearLayout
                    collapse(binding.llHigherSearch);
                }
            }
        });



    }


    private void performSearch(String query) {
        // 关闭软键盘
        InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        in.hideSoftInputFromWindow(binding.etSearch.getWindowToken(), 0);

        insertSearchHistory();

        //clear search bar
        binding.etSearch.setText("");

        // 进行搜索处理，然后跳转到ResultActivity
        Intent intent = new Intent(Search.this, SearchResult.class);
        // 你可以在这里通过intent传递需要的数据
        intent.putExtra("search_query", query);


        int checkedRadioButtonId = binding.radioGroupSort.getCheckedRadioButtonId();

        if (checkedRadioButtonId == R.id.rb_new_to_old) {
            intent.putExtra("search_sort",  "new_to_old");
        } else if (checkedRadioButtonId == R.id.rb_old_to_new) {
            intent.putExtra("search_sort",  "old_to_new");
        } else {
            intent.putExtra("search_sort",  "someHavebug");
        }

        intent.putExtra("search_condition", binding.spinnerCondition.getSelectedItem().toString());
        intent.putExtra("search_method", binding.spinnerMethod.getSelectedItem().toString());
        intent.putExtra("search_category", binding.spinnerType.getSelectedItem().toString());

        searchResultLauncher.launch(intent);

    }

    private  void insertSearchHistory() {

        InsertSearchHistoryApiService insertHistoryApiService = retrofit.create(InsertSearchHistoryApiService.class);

        // Initialize call which will be used to send data
        Call<Void> call = insertHistoryApiService.getDonateItems(
                "Bearer " +  preferenceManager.getString(Constants.SQL_USER_TOKEN),
                binding.etSearch.getText().toString(),
                preferenceManager.getString(Constants.SQL_USER_ID)
        );

        // Execute the call asynchronously. Get a positive or negative callback.
        call.enqueue(new retrofit2.Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                // The network call was a success and we got a response
                if (response.isSuccessful()) {

                } else {
                    showToast("Error: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                showToast("Error: " + t.getMessage());
            }

        });
    }


    private void loadSearchHistory() {
        GetSearchHistoryApiService getSearchHistoryApiService = retrofit.create(GetSearchHistoryApiService.class);
        Call<List<SearchRecord>> call = getSearchHistoryApiService.getSearchHistory(
                "Bearer " +  preferenceManager.getString(Constants.SQL_USER_TOKEN),
                preferenceManager.getString(Constants.SQL_USER_ID)
        );

        call.enqueue(new retrofit2.Callback<List<SearchRecord>>() {
            @Override
            public void onResponse(Call<List<SearchRecord>> call, Response<List<SearchRecord>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    showToast("Success: " + response.message());
                    List<SearchRecord> searchHistory = response.body();
                    SearchAdapter searchAdapter = new SearchAdapter(Search.this, searchHistory);
                    rvSearch.setAdapter(searchAdapter);
                } else {
                    showToast("Error: " + response.message());
                    Log.d("Error", response.message());
                }
            }

            @Override
            public void onFailure(Call<List<SearchRecord>> call, Throwable t) {
                showToast("Error: " + t.getMessage());
                Log.d("Error", t.getMessage());
            }
        });
    }

    private void loadSpinnerCategory(){
        ItemtypeApi itemtypeApi = retrofit.create(ItemtypeApi.class);
        Call<List<Itemtype>> call = itemtypeApi.getItemtype(
                "Bearer " +  preferenceManager.getString(Constants.SQL_USER_TOKEN)
        );

        call.enqueue(new retrofit2.Callback<List<Itemtype>>() {
            @Override
            public void onResponse(Call<List<Itemtype>> call, Response<List<Itemtype>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    showToast("Success: " + response.message());
                    List<Itemtype> itemtypes = response.body();
                    List<String> itemtypeList = new ArrayList<>();
                    for (Itemtype itemtype : itemtypes) {
                        itemtypeList.add(itemtype.getItemType());
                    }
                    ArrayAdapter<String> adapter3 = new ArrayAdapter<String>(Search.this, android.R.layout.simple_list_item_1, itemtypeList);
                    adapter3.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

                    //add the please select option
                    adapter3.insert("Please select", 0);
                    binding.spinnerType.setAdapter(adapter3);
                } else {
                    showToast("Error: " + response.message());
                    Log.d("ErrorSearch", response.message());
                }
            }

            @Override
            public void onFailure(Call<List<Itemtype>> call, Throwable t) {
                showToast("Error: " + t.getMessage());
                Log.d("ErrorSearch", t.getMessage());
            }
        });

    }



    public interface InsertSearchHistoryApiService {
        @POST("androidinsertusersearchitemrecord/{query}/{userID}")
        Call<Void> getDonateItems(
                @Header("Authorization") String token,
                @Path("query") String query,
                @Path("userID") String userID);
    }

    public interface GetSearchHistoryApiService {
        @GET("androidgetusersearchitemrecord/{userID}")
        Call<List<SearchRecord>> getSearchHistory(
                @Header("Authorization") String token,
                @Path("userID") String userID);
    }

    public interface DeleteSearchHistoryApiService {
        @POST("androiddeleteusersearchitemrecord/{recordID}")
        Call<Void> deleteSearchHistory(
                @Header("Authorization") String token,
                @Path("recordID") int recordID);
    }

    public interface ItemtypeApi {
        @POST("androiddonateclassificationdata")
        Call<List<Itemtype>> getItemtype(@Header("Authorization") String token);
    }


    public class SearchRecord {
        @SerializedName("ID")
        private int id;

        @SerializedName("Search_content")
        private String searchContent;

        // Getters and Setters
        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getSearchContent() {
            return searchContent;
        }

        public void setSearchContent(String searchContent) {
            this.searchContent = searchContent;
        }
    }

    public class Itemtype {
        @SerializedName("classification_Name")
        private String itemType;

        public String getItemType() {
            return itemType;
        }
    }

    public void showToast(String message) {
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }

    public class SearchAdapter extends RecyclerView.Adapter<SearchAdapter.SearchViewHolder> {

        private Context context;
        private List<SearchRecord> searchRecords;

        public SearchAdapter(Context context, List<SearchRecord> searchRecords) {
            this.context = context;
            this.searchRecords = searchRecords;
        }

        @NonNull
        @Override
        public SearchViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(context).inflate(R.layout.item_search, parent, false);
            return new SearchViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull SearchViewHolder holder, int position) {
            SearchRecord record = searchRecords.get(position);
            holder.textViewRecord.setText(record.getSearchContent());


            holder.textViewRecord.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    performSearch(record.getSearchContent());
                }
            });

            // Delete search record
            holder.imageViewDelete.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Use getAdapterPosition to get the current position
                    int currentPosition = holder.getAdapterPosition();
                    // It's a good idea to check if the position is valid
                    if (currentPosition != RecyclerView.NO_POSITION) {
                        DeleteSearchHistoryApiService deleteSearchHistoryApiService = retrofit.create(DeleteSearchHistoryApiService.class);
                        Call<Void> call = deleteSearchHistoryApiService.deleteSearchHistory(
                                "Bearer " +  preferenceManager.getString(Constants.SQL_USER_TOKEN),
                                searchRecords.get(currentPosition).getId()
                        );

                        call.enqueue(new retrofit2.Callback<Void>() {
                            @Override
                            public void onResponse(Call<Void> call, Response<Void> response) {
                                if (response.isSuccessful()) {
                                    showToast("Success: " + response.message());
                                    searchRecords.remove(currentPosition);
                                    notifyItemRemoved(currentPosition);
                                    notifyItemRangeChanged(currentPosition, searchRecords.size());
                                } else {
                                    showToast("DeleteError: " + response.message());
                                    Log.d("Error", response.message());
                                }
                            }

                            @Override
                            public void onFailure(Call<Void> call, Throwable t) {
                                showToast("Error: " + t.getMessage());
                                Log.d("Error", t.getMessage());
                            }
                        });
                    }
                }
            });
        }

        @Override
        public int getItemCount() {
            return searchRecords.size();
        }

        public class SearchViewHolder extends RecyclerView.ViewHolder {
            TextView textViewRecord;
            ImageView imageViewDelete;

            public SearchViewHolder(@NonNull View itemView) {
                super(itemView);
                textViewRecord = itemView.findViewById(R.id.tv_record);
                imageViewDelete = itemView.findViewById(R.id.iv_delete);
            }
        }
    }

    public void onBackPressed() {
        Intent returnIntent = new Intent();
        setResult(Activity.RESULT_OK, returnIntent);
        super.onBackPressed();
    }



    public void expand(final View v) {
        v.measure(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        final int targetHeight = v.getMeasuredHeight();

        // 使得 LinearLayout 在開始動畫之前為可見
        v.setVisibility(View.VISIBLE);
        binding.tvAdditionOptions.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_arrow_down, 0, 0, 0);
        // 創建動畫
        Animation animation = new Animation() {
            @Override
            protected void applyTransformation(float interpolatedTime, Transformation t) {
                v.getLayoutParams().height = interpolatedTime == 1
                        ? LinearLayout.LayoutParams.WRAP_CONTENT
                        : (int)(targetHeight * interpolatedTime);
                v.requestLayout();
            }

            @Override
            public boolean willChangeBounds() {
                return true;
            }
        };

        animation.setDuration((int)(targetHeight / v.getContext().getResources().getDisplayMetrics().density));
        v.startAnimation(animation);
    }

    public void collapse(final View v) {
        final int initialHeight = v.getMeasuredHeight();

        //drawable left change to up
        binding.tvAdditionOptions.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_arrow_up, 0, 0, 0);
        Animation animation = new Animation() {
            @Override
            protected void applyTransformation(float interpolatedTime, Transformation t) {
                if(interpolatedTime == 1){
                    v.setVisibility(View.GONE);
                }else{
                    v.getLayoutParams().height = initialHeight - (int)(initialHeight * interpolatedTime);
                    v.requestLayout();
                }
            }

            @Override
            public boolean willChangeBounds() {
                return true;
            }
        };

        animation.setDuration((int)(initialHeight / v.getContext().getResources().getDisplayMetrics().density));
        v.startAnimation(animation);
    }

}