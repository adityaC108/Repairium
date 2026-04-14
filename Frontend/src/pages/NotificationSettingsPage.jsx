import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Smartphone, Volume2, Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';
import notificationService from '../services/notificationService';
import './NotificationSettingsPage.css';

const NotificationSettingsPage = () => {
  const [settings, setSettings] = useState({
    // General settings
    enableNotifications: true,
    notificationSound: true,
    notificationDuration: 5000,
    
    // Channel preferences
    inAppNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    
    // Notification types
    bookingNotifications: true,
    paymentNotifications: true,
    reviewNotifications: true,
    systemNotifications: true,
    marketingNotifications: false,
    
    // Priority settings
    urgentNotifications: true,
    highPriorityNotifications: true,
    mediumPriorityNotifications: true,
    lowPriorityNotifications: false,
    
    // Timing settings
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    quietHoursWeekdaysOnly: false,
    
    // Email settings
    emailDigest: false,
    emailDigestFrequency: 'daily', // daily, weekly, monthly
    emailImmediate: true,
    
    // Display settings
    showPreview: true,
    maxNotifications: 50,
    autoMarkAsRead: false,
    autoDeleteAfter: 30, // days
    
    // Technician specific settings
    autoAcceptBookings: false,
    locationSharing: true,
    onlineStatus: true,
    newBookingRadius: 25, // km
    
    // Sound settings
    notificationVolume: 0.7,
    differentSounds: true,
    vibrationEnabled: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testNotification, setTestNotification] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      // Apply settings immediately
      applySettings();
      
      // Show success message
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applySettings = () => {
    // Apply notification sound setting
    localStorage.setItem('notificationSoundEnabled', settings.notificationSound);
    
    // Update notification service with new settings
    if (notificationService.updateSettings) {
      notificationService.updateSettings(settings);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all notification settings to defaults?')) {
      const defaultSettings = {
        enableNotifications: true,
        notificationSound: true,
        notificationDuration: 5000,
        inAppNotifications: true,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        bookingNotifications: true,
        paymentNotifications: true,
        reviewNotifications: true,
        systemNotifications: true,
        marketingNotifications: false,
        urgentNotifications: true,
        highPriorityNotifications: true,
        mediumPriorityNotifications: true,
        lowPriorityNotifications: false,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        quietHoursWeekdaysOnly: false,
        emailDigest: false,
        emailDigestFrequency: 'daily',
        emailImmediate: true,
        showPreview: true,
        maxNotifications: 50,
        autoMarkAsRead: false,
        autoDeleteAfter: 30,
        autoAcceptBookings: false,
        locationSharing: true,
        onlineStatus: true,
        newBookingRadius: 25,
        notificationVolume: 0.7,
        differentSounds: true,
        vibrationEnabled: true
      };
      
      setSettings(defaultSettings);
    }
  };

  const sendTestNotification = () => {
    setTestNotification(true);
    
    // Simulate a test notification
    const testNotificationData = {
      id: 'test-' + Date.now(),
      title: 'Test Notification',
      message: 'This is a test notification to verify your settings are working correctly.',
      type: 'system',
      priority: 'medium',
      isRead: false,
      createdAt: new Date(),
      actionUrl: null,
      actionText: null
    };
    
    // Trigger the notification service
    if (notificationService.handleNewNotification) {
      notificationService.handleNewNotification(testNotificationData);
    }
    
    setTimeout(() => setTestNotification(false), 3000);
  };

  const clearAllNotifications = () => {
    if (window.confirm('Delete all your notifications? This action cannot be undone.')) {
      // Clear notifications from service
      if (notificationService.clearAllNotifications) {
        notificationService.clearAllNotifications();
      }
      alert('All notifications cleared!');
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'notification-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Invalid settings file. Please try again.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="notification-settings-page">
      <div className="settings-header">
        <h1>Notification Settings</h1>
        <div className="header-actions">
          <button 
            className="test-btn"
            onClick={sendTestNotification}
            disabled={testNotification}
          >
            {testNotification ? 'Test Sent!' : 'Send Test'}
          </button>
          <button 
            className="reset-btn"
            onClick={resetToDefaults}
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* General Settings */}
        <section className="settings-section">
          <h2>
            <Bell size={20} />
            General Settings
          </h2>
          
          <div className="setting-group">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
              />
              <span>Enable Notifications</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.notificationSound}
                onChange={(e) => handleSettingChange('notificationSound', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Play Sound</span>
            </label>
            
            <div className="setting-item">
              <label>Notification Duration (ms)</label>
              <input
                type="number"
                value={settings.notificationDuration}
                onChange={(e) => handleSettingChange('notificationDuration', parseInt(e.target.value))}
                min="1000"
                max="10000"
                step="500"
                disabled={!settings.enableNotifications}
              />
            </div>
          </div>
        </section>

        {/* Channel Preferences */}
        <section className="settings-section">
          <h2>Delivery Channels</h2>
          
          <div className="setting-group">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.inAppNotifications}
                onChange={(e) => handleSettingChange('inAppNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>
                <Eye size={16} />
                In-App Notifications
              </span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>
                <Mail size={16} />
                Email Notifications
              </span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>
                <Smartphone size={16} />
                Push Notifications
              </span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>SMS Notifications</span>
            </label>
          </div>
        </section>

        {/* Notification Types */}
        <section className="settings-section">
          <h2>Notification Types</h2>
          
          <div className="setting-group">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.bookingNotifications}
                onChange={(e) => handleSettingChange('bookingNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Booking Updates</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.paymentNotifications}
                onChange={(e) => handleSettingChange('paymentNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Payment Notifications</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.reviewNotifications}
                onChange={(e) => handleSettingChange('reviewNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Review Notifications</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.systemNotifications}
                onChange={(e) => handleSettingChange('systemNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>System Updates</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.marketingNotifications}
                onChange={(e) => handleSettingChange('marketingNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Marketing Emails</span>
            </label>
          </div>
        </section>

        {/* Priority Settings */}
        <section className="settings-section">
          <h2>Priority Levels</h2>
          
          <div className="setting-group">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.urgentNotifications}
                onChange={(e) => handleSettingChange('urgentNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Urgent Notifications</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.highPriorityNotifications}
                onChange={(e) => handleSettingChange('highPriorityNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>High Priority</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.mediumPriorityNotifications}
                onChange={(e) => handleSettingChange('mediumPriorityNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Medium Priority</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.lowPriorityNotifications}
                onChange={(e) => handleSettingChange('lowPriorityNotifications', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Low Priority</span>
            </label>
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="settings-section">
          <h2>Quiet Hours</h2>
          
          <div className="setting-group">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.quietHoursEnabled}
                onChange={(e) => handleSettingChange('quietHoursEnabled', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Enable Quiet Hours</span>
            </label>
            
            <div className="time-range">
              <div className="setting-item">
                <label>Start Time</label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                  disabled={!settings.enableNotifications || !settings.quietHoursEnabled}
                />
              </div>
              
              <div className="setting-item">
                <label>End Time</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                  disabled={!settings.enableNotifications || !settings.quietHoursEnabled}
                />
              </div>
            </div>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.quietHoursWeekdaysOnly}
                onChange={(e) => handleSettingChange('quietHoursWeekdaysOnly', e.target.checked)}
                disabled={!settings.enableNotifications || !settings.quietHoursEnabled}
              />
              <span>Weekdays Only</span>
            </label>
          </div>
        </section>

        {/* Technician Settings */}
        <section className="settings-section">
          <h2>Technician Settings</h2>
          
          <div className="setting-group">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.autoAcceptBookings}
                onChange={(e) => handleSettingChange('autoAcceptBookings', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Auto-Accept Bookings</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.locationSharing}
                onChange={(e) => handleSettingChange('locationSharing', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Share Location</span>
            </label>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.onlineStatus}
                onChange={(e) => handleSettingChange('onlineStatus', e.target.checked)}
                disabled={!settings.enableNotifications}
              />
              <span>Show Online Status</span>
            </label>
            
            <div className="setting-item">
              <label>Booking Notification Radius (km)</label>
              <input
                type="number"
                value={settings.newBookingRadius}
                onChange={(e) => handleSettingChange('newBookingRadius', parseInt(e.target.value))}
                min="1"
                max="100"
                step="1"
                disabled={!settings.enableNotifications}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="settings-footer">
        <div className="footer-actions">
          <button 
            className="save-btn"
            onClick={saveSettings}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button 
            className="danger-btn"
            onClick={clearAllNotifications}
          >
            <Trash2 size={16} />
            Clear All Notifications
          </button>
        </div>
        
        <div className="import-export">
          <div className="import-btn">
            <label htmlFor="import-settings">
              Import Settings
            </label>
            <input
              id="import-settings"
              type="file"
              accept=".json"
              onChange={importSettings}
              style={{ display: 'none' }}
            />
          </div>
          
          <button 
            className="export-btn"
            onClick={exportSettings}
          >
            Export Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
