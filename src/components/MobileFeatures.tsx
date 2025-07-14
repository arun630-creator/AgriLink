import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  Download,
  Upload,
  Camera,
  MapPin,
  QrCode,
  Share2,
  Settings,
  Battery,
  Signal,
  Wifi as WifiIcon,
  Bluetooth,
  Location,
  Notifications,
  Storage,
  Speed,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  Package,
  FileText,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

interface MobileStatus {
  isOnline: boolean;
  isPWAInstalled: boolean;
  hasPushPermission: boolean;
  hasLocationPermission: boolean;
  hasCameraPermission: boolean;
  batteryLevel: number;
  networkType: string;
  storageUsed: number;
  storageTotal: number;
}

interface OfflineData {
  products: any[];
  orders: any[];
  userProfile: any;
  lastSync: Date;
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'order_update' | 'price_alert' | 'new_product' | 'promotion' | 'system';
  timestamp: Date;
  read: boolean;
  data?: any;
}

const MobileFeatures = () => {
  const { user } = useAuth();
  const [mobileStatus, setMobileStatus] = useState<MobileStatus>({
    isOnline: navigator.onLine,
    isPWAInstalled: false,
    hasPushPermission: false,
    hasLocationPermission: false,
    hasCameraPermission: false,
    batteryLevel: 0,
    networkType: 'unknown',
    storageUsed: 0,
    storageTotal: 0
  });
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [selectedTab, setSelectedTab] = useState('status');

  useEffect(() => {
    checkMobileStatus();
    checkPWAInstallation();
    checkPermissions();
    setupNetworkListeners();
    setupServiceWorker();
    loadOfflineData();
    loadNotifications();
  }, []);

  const checkMobileStatus = async () => {
    // Check battery level
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setMobileStatus(prev => ({ ...prev, batteryLevel: battery.level * 100 }));
      } catch (error) {
        console.log('Battery API not supported');
      }
    }

    // Check network type
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMobileStatus(prev => ({ 
        ...prev, 
        networkType: connection.effectiveType || connection.type || 'unknown' 
      }));
    }

    // Check storage
    if ('storage' in navigator && 'estimate' in (navigator as any).storage) {
      try {
        const estimate = await (navigator as any).storage.estimate();
        setMobileStatus(prev => ({
          ...prev,
          storageUsed: estimate.usage || 0,
          storageTotal: estimate.quota || 0
        }));
      } catch (error) {
        console.log('Storage API not supported');
      }
    }
  };

  const checkPWAInstallation = () => {
    // Check if app is installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInApp = (window.navigator as any).standalone;
    setMobileStatus(prev => ({ ...prev, isPWAInstalled: isStandalone || isInApp }));
  };

  const checkPermissions = async () => {
    // Check push notification permission
    if ('Notification' in window) {
      setMobileStatus(prev => ({ 
        ...prev, 
        hasPushPermission: Notification.permission === 'granted' 
      }));
    }

    // Check location permission
    if ('geolocation' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setMobileStatus(prev => ({ 
          ...prev, 
          hasLocationPermission: permission.state === 'granted' 
        }));
      } catch (error) {
        console.log('Location permission check failed');
      }
    }

    // Check camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setMobileStatus(prev => ({ ...prev, hasCameraPermission: true }));
    } catch (error) {
      setMobileStatus(prev => ({ ...prev, hasCameraPermission: false }));
    }
  };

  const setupNetworkListeners = () => {
    window.addEventListener('online', () => {
      setMobileStatus(prev => ({ ...prev, isOnline: true }));
      syncOfflineData();
    });

    window.addEventListener('offline', () => {
      setMobileStatus(prev => ({ ...prev, isOnline: false }));
    });
  };

  const setupServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const loadOfflineData = async () => {
    try {
      const data = localStorage.getItem('offlineData');
      if (data) {
        setOfflineData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await apiService.get('/notifications/mobile');
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!mobileStatus.isOnline) return;

    setSyncStatus('syncing');
    try {
      // Sync offline data with server
      const response = await apiService.post('/sync/offline-data', offlineData);
      if (response.success) {
        setSyncStatus('completed');
        // Clear offline data after successful sync
        localStorage.removeItem('offlineData');
        setOfflineData(null);
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync failed:', error);
    }
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setMobileStatus(prev => ({ 
        ...prev, 
        hasPushPermission: permission === 'granted' 
      }));
    }
  };

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setMobileStatus(prev => ({ ...prev, hasLocationPermission: true }));
    } catch (error) {
      console.error('Location permission denied:', error);
    }
  };

  const installPWA = () => {
    // Trigger PWA installation
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installed');
          setMobileStatus(prev => ({ ...prev, isPWAInstalled: true }));
        }
        (window as any).deferredPrompt = null;
      });
    }
  };

  const shareContent = async (content: string) => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'Farm to Table Bharat',
          text: content,
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(content);
    }
  };

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Implementation for taking photo
      console.log('Photo capture initiated');
    } catch (error) {
      console.error('Camera access failed:', error);
    }
  };

  const scanQRCode = () => {
    // Implementation for QR code scanning
    console.log('QR code scanning initiated');
  };

  const getStoragePercentage = () => {
    if (mobileStatus.storageTotal === 0) return 0;
    return (mobileStatus.storageUsed / mobileStatus.storageTotal) * 100;
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case '4g': return <Signal className="w-4 h-4 text-green-500" />;
      case '3g': return <Signal className="w-4 h-4 text-yellow-500" />;
      case '2g': return <Signal className="w-4 h-4 text-red-500" />;
      case 'wifi': return <WifiIcon className="w-4 h-4 text-blue-500" />;
      default: return <Signal className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smartphone className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-gray-900">Mobile Features</h2>
        </div>
        <p className="text-gray-600">
          Optimized mobile experience with offline support and native features
        </p>
      </div>

      {/* Mobile Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {mobileStatus.isOnline ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div className="text-lg font-bold">
              {mobileStatus.isOnline ? 'Online' : 'Offline'}
            </div>
            <p className="text-sm text-gray-600">Connection</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Battery className={`w-6 h-6 ${getBatteryColor(mobileStatus.batteryLevel)}`} />
            </div>
            <div className="text-lg font-bold">{Math.round(mobileStatus.batteryLevel)}%</div>
            <p className="text-sm text-gray-600">Battery</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getNetworkIcon(mobileStatus.networkType)}
            </div>
            <div className="text-lg font-bold capitalize">{mobileStatus.networkType}</div>
            <p className="text-sm text-gray-600">Network</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Storage className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-lg font-bold">{Math.round(getStoragePercentage())}%</div>
            <p className="text-sm text-gray-600">Storage</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Features */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PWA Installed</span>
                    <div className="flex items-center gap-2">
                      {mobileStatus.isPWAInstalled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {mobileStatus.isPWAInstalled ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Push Notifications</span>
                    <div className="flex items-center gap-2">
                      {mobileStatus.hasPushPermission ? (
                        <Bell className="w-4 h-4 text-green-500" />
                      ) : (
                        <BellOff className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {mobileStatus.hasPushPermission ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Location Access</span>
                    <div className="flex items-center gap-2">
                      {mobileStatus.hasLocationPermission ? (
                        <Location className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {mobileStatus.hasLocationPermission ? 'Granted' : 'Denied'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Camera Access</span>
                    <div className="flex items-center gap-2">
                      {mobileStatus.hasCameraPermission ? (
                        <Camera className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {mobileStatus.hasCameraPermission ? 'Granted' : 'Denied'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Storage Usage</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${getStoragePercentage()}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.round(mobileStatus.storageUsed / 1024 / 1024)}MB / {Math.round(mobileStatus.storageTotal / 1024 / 1024)}MB
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Battery Level</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getBatteryColor(mobileStatus.batteryLevel).replace('text-', 'bg-')}`}
                        style={{ width: `${mobileStatus.batteryLevel}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.round(mobileStatus.batteryLevel)}% remaining
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {!mobileStatus.isPWAInstalled && (
                  <Button onClick={installPWA}>
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                )}
                {!mobileStatus.hasPushPermission && (
                  <Button variant="outline" onClick={requestPushPermission}>
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </Button>
                )}
                {!mobileStatus.hasLocationPermission && (
                  <Button variant="outline" onClick={requestLocationPermission}>
                    <Location className="w-4 h-4 mr-2" />
                    Enable Location
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiOff className="w-5 h-5" />
                Offline Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offlineData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Offline Data Available</p>
                      <p className="text-sm text-gray-600">
                        Last synced: {new Date(offlineData.lastSync).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {offlineData.products.length} products
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-lg font-bold">{offlineData.products.length}</div>
                      <p className="text-sm text-gray-600">Products</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-lg font-bold">{offlineData.orders.length}</div>
                      <p className="text-sm text-gray-600">Orders</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <User className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-lg font-bold">1</div>
                      <p className="text-sm text-gray-600">Profile</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={syncOfflineData}
                      disabled={!mobileStatus.isOnline || syncStatus === 'syncing'}
                    >
                      {syncStatus === 'syncing' ? (
                        <>
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setOfflineData(null)}>
                      Clear Data
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No offline data available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Data will be cached when you browse products offline
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{notification.body}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={takePhoto}>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" className="w-full" onClick={scanQRCode}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => shareContent('Check out this amazing farm product!')}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Product
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => shareContent('Join me on Farm to Table Bharat!')}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">App Speed</span>
                  <Badge variant="secondary">Fast</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Usage</span>
                  <Badge variant="secondary">Optimized</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Battery Impact</span>
                  <Badge variant="secondary">Low</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Biometric Auth</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Lock</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Encryption</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileFeatures; 