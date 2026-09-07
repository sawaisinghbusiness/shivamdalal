// Real-time dispatch service connecting Customer App <-> Karigar Captain App
// Connects via Socket.IO WebSocket to Backend Server (http://localhost:5000)
// With automatic fallback to BroadcastChannel + localStorage for seamless offline/standalone sync.

import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const CHANNEL_NAME = 'sarvottam_dispatch_channel_v1';
const STORAGE_KEY = 'sarvottam_active_trip';

class DispatchService {
  constructor() {
    this.listeners = new Set();
    this.audioCtx = null;
    this.alertOscillatorInterval = null;
    this.socket = null;
    this.isConnected = false;

    if (typeof window !== 'undefined') {
      // 1. Initialize Socket.IO connection to Node.js backend
      try {
        this.socket = io(BACKEND_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 5000,
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log(`✓ Connected to Real-Time Dispatch Backend: ${BACKEND_URL}`);
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('ℹ Disconnected from Backend. Using Local Dispatch fallback.');
        });

        // Listen for new emergency job alerts
        this.socket.on('new_job_alert', (data) => {
          this.notify({ type: 'NEW_JOB_ALERT', trip: data });
        });
        this.socket.on('new_job_alert_broadcast', (data) => {
          this.notify({ type: 'NEW_JOB_ALERT', trip: data });
        });

        // Listen for booking accepted
        this.socket.on('trip_accepted', (data) => {
          this.saveTrip({ ...this.getActiveTrip(), ...data });
          this.notify({ type: 'TRIP_UPDATED', trip: data });
        });

        // Listen for trip status updates (arrived, etc.)
        this.socket.on('trip_status_update', (data) => {
          this.saveTrip({ ...this.getActiveTrip(), ...data });
          this.notify({ type: 'TRIP_UPDATED', trip: data });
        });

        // Listen for OTP verified work start
        this.socket.on('otp_verified_start_work', (data) => {
          this.saveTrip({ ...this.getActiveTrip(), ...data });
          this.notify({ type: 'TRIP_UPDATED', trip: data });
        });

        // Listen for work complete and bill presentation
        this.socket.on('work_completed_show_bill', (data) => {
          this.saveTrip({ ...this.getActiveTrip(), ...data });
          this.notify({ type: 'TRIP_UPDATED', trip: data });
        });

        // Listen for trip finished
        this.socket.on('trip_finalized_done', (data) => {
          this.saveTrip(null);
          this.notify({ type: 'TRIP_FINALIZED', trip: null });
        });
      } catch (err) {
        console.warn('Socket.IO init warning:', err);
      }

      // 2. BroadcastChannel + localStorage Fallback
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notify(event.data);
        };
      } catch {
        this.channel = null;
      }

      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          const trip = this.getActiveTrip();
          this.notify({ type: 'TRIP_UPDATED', trip });
        }
      });
    }
  }

  // Subscribe to trip & dispatch events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Dispatch listener error:', err);
      }
    });
  }

  getActiveTrip() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveTrip(trip) {
    try {
      if (trip) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      if (this.channel) {
        this.channel.postMessage({ type: 'TRIP_UPDATED', trip });
      }
      this.notify({ type: 'TRIP_UPDATED', trip });
    } catch (err) {
      console.error('Failed to save trip:', err);
    }
  }

  // ── Captain Goes Online / Offline ──
  setKarigarOnlineStatus(karigar, isOnline) {
    if (this.socket && this.socket.connected) {
      if (isOnline) {
        this.socket.emit('karigar_online', {
          karigarId: karigar?.id,
          name: karigar?.name || 'Captain',
          skill: karigar?.skill || 'Electrician',
          area: karigar?.area || 'Barmer',
        });
      } else {
        this.socket.emit('karigar_offline', { karigarId: karigar?.id });
      }
    }
  }

  // ── Customer Creates Emergency Booking (Rapido Dispatch) ──
  createBooking({ service, area, address, problem, phone, customerName }) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const tripCode = 'TRIP_' + Date.now();

    const trip = {
      id: tripCode,
      tripCode,
      status: 'searching',
      createdAt: Date.now(),
      service: service.name || service,
      icon: service.icon || 'bolt',
      baseCharge: service.service || 350,
      visitCharge: 99,
      customer: {
        name: customerName || 'Customer',
        phone: phone || '+91 98765 43210',
        area: area || 'Barmer',
        address: address || 'Indra Colony, Barmer',
        problem: problem || 'Emergency repair required',
      },
      otp,
      karigar: null,
      bill: null,
    };

    // Save locally
    this.saveTrip(trip);

    // Emit to live Socket.IO backend if connected
    if (this.socket && this.socket.connected) {
      this.socket.emit('customer_request_emergency', {
        service: trip.service,
        serviceCharge: trip.baseCharge,
        customerName: trip.customer.name,
        phone: trip.customer.phone,
        area: trip.customer.area,
        fullAddress: trip.customer.address,
        problem: trip.customer.problem,
      });
    }

    return trip;
  }

  // ── Karigar Captain Accepts Booking ──
  acceptBooking(tripId, karigarProfile) {
    const trip = this.getActiveTrip();
    if (!trip) return null;

    trip.status = 'accepted';
    trip.acceptedAt = Date.now();
    trip.karigar = {
      name: karigarProfile.name || 'Ramesh Suthar',
      phone: karigarProfile.phone || '+91 94140 12345',
      skill: karigarProfile.skill || trip.service,
      area: karigarProfile.area || 'Barmer',
      rating: karigarProfile.rating || 4.9,
      jobs: karigarProfile.jobsDone || 142,
      avatar: (karigarProfile.name || 'K')[0].toUpperCase(),
      eta: '8-12 min',
    };

    this.saveTrip(trip);

    if (this.socket && this.socket.connected) {
      this.socket.emit('karigar_accept_job', {
        tripCode: trip.tripCode || trip.id,
        karigar: trip.karigar,
      });
    }

    return trip;
  }

  // ── Update Trip Status (Arrived, Working, Completed) ──
  updateTripStatus(tripId, status, extra = {}) {
    const trip = this.getActiveTrip();
    if (!trip) return null;

    trip.status = status;
    Object.assign(trip, extra);
    this.saveTrip(trip);

    const tripCode = trip.tripCode || trip.id;

    if (this.socket && this.socket.connected) {
      if (status === 'arrived') {
        this.socket.emit('karigar_arrived', { tripCode });
      } else if (status === 'working') {
        this.socket.emit('verify_job_otp', { tripCode, enteredOtp: extra.enteredOtp || trip.otp });
      } else if (status === 'completed') {
        this.socket.emit('karigar_complete_work', { tripCode });
      }
    }

    return trip;
  }

  // ── Customer Submits Final Payment & Rating ──
  finalizePaymentAndRating(tripId, { payMode, rating, chips, review }) {
    const trip = this.getActiveTrip();
    const tripCode = trip?.tripCode || tripId;

    if (this.socket && this.socket.connected) {
      this.socket.emit('customer_submit_payment_and_rating', {
        tripCode,
        payMode,
        rating,
        chips,
        review,
      });
    }

    this.saveTrip(null);
  }

  clearTrip() {
    this.saveTrip(null);
  }

  // ── Gentle single notification ping for Karigar Captain ──
  playAlertTone() {
    try {
      if (typeof window === 'undefined') return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.stopAlertTone();

      // Soft, clean single notification chime (no continuous siren)
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5 soft note
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5 note

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      // Audio not permitted / failed silently
    }
  }

  stopAlertTone() {
    if (this.alertOscillatorInterval) {
      clearInterval(this.alertOscillatorInterval);
      this.alertOscillatorInterval = null;
    }
  }
}

export const dispatchService = new DispatchService();
export default dispatchService;
