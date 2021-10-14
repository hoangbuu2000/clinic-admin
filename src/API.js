import axios from 'axios';

export let endpoints = {
    'roles': 'roles',
    'accounts': 'accounts',
    'medicines': 'medicines',
    'shifts': 'shifts',
    'admins': 'admins',
    'doctors': 'doctors',
    'employees': 'employees',
    'schedules': 'schedules',
    'bookings': 'bookings',
    'patients': 'patients',
    'prescriptions': 'prescriptions',
    'invoices': 'invoices',
    'services': 'services',
    'categories': 'categories'
}

export default axios.create({
    baseURL: 'http://localhost:8080/'
})