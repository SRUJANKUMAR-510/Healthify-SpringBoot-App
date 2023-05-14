package com.project.healthify.util;

import java.util.List;

public class SortArray<T> {

    private final List<T> list;
    private Adapter<T> adapter;

    public SortArray(List<T> list) {
        this.list = list;
    }

    public void setAdapter(Adapter<T> adapter) {
        this.adapter = adapter;
    }

    public void sort() {
        if (adapter != null){
            int n = list.size();
            for (int i = 0; i < n-1; i++) {
                for (int j = 0; j < n-i-1; j++) {
                    if (adapter.shouldSwap(list.get(j), list.get(j+1))) {
                        T temp = list.get(j);
                        list.set(j, list.get(j+1));
                        list.set(j+1, temp);
                    }
                }
            }
        }
    }

    public interface Adapter<T>{
        boolean shouldSwap(T t1, T t2);
    }
}
