import * as React from 'react';
import NavDrawer from '../components/NavDrawer';
import Search from '../components/Search';
import { Box, Button, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { getUserId } from '../services/auth';
import Message from '../components/Message';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function BookAppointment() {
    const [search, setSearch] = React.useState('');
    const [hospitals, setHospitals] = React.useState([]);
    const [selectedHospital, setSelectedHospital] = React.useState('');
    const [selectedDoctor, setSelectedDoctor] = React.useState('');
    const [doctors, setDoctors] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [severity, setSeverity] = React.useState('success');

    React.useEffect(() => {
        axios.get(`${import.meta.env.VITE_HOST}/hospital/all`)
            .then((response) => {
                setHospitals(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    React.useEffect(() => {
        setSelectedDoctor('');
        if (selectedHospital !== '') {
            axios.get(`${import.meta.env.VITE_HOST}/doctor/hospital/${selectedHospital}`)
                .then((response) => {
                    setDoctors(response.data);
                })
                .catch((error) => {
                    setDoctors([]);
                    console.log(error);
                });
        }
        else {
            setDoctors([]);
        }
    }, [selectedHospital]);

    const bookAppointment = () => {

        if (selectedDoctor === '') {
            setMessage('Please select a Doctor');
            setSeverity('error');
            setOpen(true);
            return;
        }
        axios.post(`${import.meta.env.VITE_HOST}/appointment/add`, {
            doctorId: selectedDoctor,
            userId: getUserId()
        }).then((_) => {
            setMessage('Appointment booked successfully');
            setSeverity('success');
            setOpen(true);
        }).catch((error) => {
            setMessage('Appointment booking failed, maximum limit for that doctor reached');
            setSeverity('error');
            setOpen(true);
            console.log(error);
        })
    }

    const isSubsequence = (s1, s2) => {
        let i = 0;
        let j = 0;
        while (i < s1.length && j < s2.length) {
            if (s1[i] === s2[j]) {
                i++;
            }
            j++;
        }
        return i === s1.length;
    }

    return (
        <NavDrawer>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexGrow: 1,
                    }}
                >
                    <Search setSearch={setSearch} />
                    <Box
                        sx={{
                            display: 'flex',
                            paddingX: '5px',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: '10px',
                            height: '450px',
                            overflowY: 'scroll',
                            overflowX: 'hidden',
                            '::-webkit-scrollbar': {
                                width: '0.5em',
                            },
                            '::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888',
                                borderRadius: '1em',
                            },
                            minWidth: '650px',
                            maxWidth: '650px',
                        }}
                    >
                        {hospitals.filter((hospital) => (
                            isSubsequence(search.toLowerCase(), hospital.name.toLowerCase())
                        )).map((hospital) => (
                            <Box
                                key={hospital.hospitalId}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '100%',
                                    border: '1px solid #000',
                                    borderRadius: '25px',
                                    padding: '5px',
                                    margin: '5px',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <Typography variant="h5" gutterBottom component="div"
                                        sx={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            marginTop: '15px',
                                        }}
                                    > {hospital.name} </Typography>
                                    <Typography variant="h6" gutterBottom component="div"
                                        sx={{
                                            fontSize: '15px',
                                            marginTop: '10px',
                                            marginBottom: '15px',
                                        }}
                                    > {hospital.location} </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{
                                        width: '200px',
                                        borderRadius: '25px',
                                        marginLeft: 'auto',
                                    }}
                                    onClick={() => {
                                        setSelectedHospital(hospital.hospitalId);
                                    }}
                                >
                                    Book Appointment
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Paper
                    elevation={20}
                    sx={{
                        display: selectedHospital === '' ? 'flex' : 'none',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '300px',
                        borderRadius: '25px',
                    }}
                >
                    <Typography variant="h5" sx={{ marginTop: "20px",marginBottom: "5px"}}> Book Appointment </Typography>
                    <Typography variant='h6' sx={{
                        fontSize: '15px',
                        color: 'grey',
                    }}>Select your preferred hospital</Typography>
                </Paper>
                <Paper
                    elevation={20}
                    sx={{
                        display: selectedHospital !== '' ? 'flex' : 'none',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '300px',
                        borderRadius: '25px',
                    }}
                >
                    <Typography variant="h5" sx={{ marginTop: "20px", marginBottom: "5px" }}> Book Appointment </Typography>
                    <Typography variant='h6' sx={{
                        fontSize: '15px',
                        color: 'grey',
                    }}>Select a Doctor</Typography>
                    <FormControl
                        sx={{
                            width: '60%',
                            marginTop: '10px',
                        }}
                    >
                        <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            value={selectedDoctor}
                        >
                            {doctors.map((doctor) => (
                                <FormControlLabel
                                    key={doctor.doctorId}
                                    value={doctor.doctorId}
                                    control={<Radio />}
                                    label={doctor.doctorName}
                                    onClick={() => {
                                        setSelectedDoctor(doctor.doctorId);
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                    <Button
                        variant="contained"
                        sx={{
                            width: '200px',
                            borderRadius: '25px',
                            marginBottom: '10px',
                            marginTop: 'auto',
                        }}
                        onClick={() => {
                            bookAppointment();
                            setSelectedHospital('');
                        }}
                    >
                        Book
                    </Button>
                    <Typography variant='h6' 
                        sx={{
                            fontSize: '12px',
                            color: 'grey',
                        }}
                    >
                        *Appointments booked are only valid for today.
                    </Typography>

                </Paper>
            </Box>
            <Message open={open} setOpen={setOpen} message={message} severity={severity} />
        </NavDrawer>
    );
}
