package com.project.healthify.repository;

import com.project.healthify.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    @Query("SELECT a, u.name, u.age FROM Appointment a JOIN User u ON a.userId = u.userId WHERE a.doctorId = :doctorId and a.status = 'pending'")
    List<Object[]> findByDoctorId(@Param("doctorId") String doctorId);

    @Query("SELECT a, d.doctorName, h.name, h.location FROM Appointment a JOIN Doctor d ON a.doctorId = d.doctorId JOIN Hospital h ON d.hospitalId = h.hospitalId WHERE a.userId = :userId")
    List<Object[]> findByUserId(@Param("userId") String userId);

    @Query("SELECT u.email,d.doctorName,h.name FROM Appointment a JOIN User u ON a.userId = u.userId JOIN Doctor d ON a.doctorId = d.doctorId JOIN Hospital h ON d.hospitalId = h.hospitalId WHERE a.appointmentId = :appointmentId")
    List<Object[]> findUserByAppointmentId(@Param("appointmentId") String appointmentId);
}
