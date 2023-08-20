package com.project.healthify.service.implementation;

import com.project.healthify.Gmail.SendMail;
import com.project.healthify.model.Appointment;
import com.project.healthify.repository.AppointmentRepository;
import com.project.healthify.service.AppointmentService;
import com.project.healthify.util.SortArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class AppointmentServiceImplementation implements AppointmentService {

    @Autowired
    AppointmentRepository repository;
    @Override
    public List<Appointment> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Appointment> get(String id) {
        return repository.findById(id);
    }

    @Override
    public Appointment create(Appointment entity) {
        List<Appointment> appointments = getDoctorAppointment(entity.getDoctorId());
        int flag = 0;
        for(Appointment appointment:appointments){
            if(appointment.getUserId().equals(entity.getUserId())){
                flag = 1;
                break;
            }
        }
        if(appointments.size() >= 10) return null;
        Appointment appointment = repository.save(entity);
//        sendMail(appointment,appointments.size()+1);
        return appointment;
    }

    private void sendMail(Appointment appointment,Integer tokenNo) {
        Object[] object = repository.findUserByAppointmentId(appointment.getAppointmentId()).get(0);
        String email = (String) object[0];
        String doctor = (String) object[1];
        String hospital = (String) object[2];
        try {
            SendMail mail = new SendMail();
            mail.sendMail(tokenNo,doctor,hospital,email);

        } catch (GeneralSecurityException | IOException | MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void save(Appointment entity) {
        repository.save(entity);
    }

    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

    @Override
    public List<Appointment> getDoctorAppointment(String id) {
        List<Object[]> objects = repository.findByDoctorId(id);
        List<Appointment> appointments = new ArrayList<>();
        for(Object[] object:objects){
            Appointment appointment =
                    new Appointment.Builder((Appointment) object[0])
                    .userName((String) object[1])
                    .userAge((Integer) object[2])
                    .build();

            appointments.add(appointment);
        }
        return filterAppointment(sortAppointment(appointments));
    }

    @Override
    public List<Appointment> getUserAppointment(String id) {
        List<Object[]> objects = repository.findByUserId(id);
        List<Appointment> appointments = new ArrayList<>();
        for(Object[] object:objects){
            Appointment appointment =
                    new Appointment.Builder((Appointment) object[0])
                            .doctorName((String) object[1])
                            .hospitalName((String) object[2])
                            .hospitalLocation((String) object[3])
                            .build();
            appointments.add(appointment);
        }
        return sortAppointment(appointments);
    }

    private List<Appointment> sortAppointment(List<Appointment> appointments) {
        SortArray<Appointment> sortArray = new SortArray<>(appointments);
        sortArray.setAdapter((a1, a2) -> {
            SimpleDateFormat format = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
            try {
                Date d1 = format.parse(a1.getDate());
                Date d2 = format.parse(a2.getDate());
                return d1.compareTo(d2) < 0;
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return false;
        });
        sortArray.sort();
        return appointments;
    }

    private List<Appointment> filterAppointment(List<Appointment> appointments) {
        List<Appointment> todayAppointments = new ArrayList<>();
        Date currentDate = new Date();

        for (Appointment appointment : appointments) {
            SimpleDateFormat dateFormat = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
            Date appointmentDate = null;
            try {
                appointmentDate = dateFormat.parse(appointment.getDate());
            } catch (ParseException e) {
                e.printStackTrace();
            }

            if (appointmentDate != null && isSameDay(currentDate, appointmentDate)) {
                todayAppointments.add(appointment);
            }
        }

        return todayAppointments;
    }

    private boolean isSameDay(Date date1, Date date2) {
        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal1.setTime(date1);
        cal2.setTime(date2);
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR)
                && cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH)
                && cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }

}