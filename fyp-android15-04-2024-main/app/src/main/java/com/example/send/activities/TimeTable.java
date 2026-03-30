package com.example.send.activities;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import com.example.send.Calender.AddFreeTimeActivity;
import com.example.send.Calender.CalendarAdapter;
import com.example.send.Calender.CalendarUtils;
import com.example.send.Calender.FreeTimeAdapter;
import com.example.send.Calender.UserFreeTime;
import com.example.send.R;
import com.example.send.utilities.Constants;
import com.example.send.utilities.PreferenceManager;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public class TimeTable extends AppCompatActivity implements CalendarAdapter.OnItemListener{

    private TextView monthYearText;
    private RecyclerView calendarRecyclerView;

    private String apilink = "http://10.0.2.2:8081/";
    //private String apilink = "http://192.168.137.1:8081/";

    private String token;
    private String userId;

    private PreferenceManager preferenceManager;

    private Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(apilink) // 替换为你的API基础URL
            .addConverterFactory(GsonConverterFactory.create())
            .build();

    private  List<UserFreeTime> userFreeTimeList;
    private RecyclerView freeTimeRecyclerView;
    private FreeTimeAdapter freeTimeAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_time_table);

        preferenceManager = new PreferenceManager(getApplicationContext());
        userId = preferenceManager.getString(Constants.KEY_USER_ID);
        token = preferenceManager.getString(Constants.SQL_USER_TOKEN);
        token = "Bearer " + token;

        getUserFreeTime();
        initWidgets();
        CalendarUtils.selectedDate = LocalDate.now();



        freeTimeRecyclerView = findViewById(R.id.freeTimeRecyclerView);
        freeTimeRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        // Initialize the adapter with an empty list first
        freeTimeAdapter = new FreeTimeAdapter(new ArrayList<>());
        freeTimeRecyclerView.setAdapter(freeTimeAdapter);


    }

    private void initWidgets(){
        calendarRecyclerView = findViewById(R.id.calendarRecyclerView);
        monthYearText = findViewById(R.id.monthYearTV);

    }

    private void setMonthView(){
        monthYearText.setText(monthYearFromDate(CalendarUtils.selectedDate));
        ArrayList<String> daysInMonth = daysInMonthArray(CalendarUtils.selectedDate);
        int year = CalendarUtils.selectedDate.getYear();
        int month = CalendarUtils.selectedDate.getMonthValue();

        CalendarAdapter calendarAdapter = new CalendarAdapter(daysInMonth, this, userFreeTimeList ,year, month);
        RecyclerView.LayoutManager layoutManager = new GridLayoutManager(getApplicationContext(), 7);
        calendarRecyclerView.setLayoutManager(layoutManager);
        calendarRecyclerView.setAdapter(calendarAdapter);

    }

    public static ArrayList<String> daysInMonthArray(LocalDate date){
        ArrayList<String> daysInMonthArray = new ArrayList<>();
        YearMonth yearMonth = YearMonth.from(date);

        int daysIsMonth = yearMonth.lengthOfMonth();

        LocalDate firstOfMonth = yearMonth.atDay(1);
        int dayOfWeek = firstOfMonth.getDayOfWeek().getValue();

        for(int i = 1; i <= 42; i++){
          if( i<= dayOfWeek || i >daysIsMonth + dayOfWeek){
              daysInMonthArray.add("");
        }else{
              daysInMonthArray.add(String.valueOf(i - dayOfWeek));
          }
        }
        return daysInMonthArray;
    }

    private String monthYearFromDate(LocalDate date){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
        return date.format(formatter);
    }

    public void previousMonthAction(View view){
        CalendarUtils.selectedDate = CalendarUtils.selectedDate.minusMonths(1);
        setMonthView();

    }

    public void nextMonthAction(View view){
        CalendarUtils.selectedDate = CalendarUtils.selectedDate.plusMonths(1);
        setMonthView();
    }

    public void addFreeTimeAction(View view){
        Intent intent = new Intent(getApplicationContext(), AddFreeTimeActivity.class);
        startActivity(intent);
    }

    public void getUserFreeTime(){
        userFreeTimeService userFreeTimeService = retrofit.create(userFreeTimeService.class);
        Call<List<UserFreeTime>> call = userFreeTimeService.getFreeTime(token, userId);
        call.enqueue(new retrofit2.Callback<List<UserFreeTime>>() {
            @Override
            public void onResponse(Call<List<UserFreeTime>> call, retrofit2.Response<List<UserFreeTime>> response) {
                if(response.isSuccessful()){
                    userFreeTimeList = response.body();
                    showToaster("Success to get free time");
                    setMonthView();
                }else{
                    showToaster("Failed to get free time");
                }
            }

            @Override
            public void onFailure(Call<List<UserFreeTime>> call, Throwable t) {
                showToaster(t.getMessage());

            }
        });
    }


    @Override
    public void onItemClick(int position, String dayText) {
        if(!dayText.equals("")){
            //String message = "Select Date " + dayText + " " + (CalendarUtils.selectedDate);
            String message = "Select Date :" + (CalendarUtils.selectedDate);
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();

            LocalDate selectedDate = CalendarUtils.selectedDate.withDayOfMonth(Integer.parseInt(dayText));
            List<UserFreeTime> freeTimesForSelectedDate = new ArrayList<>();

            for (UserFreeTime freeTime : userFreeTimeList) {
                LocalDate freeTimeDate = LocalDate.parse(freeTime.getFree_Time_Start().split("T")[0]);
                if (freeTimeDate.equals(selectedDate)) {
                    freeTimesForSelectedDate.add(freeTime);
                }
            }

            if (!freeTimesForSelectedDate.isEmpty()) {
                freeTimeAdapter.setFreeTimes(freeTimesForSelectedDate);
                showToaster("You have free time on this day");
            } else {
                showToaster("No free times on this day");
            }

        }
    }

    private void  showToaster(String message){
        Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }



    public interface userFreeTimeService {
        @GET("userfreetime/{user_id}")
        Call<List<UserFreeTime>> getFreeTime(@Header("Authorization") String token, @Path("user_id") String userId);

    }




}