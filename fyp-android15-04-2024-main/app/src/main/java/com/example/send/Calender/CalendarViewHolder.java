package com.example.send.Calender;

import android.support.annotation.NonNull;
import android.view.View;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.example.send.R;

public class CalendarViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener{

    public  final TextView dayOfMonth;

    public final View circleIndicator;

    private final CalendarAdapter.OnItemListener onItemListener;



    public CalendarViewHolder(@NonNull View itemView, CalendarAdapter.OnItemListener onItemListener) {
        super(itemView);
        dayOfMonth = itemView.findViewById(R.id.cellDayText);
        circleIndicator = itemView.findViewById(R.id.circleIndicator);
        this.onItemListener = onItemListener;
        itemView.setOnClickListener(this);
    }

    @Override
    public void onClick(View view) {

        onItemListener.onItemClick(getAdapterPosition(), (String) dayOfMonth.getText());
    }
}
