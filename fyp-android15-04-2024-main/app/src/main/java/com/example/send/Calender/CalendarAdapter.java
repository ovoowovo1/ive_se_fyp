package com.example.send.Calender;

import android.graphics.Color;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.send.R;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class CalendarAdapter extends RecyclerView.Adapter<CalendarViewHolder>{

    private final ArrayList<String> daysOfMonth;
    private final OnItemListener onItemListener;

    private final List<UserFreeTime> userFreeTimes;

    private int selectedItemPosition = -1;

    private final int year;
    private final int month;

    public CalendarAdapter(ArrayList<String> daysOfMonth, OnItemListener onItemListener , List<UserFreeTime> userFreeTimes , int year, int month) {
        this.daysOfMonth = daysOfMonth;
        this.onItemListener = onItemListener;
        this.userFreeTimes = userFreeTimes;
        this.year = year;
        this.month = month;
    }


    @NonNull
    @Override
    public CalendarViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {

        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        View view = inflater.inflate(R.layout.calendar_cell, parent, false);
        ViewGroup.LayoutParams layoutParams = view.getLayoutParams();
        layoutParams.height = (int) (parent.getHeight() * 0.1666666666);


        return new CalendarViewHolder(view, onItemListener);
    }

    @Override
    public void onBindViewHolder(@NonNull CalendarViewHolder holder, int position) {
        holder.dayOfMonth.setText(daysOfMonth.get(position));
        int dayOfWeekOffset = position % 7;



        if (dayOfWeekOffset == 0) {
            holder.dayOfMonth.setTextColor(Color.RED);
        } else {
            holder.dayOfMonth.setTextColor(Color.BLACK);
        }



        String dayText = daysOfMonth.get(position);
        boolean hasFreeTime = false;

        if (!dayText.isEmpty()) {
            try {
                // 确保月份值是正确的
                String fullDateStr = String.format(Locale.ENGLISH, "%d-%02d-%02d", year, month, Integer.parseInt(dayText));
                LocalDate dayDate = LocalDate.parse(fullDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH));

                if (userFreeTimes != null) {
                    for (UserFreeTime freeTime : userFreeTimes) {
                        LocalDate startTime = LocalDate.parse(freeTime.getFree_Time_Start().substring(0, 10));
                        LocalDate endTime = LocalDate.parse(freeTime.getFree_Time_End().substring(0, 10));

                        if (!dayDate.isBefore(startTime) && !dayDate.isAfter(endTime)) {
                            hasFreeTime = true;
                            break;
                        }
                    }
                }
            } catch (DateTimeParseException e) {
                Log.d("CalendarAdapter", "日期解析错误：" + dayText + ", 异常信息：" + e.getMessage());
            }
        }


        holder.circleIndicator.setVisibility(hasFreeTime ? View.VISIBLE : View.INVISIBLE);



        if (position == selectedItemPosition) {

            holder.itemView.setBackgroundColor(Color.LTGRAY);
        } else {

            holder.itemView.setBackgroundColor(Color.TRANSPARENT);
        }


        holder.itemView.setOnClickListener(v -> {
            int adapterPosition = holder.getAdapterPosition();
            if (adapterPosition == RecyclerView.NO_POSITION) return;

            selectedItemPosition = adapterPosition;
            onItemListener.onItemClick(adapterPosition, dayText);
            notifyDataSetChanged();
        });

    }





    @Override
    public int getItemCount() {
        return daysOfMonth.size();
    }

    public interface OnItemListener{
        void onItemClick(int position, String dayText);
    }

}
