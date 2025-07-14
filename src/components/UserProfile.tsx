import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LocationService from "./LocationService";
import LocationPermission from "./LocationPermission";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PaymentMethodDialog from "./PaymentMethodDialog";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Bell, 
  Shield, 
  CreditCard,
  Star,
  Package,
  ShoppingCart,
  Calendar,
  Award,
  TrendingUp,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  Key,
  QrCode,
  Copy,
  RefreshCw,
  Edit,
  Trash2,
  X,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserType, apiService, PaymentMethod, Transaction } from "@/lib/api";
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface UserProfileProps {
  userRole: "farmer" | "buyer" | "admin";
  user?: UserType;
}

const UserProfile = ({ userRole, user }: UserProfileProps) => {
  const { updateProfile, refreshProfile } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
    joinDate: user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
    // Farmer specific
    farmName: user?.farmName || "",
    farmSize: user?.farmSize || "",
    certifications: user?.certifications || [],
    farmLocation: user?.farmLocation || "",
    // Buyer specific
    preferences: user?.preferences || [],
    favoriteCategories: user?.favoriteCategories || [],
    // Settings
    notifications: user?.notifications || {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },
    privacy: user?.privacy || {
      showProfile: true,
      showLocation: true,
      showContact: false
    }
  });

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        joinDate: user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
        farmName: user.farmName || "",
        farmSize: user.farmSize || "",
        certifications: user.certifications || [],
        farmLocation: user.farmLocation || "",
        preferences: user.preferences || [],
        favoriteCategories: user.favoriteCategories || [],
        notifications: user.notifications || {
          email: true,
          sms: false,
          push: true,
          marketing: false
        },
        privacy: user.privacy || {
          showProfile: true,
          showLocation: true,
          showContact: false
        }
      });
    }
  }, [user]);

  // Fetch user stats when component mounts or user changes
  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const statsData = await apiService.getStats();
          setStats(statsData.stats);
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  // Fetch 2FA status when component mounts
  useEffect(() => {
    const fetch2FAStatus = async () => {
      if (user) {
        try {
          const status = await apiService.get2FAStatus();
          setTwoFactorEnabled(status.enabled);
        } catch (error) {
          console.error('Error fetching 2FA status:', error);
        }
      }
    };

    fetch2FAStatus();
  }, [user]);

  // Fetch payment methods when component mounts or user changes
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (user && userRole === "buyer") {
        try {
          setIsLoadingPaymentMethods(true);
          const methods = await apiService.getPaymentMethods();
          setPaymentMethods(methods);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
        } finally {
          setIsLoadingPaymentMethods(false);
        }
      }
    };

    fetchPaymentMethods();
  }, [user, userRole]);

  // Fetch transactions when component mounts or user changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        try {
          setIsLoadingTransactions(true);
          const response = await apiService.getTransactions(1, 10);
          setTransactions(response.transactions);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setIsLoadingTransactions(false);
        }
      }
    };

    fetchTransactions();
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  // Security states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // Add new states for dynamic content
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [showPreferenceDialog, setShowPreferenceDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  const [newPreference, setNewPreference] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Additional notification preferences
  const [additionalPreferences, setAdditionalPreferences] = useState({
    newProductAlerts: true,
    priceDropAlerts: false,
    usageAnalytics: true,
    personalizedRecommendations: true,
    thirdPartyDataSharing: false,
    loginNotifications: true
  });

  // Payment methods and transactions state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | undefined>();
  
  // Enhanced payment method states
  const [isRemovingPaymentMethod, setIsRemovingPaymentMethod] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState<string | null>(null);
  const [showDefaultConfirmation, setShowDefaultConfirmation] = useState<string | null>(null);

  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  const [activeOrderStatus, setActiveOrderStatus] = useState('all');

  // Fetch user orders for the order list
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['profile-orders', activeOrderStatus],
    queryFn: () => apiService.getUserOrders(1, 50, activeOrderStatus === 'all' ? undefined : activeOrderStatus),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
  const orders = ordersData?.orders || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Package className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };
  const filterOrdersByStatus = (status?: string) => {
    if (!status || status === 'all') return orders;
    return orders.filter(order => order.orderStatus === status);
  };
  const OrderCard = ({ order }: { order: any }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
            <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <Badge className={getStatusColor(order.orderStatus)}>
            {getStatusIcon(order.orderStatus)}
            <span className="ml-1 capitalize">{order.orderStatus}</span>
          </Badge>
        </div>
        <div className="space-y-3 mb-4">
          {order.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.quantity} {item.unit} × ₹{item.price} - by {item.farmerName}
                </div>
              </div>
              <div className="font-medium">
                ₹{item.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {order.deliveryAddress.city}, {order.deliveryAddress.state}
            </div>
            {order.expectedDelivery && (
              <div className="text-green-600 mt-1">
                Expected delivery: {new Date(order.expectedDelivery).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">Total: ₹{order.total.toFixed(2)}</div>
            <Button variant="outline" size="sm" className="mt-2">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleSave = async () => {
    // Validate required fields
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!profile.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(profile.phone.replace(/\s/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Validate bio length
    if (profile.bio && profile.bio.length > 500) {
      toast.error("Bio must be less than 500 characters");
      return;
    }

    try {
      await updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        avatar: profile.avatar,
        farmName: profile.farmName.trim(),
        farmSize: profile.farmSize.trim(),
        farmLocation: profile.farmLocation.trim(),
        certifications: profile.certifications,
        preferences: profile.preferences,
        favoriteCategories: profile.favoriteCategories,
        notifications: profile.notifications,
        privacy: profile.privacy
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: 'notifications' | 'privacy', field: string, value: any) => {
    setProfile(prev => {
      const currentSection = prev[section];
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value
        }
      };
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return undefined;
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    // If it's a relative path, construct the full URL
    return `http://localhost:5000${avatarPath}`;
  };

  const getStatusText = () => {
    return user?.statusText || (userRole === "farmer" ? "Farmer" : "Buyer");
  };

  // Security functions
  const handlePasswordChange = async () => {
    // Validate current password
    if (!passwordData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    // Validate new password
    if (!passwordData.newPassword.trim()) {
      toast.error("New password is required");
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error("Password must contain uppercase, lowercase, number, and special character");
      return;
    }

    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Check if new password is different from current
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Clear form and close dialog
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordDialog(false);
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
      
      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handle2FASetup = async () => {
    setIsSettingUp2FA(true);
    try {
      const response = await apiService.setup2FA();
      setQrCode(response.qrCode);
      setBackupCodes(response.backupCodes);
      setShow2FADialog(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to setup 2FA");
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const enable2FA = async () => {
    if (!verificationToken) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsVerifying2FA(true);
    try {
      await apiService.verify2FA(verificationToken);
      setTwoFactorEnabled(true);
      setShow2FADialog(false);
      setVerificationToken('');
      toast.success("Two-factor authentication enabled successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to verify 2FA");
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const disable2FA = async () => {
    // This would require password confirmation
    toast.info("To disable 2FA, please contact support or use backup codes");
  };

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Backup code copied to clipboard");
  };

  const generateNewBackupCodes = async () => {
    try {
      const response = await apiService.generateBackupCodes();
      setBackupCodes(response.backupCodes);
      toast.success("New backup codes generated successfully!");
    } catch (error) {
      toast.error("Failed to generate backup codes. Please try again.");
    }
  };

  // Add new handlers for dynamic content
  const handleAddCertification = () => {
    if (!newCertification.trim()) {
      toast.error("Certification name is required");
      return;
    }

    if (newCertification.trim().length < 3) {
      toast.error("Certification name must be at least 3 characters");
      return;
    }

    if (profile.certifications.includes(newCertification.trim())) {
      toast.error("This certification already exists");
      return;
    }

    setProfile(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification.trim()]
    }));
    setNewCertification('');
    setShowCertificationDialog(false);
    toast.success("Certification added successfully!");
  };

  const handleRemoveCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
    toast.success("Certification removed successfully!");
  };

  const handleAddPreference = () => {
    if (!newPreference.trim()) {
      toast.error("Preference is required");
      return;
    }

    if (newPreference.trim().length < 3) {
      toast.error("Preference must be at least 3 characters");
      return;
    }

    if (profile.preferences.includes(newPreference.trim())) {
      toast.error("This preference already exists");
      return;
    }

    setProfile(prev => ({
      ...prev,
      preferences: [...prev.preferences, newPreference.trim()]
    }));
    setNewPreference('');
    setShowPreferenceDialog(false);
    toast.success("Preference added successfully!");
  };

  const handleRemovePreference = (index: number) => {
    setProfile(prev => ({
      ...prev,
      preferences: prev.preferences.filter((_, i) => i !== index)
    }));
    toast.success("Preference removed successfully!");
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (newCategory.trim().length < 3) {
      toast.error("Category name must be at least 3 characters");
      return;
    }

    if (profile.favoriteCategories.includes(newCategory.trim())) {
      toast.error("This category already exists");
      return;
    }

    setProfile(prev => ({
      ...prev,
      favoriteCategories: [...prev.favoriteCategories, newCategory.trim()]
    }));
    setNewCategory('');
    setShowCategoryDialog(false);
    toast.success("Category added successfully!");
  };

  const handleRemoveCategory = (index: number) => {
    setProfile(prev => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.filter((_, i) => i !== index)
    }));
    toast.success("Category removed successfully!");
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Upload file to backend
      const response = await apiService.uploadAvatar(selectedFile);
      // Update profile with the new avatar URL
      await updateProfile({
        avatar: response.url
      });
      setProfile(prev => ({
        ...prev,
        avatar: response.url
      }));
      setAvatarTimestamp(Date.now()); // cache bust
      await refreshProfile(); // ensure context is updated
      setSelectedFile(null);
      setShowAvatarUpload(false);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (3MB limit for base64 encoding)
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size should be less than 3MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Check for specific image formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a JPEG, PNG, GIF, or WebP image");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleAdditionalPreferenceChange = (field: string, value: boolean) => {
    setAdditionalPreferences(prev => ({
      ...prev,
      [field]: value
    }));

    // Save the preference change to backend
    const preferenceData: any = {};
    preferenceData[field] = value;
    
    updateProfile(preferenceData).catch(() => {
      // Revert the change if save fails
      setAdditionalPreferences(prev => ({
        ...prev,
        [field]: !value
      }));
      toast.error(`Failed to update ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    });
  };

  const handleRevokeAllSessions = () => {
    // In a real app, this would call an API to revoke all sessions
    toast.success("All other sessions have been revoked successfully!");
  };

  const handleViewSecurityLog = () => {
    // In a real app, this would navigate to a detailed security log page
    toast.info("Security log feature coming soon!");
  };

  const handleManageSessions = () => {
    // In a real app, this would open a session management dialog
    toast.info("Session management feature coming soon!");
  };

  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(undefined);
    setShowPaymentDialog(true);
  };

  const handleViewAllTransactions = () => {
    // In a real app, this would navigate to a transactions page
    toast.info("Transaction history feature coming soon!");
  };

  const handleEditBillingAddress = () => {
    // In a real app, this would open a billing address form
    toast.info("Billing address feature coming soon!");
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      setIsRemovingPaymentMethod(paymentMethodId);
      await apiService.deletePaymentMethod(paymentMethodId);
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      toast.success("Payment method removed successfully");
      setShowRemoveConfirmation(null);
    } catch (error) {
      console.error('Error removing payment method:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to remove payment method";
      toast.error(errorMessage);
    } finally {
      setIsRemovingPaymentMethod(null);
    }
  };

  const handleConfirmRemovePaymentMethod = (paymentMethodId: string) => {
    setShowRemoveConfirmation(paymentMethodId);
  };

  const handleCancelRemovePaymentMethod = () => {
    setShowRemoveConfirmation(null);
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setShowPaymentDialog(true);
  };

  const handlePaymentMethodSuccess = () => {
    // Refresh payment methods
    const fetchPaymentMethods = async () => {
      if (user && userRole === "buyer") {
        try {
          const methods = await apiService.getPaymentMethods();
          setPaymentMethods(methods);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
        }
      }
    };
    fetchPaymentMethods();
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setIsSettingDefault(paymentMethodId);
      await apiService.setDefaultPaymentMethod(paymentMethodId);
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId
      })));
      toast.success("Default payment method updated");
      setShowDefaultConfirmation(null);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to set default payment method";
      toast.error(errorMessage);
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleConfirmSetDefaultPaymentMethod = (paymentMethodId: string) => {
    setShowDefaultConfirmation(paymentMethodId);
  };

  const handleCancelSetDefaultPaymentMethod = () => {
    setShowDefaultConfirmation(null);
  };

  const handleCancelEdit = () => {
    // Reset profile to original user data
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        joinDate: user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
        farmName: user.farmName || "",
        farmSize: user.farmSize || "",
        certifications: user.certifications || [],
        farmLocation: user.farmLocation || "",
        preferences: user.preferences || [],
        favoriteCategories: user.favoriteCategories || [],
        notifications: user.notifications || {
          email: true,
          sms: false,
          push: true,
          marketing: false
        },
        privacy: user.privacy || {
          showProfile: true,
          showLocation: true,
          showContact: false
        }
      });
    }
    setIsEditing(false);
    toast.info("Changes cancelled");
  };

  const statsData = userRole === "farmer" 
    ? [
        { label: "Products Listed", value: stats?.productsListed?.toString() || "0", icon: Package, trend: "+12%", color: "text-green-600" },
        { label: "Total Orders", value: stats?.totalOrders?.toString() || "0", icon: ShoppingCart, trend: "+8%", color: "text-blue-600" },
        { label: "Average Rating", value: stats?.averageRating?.toString() || "0", icon: Star, trend: "5★", color: "text-yellow-600" },
        { label: "Revenue (30d)", value: `₹${stats?.monthlyRevenue?.toLocaleString() || "0"}`, icon: TrendingUp, trend: "+15%", color: "text-emerald-600" }
      ]
    : [
        { label: "Orders Placed", value: stats?.ordersPlaced?.toString() || "0", icon: ShoppingCart, trend: "+5", color: "text-blue-600" },
        { label: "Favorite Farmers", value: stats?.favoriteFarmers?.toString() || "0", icon: Heart, trend: "+2", color: "text-red-600" },
        { label: "Total Spent", value: `₹${stats?.totalSpent?.toLocaleString() || "0"}`, icon: CreditCard, trend: "+₹2,100", color: "text-green-600" },
        { label: "Reviews Given", value: stats?.reviewsGiven?.toString() || "0", icon: Star, trend: "4.9★", color: "text-yellow-600" }
      ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Enhanced Profile Header */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-40 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/5"></div>
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 -mt-20 relative z-10">
            <div className="relative group">
              <Avatar className="h-36 w-36 border-4 border-white shadow-2xl ring-4 ring-emerald-100">
                <AvatarImage src={getAvatarUrl(profile.avatar) ? getAvatarUrl(profile.avatar) + '?t=' + avatarTimestamp : undefined} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 text-emerald-700 font-bold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <Dialog open={showAvatarUpload} onOpenChange={setShowAvatarUpload}>
                <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full p-0 bg-white shadow-lg hover:bg-gray-50 border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-200 group-hover:scale-110"
              >
                <Camera className="h-5 w-5 text-emerald-600" />
              </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-emerald-600" />
                      Update Profile Picture
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar-upload">Select Image</Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-600">
                        Maximum file size: 3MB. Supported formats: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                    
                    {selectedFile && (
                      <div className="p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50">
                        <p className="text-sm font-medium text-emerald-800 mb-2">
                          Selected: {selectedFile.name}
                        </p>
                        <p className="text-xs text-emerald-600 mb-3">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="w-32 h-32 mx-auto border-2 border-emerald-300 rounded-lg overflow-hidden bg-white">
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleAvatarUpload}
                        disabled={!selectedFile || isUploadingAvatar}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Avatar"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAvatarUpload(false)}
                        disabled={isUploadingAvatar}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {profile.name}
                    </h1>
                    <Badge className={`${getStatusColor()} text-white px-4 py-2 shadow-lg border-0`}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {getStatusText()}
                    </Badge>
                  </div>
                  
                  {userRole === "farmer" && (
                    <div className="space-y-2">
                      <p className="text-2xl text-emerald-700 font-semibold">{profile.farmName}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium">{profile.farmLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{profile.farmSize}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Member since {profile.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{profile.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                    className={`min-w-[140px] h-12 font-semibold transition-all duration-200 ${
                      isEditing 
                        ? "border-2 border-gray-300 hover:border-gray-400" 
                        : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                  {isEditing && (
                    <Button 
                      onClick={handleSave} 
                      className="min-w-[140px] h-12 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-100">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-3 rounded-full bg-gray-200 animate-pulse">
                      <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
              ))
            ) : (
              statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-lg group">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className={`p-3 rounded-full ${stat.color.replace('text-', 'bg-').replace('-600', '-100')} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">{stat.label}</p>
                    <p className={`text-xs font-semibold ${stat.color} bg-opacity-10 px-2 py-1 rounded-full inline-block`}>
                      {stat.trend}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-2xl border border-gray-200 shadow-sm">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 data-[state=active]:font-semibold rounded-xl transition-all duration-200 hover:bg-white/50"
          >
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 data-[state=active]:font-semibold rounded-xl transition-all duration-200 hover:bg-white/50"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger 
            value="favorites" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 data-[state=active]:font-semibold rounded-xl transition-all duration-200 hover:bg-white/50"
          >
            <Heart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Favorites</span>
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 data-[state=active]:font-semibold rounded-xl transition-all duration-200 hover:bg-white/50"
          >
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger 
            value="privacy" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 data-[state=active]:font-semibold rounded-xl transition-all duration-200 hover:bg-white/50"
          >
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 data-[state=active]:font-semibold rounded-xl transition-all duration-200 hover:bg-white/50"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 data-[state=active]:font-semibold rounded-xl transition-all duration-200 hover:bg-white/50"
          >
            <Award className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          {/* Personal Information */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-3 text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled={true}
                    className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-xl transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500">Email address cannot be changed for security reasons</p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
                  {isEditing ? (
                    <LocationService
                    value={profile.location}
                      onChange={(location) => handleInputChange("location", location)}
                      placeholder="Enter your location or use GPS"
                      className="h-12"
                    />
                  ) : (
                    <div className="h-12 px-4 flex items-center border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                      {profile.location || "Not specified"}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="resize-none border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all duration-200"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Share a bit about yourself, your farming experience, or shopping preferences</span>
                  <span className={`font-medium ${profile.bio.length > 450 ? 'text-red-500' : profile.bio.length > 400 ? 'text-yellow-500' : 'text-gray-500'}`}>
                    {profile.bio.length}/500
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {userRole === "farmer" && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  Farm Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="farmName" className="text-sm font-semibold text-gray-700">Farm Name</Label>
                    <Input
                      id="farmName"
                      value={profile.farmName}
                      onChange={(e) => handleInputChange("farmName", e.target.value)}
                      disabled={!isEditing}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="farmSize" className="text-sm font-semibold text-gray-700">Farm Size</Label>
                    <Input
                      id="farmSize"
                      value={profile.farmSize}
                      onChange={(e) => handleInputChange("farmSize", e.target.value)}
                      disabled={!isEditing}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="farmLocation" className="text-sm font-semibold text-gray-700">Farm Location</Label>
                    {isEditing ? (
                      <LocationService
                      value={profile.farmLocation}
                        onChange={(location) => handleInputChange("farmLocation", location)}
                        placeholder="Enter farm location or use GPS"
                        className="h-12"
                      />
                    ) : (
                      <div className="h-12 px-4 flex items-center border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                        {profile.farmLocation || "Not specified"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Certifications</Label>
                  <div className="flex flex-wrap gap-3">
                    {profile.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors group">
                        <Award className="h-3 w-3 mr-2" />
                        {cert}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveCertification(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Dialog open={showCertificationDialog} onOpenChange={setShowCertificationDialog}>
                        <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 px-4 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400">
                        + Add Certification
                      </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Award className="h-5 w-5 text-blue-600" />
                              Add Certification
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="certification">Certification Name</Label>
                              <Input
                                id="certification"
                                value={newCertification}
                                onChange={(e) => setNewCertification(e.target.value)}
                                placeholder="e.g., Organic Farming Certificate"
                                className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleAddCertification}
                                disabled={!newCertification.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                Add Certification
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowCertificationDialog(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {userRole === "buyer" && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
                <CardTitle className="flex items-center gap-3 text-pink-800">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  Preferences & Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Shopping Preferences</Label>
                  <div className="flex flex-wrap gap-3">
                    {profile.preferences.map((pref, index) => (
                      <Badge key={index} variant="secondary" className="px-4 py-2 bg-pink-100 text-pink-700 border border-pink-200 hover:bg-pink-200 transition-colors group">
                        {pref}
                        {isEditing && (
                          <button
                            onClick={() => handleRemovePreference(index)}
                            className="ml-2 text-pink-600 hover:text-pink-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Dialog open={showPreferenceDialog} onOpenChange={setShowPreferenceDialog}>
                        <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 px-4 border-2 border-dashed border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                        + Add Preference
                      </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Heart className="h-5 w-5 text-pink-600" />
                              Add Shopping Preference
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="preference">Preference</Label>
                              <Input
                                id="preference"
                                value={newPreference}
                                onChange={(e) => setNewPreference(e.target.value)}
                                placeholder="e.g., Organic products only"
                                className="h-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl"
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleAddPreference}
                                disabled={!newPreference.trim()}
                                className="flex-1 bg-pink-600 hover:bg-pink-700"
                              >
                                Add Preference
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowPreferenceDialog(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Favorite Categories</Label>
                  <div className="flex flex-wrap gap-3">
                    {profile.favoriteCategories.map((category, index) => (
                      <Badge key={index} variant="outline" className="px-4 py-2 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors group">
                        {category}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveCategory(index)}
                            className="ml-2 text-purple-600 hover:text-purple-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                        <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 px-4 border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400">
                        + Add Category
                      </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-purple-600" />
                              Add Favorite Category
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="category">Category Name</Label>
                              <Input
                                id="category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="e.g., Organic Vegetables"
                                className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleAddCategory}
                                disabled={!newCategory.trim()}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                              >
                                Add Category
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowCategoryDialog(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-8">
          {/* Existing stats/analytics section remains here */}
          {/* ...existing stats/analytics code... */}
          {/* New: Order List Section */}
          <div className="mt-8">
            <div className="mb-4 flex gap-2">
              {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(status => (
                <Button
                  key={status}
                  variant={activeOrderStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveOrderStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
            {isLoadingOrders ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">You haven't placed any orders yet.</p>
              </div>
            ) : (
              filterOrdersByStatus(activeOrderStatus).map((order: any) => (
                <OrderCard key={order._id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-8">
          {/* Favorite Products */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-3 text-red-800">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                Favorite Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {isLoading ? (
                  // Loading skeleton for favorites
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 bg-white">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : userRole === "buyer" ? (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 hover:shadow-md transition-all duration-200 group">
                      <div className="h-16 w-16 bg-red-100 rounded-lg flex items-center justify-center">
                        <Heart className="h-8 w-8 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">
                          {profile.favoriteCategories?.length > 0 ? `${profile.favoriteCategories.length} favorite categories` : "No favorite categories"}
                        </p>
                        <p className="text-xs text-red-600">
                          {profile.favoriteCategories?.length > 0 ? "Categories you love • Get personalized recommendations" : "Add favorite categories to get better recommendations"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-red-200">
                        {profile.favoriteCategories?.length > 0 ? `${profile.favoriteCategories.length} categories` : "Add Categories"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 hover:shadow-md transition-all duration-200 group">
                      <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-800">
                          {stats?.favoriteFarmers > 0 ? `${stats.favoriteFarmers} favorite farmers` : "No favorite farmers"}
                        </p>
                        <p className="text-xs text-purple-600">
                          {stats?.favoriteFarmers > 0 ? "Farmers you follow • Get updates and special offers" : "Follow your favorite farmers to stay updated"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                        {stats?.favoriteFarmers > 0 ? "Following" : "Follow Farmers"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:shadow-md transition-all duration-200 group">
                      <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">
                          {profile.preferences?.length > 0 ? `${profile.preferences.length} shopping preferences` : "No shopping preferences"}
                        </p>
                        <p className="text-xs text-blue-600">
                          {profile.preferences?.length > 0 ? "Your preferences • Help us recommend better products" : "Add preferences to get personalized recommendations"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                        {profile.preferences?.length > 0 ? `${profile.preferences.length} preferences` : "Add Preferences"}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Favorites Feature</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      This feature is available for buyers to save their favorite products and farmers.
                    </p>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-600">
                        As a farmer, you can see which buyers have added you to their favorites in your analytics.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Management */}
          {userRole === "buyer" && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-3 text-emerald-800">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  </div>
                  Wishlist Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-emerald-700">Quick Actions</span>
                      <div className="p-3 rounded-full bg-emerald-100 group-hover:scale-110 transition-transform duration-200">
                        <Heart className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        <Heart className="h-4 w-4 mr-2" />
                        View All Favorites
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        <User className="h-4 w-4 mr-2" />
                        Manage Followed Farmers
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        <Bell className="h-4 w-4 mr-2" />
                        Notification Settings
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-blue-700">Recommendations</span>
                      <div className="p-3 rounded-full bg-blue-100 group-hover:scale-110 transition-transform duration-200">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-50">
                        <Package className="h-4 w-4 mr-2" />
                        Discover New Products
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-50">
                        <MapPin className="h-4 w-4 mr-2" />
                        Find Local Farmers
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-50">
                        <Star className="h-4 w-4 mr-2" />
                        Top Rated Items
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-8">
          {/* Notification Preferences */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Communication
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 bg-white">
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Email Notifications</Label>
                        <p className="text-xs text-gray-600 mt-1">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={profile.notifications.email}
                        onCheckedChange={(checked) => handleNestedChange("notifications", "email", checked)}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 bg-white">
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">SMS Notifications</Label>
                        <p className="text-xs text-gray-600 mt-1">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        checked={profile.notifications.sms}
                        onCheckedChange={(checked) => handleNestedChange("notifications", "sms", checked)}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 bg-white">
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Push Notifications</Label>
                        <p className="text-xs text-gray-600 mt-1">Receive push notifications</p>
                      </div>
                      <Switch
                        checked={profile.notifications.push}
                        onCheckedChange={(checked) => handleNestedChange("notifications", "push", checked)}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Content & Marketing
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 bg-white">
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Marketing Communications</Label>
                        <p className="text-xs text-gray-600 mt-1">Receive promotional emails</p>
                      </div>
                      <Switch
                        checked={profile.notifications.marketing}
                        onCheckedChange={(checked) => handleNestedChange("notifications", "marketing", checked)}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 bg-white">
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">New Product Alerts</Label>
                        <p className="text-xs text-gray-600 mt-1">Get notified about new products</p>
                      </div>
                      <Switch
                        checked={additionalPreferences.newProductAlerts}
                        onCheckedChange={(checked) => handleAdditionalPreferenceChange("newProductAlerts", checked)}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 bg-white">
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Price Drop Alerts</Label>
                        <p className="text-xs text-gray-600 mt-1">Get notified about price changes</p>
                      </div>
                      <Switch
                        checked={additionalPreferences.priceDropAlerts}
                        onCheckedChange={(checked) => handleAdditionalPreferenceChange("priceDropAlerts", checked)}
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50 border-b border-emerald-100">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-3 text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Language</Label>
                  <Select 
                    value={user?.language || "en"} 
                    onValueChange={(value) => {
                      handleInputChange("language", value);
                      // Auto-save language preference
                      updateProfile({ language: value }).catch(() => {
                        toast.error("Failed to update language preference");
                      });
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="en" className="rounded-lg">English</SelectItem>
                      <SelectItem value="hi" className="rounded-lg">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="ta" className="rounded-lg">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="te" className="rounded-lg">తెలుగు (Telugu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Currency</Label>
                  <Select 
                    value={user?.currency || "inr"} 
                    onValueChange={(value) => {
                      handleInputChange("currency", value);
                      // Auto-save currency preference
                      updateProfile({ currency: value }).catch(() => {
                        toast.error("Failed to update currency preference");
                      });
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="inr" className="rounded-lg">₹ Indian Rupee (INR)</SelectItem>
                      <SelectItem value="usd" className="rounded-lg">$ US Dollar (USD)</SelectItem>
                      <SelectItem value="eur" className="rounded-lg">€ Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Services */}
          <LocationPermission
            onPermissionGranted={() => {
              toast.success('Location services enabled! You can now use GPS features.');
            }}
            onPermissionDenied={() => {
              toast.info('Location services are optional. You can still use the app without them.');
            }}
          />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-8">
          {/* Profile Privacy */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                Profile Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Public Profile</Label>
                    <p className="text-xs text-gray-600 mt-1">Make your profile visible to others</p>
                  </div>
                  <Switch
                    checked={profile.privacy.showProfile}
                    onCheckedChange={(checked) => handleNestedChange("privacy", "showProfile", checked)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Show Location</Label>
                    <p className="text-xs text-gray-600 mt-1">Display your location on profile</p>
                  </div>
                  <Switch
                    checked={profile.privacy.showLocation}
                    onCheckedChange={(checked) => handleNestedChange("privacy", "showLocation", checked)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Show Contact Info</Label>
                    <p className="text-xs text-gray-600 mt-1">Allow others to see your contact details</p>
                  </div>
                  <Switch
                    checked={profile.privacy.showContact}
                    onCheckedChange={(checked) => handleNestedChange("privacy", "showContact", checked)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Analytics */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                Data & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Usage Analytics</Label>
                    <p className="text-xs text-gray-600 mt-1">Allow us to collect usage data to improve your experience</p>
                  </div>
                  <Switch
                    checked={additionalPreferences.usageAnalytics}
                    onCheckedChange={(checked) => handleAdditionalPreferenceChange("usageAnalytics", checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Personalized Recommendations</Label>
                    <p className="text-xs text-gray-600 mt-1">Get personalized product and farmer recommendations</p>
                  </div>
                  <Switch
                    checked={additionalPreferences.personalizedRecommendations}
                    onCheckedChange={(checked) => handleAdditionalPreferenceChange("personalizedRecommendations", checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Third-party Data Sharing</Label>
                    <p className="text-xs text-gray-600 mt-1">Allow sharing data with trusted partners</p>
                  </div>
                  <Switch
                    checked={additionalPreferences.thirdPartyDataSharing}
                    onCheckedChange={(checked) => handleAdditionalPreferenceChange("thirdPartyDataSharing", checked)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-3 text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-600 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300" onClick={handle2FASetup}>
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Login Notifications</Label>
                    <p className="text-xs text-gray-600 mt-1">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    checked={additionalPreferences.loginNotifications}
                    onCheckedChange={(checked) => handleAdditionalPreferenceChange("loginNotifications", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Session Management</Label>
                    <p className="text-xs text-gray-600 mt-1">Manage active sessions and devices</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300" onClick={handleManageSessions}>
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-8">
          {/* Premium Subscription */}
          {userRole === "buyer" && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100">
                <CardTitle className="flex items-center gap-3 text-yellow-800">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  Premium Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Current Plan */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Current Plan</h3>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                        Free Plan
                      </Badge>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Standard delivery (2-3 days)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Access to all products</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Basic customer support</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                      Current Plan
                    </Button>
                  </div>

                  {/* Premium Plan */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                      RECOMMENDED
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-yellow-800">Premium Plan</h3>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        ₹299/month
                      </Badge>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700 font-medium">Same day delivery</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Priority customer support</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Exclusive premium products</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">No delivery fees</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Early access to new products</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>

                {/* Subscription Benefits */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Why Upgrade to Premium?
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-white border border-blue-200">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <h5 className="font-semibold text-gray-800 mb-1">Fast Delivery</h5>
                      <p className="text-xs text-gray-600">Get your fresh produce delivered the same day</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white border border-blue-200">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-6 w-6 text-blue-600" />
                      </div>
                      <h5 className="font-semibold text-gray-800 mb-1">Premium Support</h5>
                      <p className="text-xs text-gray-600">24/7 priority customer support</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white border border-blue-200">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <h5 className="font-semibold text-gray-800 mb-1">Exclusive Products</h5>
                      <p className="text-xs text-gray-600">Access to premium and rare products</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                {userRole === "buyer" ? (
                  <>
                    {isLoadingPaymentMethods ? (
                      <div className="text-center py-8">
                        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading payment methods...</p>
                        </div>
                    ) : paymentMethods.length > 0 ? (
                      paymentMethods.map((paymentMethod) => (
                        <div key={paymentMethod.id} className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-100 hover:shadow-lg transition-all duration-200 bg-white group">
                      <div className="flex items-center gap-4">
                            <div className={`h-12 w-16 rounded-xl flex items-center justify-center shadow-lg ${
                              paymentMethod.type === 'card' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
                              paymentMethod.type === 'upi' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                              'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}>
                              <span className="text-white text-sm font-bold">
                                {paymentMethod.type === 'card' ? 'CARD' :
                                 paymentMethod.type === 'upi' ? 'UPI' :
                                 'WALLET'}
                              </span>
                        </div>
                        <div>
                              <p className="text-sm font-semibold text-gray-800">{paymentMethod.name}</p>
                              {paymentMethod.maskedNumber && (
                                <p className="text-xs text-gray-600">{paymentMethod.maskedNumber}</p>
                              )}
                              {paymentMethod.expiryDate && (
                                <p className="text-xs text-gray-600">Expires {paymentMethod.expiryDate}</p>
                              )}
                        </div>
                      </div>
                          <div className="flex items-center gap-2">
                            {paymentMethod.isDefault && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {!paymentMethod.isDefault && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleConfirmSetDefaultPaymentMethod(paymentMethod.id)}
                                disabled={isSettingDefault === paymentMethod.id}
                              >
                                {isSettingDefault === paymentMethod.id ? (
                                  <>
                                    <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                                    Setting...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Set Default
                                  </>
                                )}
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                              onClick={() => handleEditPaymentMethod(paymentMethod)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity border-2 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleConfirmRemovePaymentMethod(paymentMethod.id)}
                              disabled={isRemovingPaymentMethod === paymentMethod.id}
                            >
                              {isRemovingPaymentMethod === paymentMethod.id ? (
                                <>
                                  <div className="h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                                </>
                              )}
                      </Button>
                    </div>
                        </div>
                      ))
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">No payment methods added yet</p>
                    <p className="text-sm text-gray-500">Add a payment method to start shopping</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">Payment methods for buyers only</p>
                    <p className="text-sm text-gray-500">As a farmer, you'll receive payments through the platform</p>
                  </div>
                )}
              </div>
              
              {userRole === "buyer" && (
                <div className="space-y-4">
                  <Button variant="outline" className="w-full h-12 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200" onClick={handleAddPaymentMethod}>
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-3 text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {isLoadingTransactions ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading transactions...</p>
                  </div>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:shadow-md transition-all duration-200 bg-white group">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'order' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                          transaction.type === 'subscription' ? 'bg-gradient-to-br from-purple-100 to-violet-100' :
                          transaction.type === 'refund' ? 'bg-gradient-to-br from-orange-100 to-red-100' :
                          'bg-gradient-to-br from-blue-100 to-cyan-100'
                        }`}>
                          {transaction.type === 'order' ? (
                          <ShoppingCart className="h-5 w-5 text-green-600" />
                          ) : transaction.type === 'subscription' ? (
                            <Star className="h-5 w-5 text-purple-600" />
                          ) : transaction.type === 'refund' ? (
                            <RefreshCw className="h-5 w-5 text-orange-600" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {transaction.orderId ? `Order #${transaction.orderId}` : transaction.description}
                          </p>
                          <p className="text-xs text-gray-600">
                            {transaction.description} • {new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-blue-600">
                            {transaction.status} • {transaction.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          transaction.type === 'refund' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'refund' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant="secondary" className={`text-xs ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          transaction.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-orange-100 text-orange-700 border-orange-200'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">No transactions yet</p>
                    <p className="text-sm text-gray-500">
                      {userRole === "buyer" ? "Start shopping to see your transaction history" : "Complete orders to see transaction history"}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        {userRole === "buyer" ? "Total Spent This Month" : "Total Revenue This Month"}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {userRole === "buyer" ? "Your spending summary" : "Your earnings summary"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-800">
                      {userRole === "buyer" ? `₹${stats?.totalSpent?.toLocaleString() || "0"}` : `₹${stats?.monthlyRevenue?.toLocaleString() || "0"}`}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {userRole === "buyer" ? `${stats?.ordersPlaced || 0} orders` : `${stats?.totalOrders || 0} orders`}
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full h-12 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200" onClick={handleViewAllTransactions}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                View All Transactions
              </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="p-6 rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <p className="text-sm font-semibold text-gray-800 mb-2">{user?.name || "No name provided"}</p>
                <p className="text-sm text-gray-600">{user?.location || "No address provided"}</p>
                <p className="text-sm text-gray-600">{user?.phone || "No phone provided"}</p>
                <p className="text-sm text-gray-600">India</p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200" onClick={handleEditBillingAddress}>
                Edit Billing Address
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-8">
          {/* Security Summary */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <CardTitle className="flex items-center gap-3 text-indigo-800">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                Security Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Account Status</h3>
                  <p className="text-sm text-green-600 font-medium">Secure</p>
                  <p className="text-xs text-gray-600 mt-2">Your account is protected</p>
                </div>
                
                <div className="text-center p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Last Login</h3>
                  <p className="text-sm text-blue-600 font-medium">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Recent"}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : "Active session"}
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Key className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">2FA Status</h3>
                  <p className={`text-sm font-medium ${twoFactorEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                    {twoFactorEnabled ? "Enabled" : "Not Enabled"}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {twoFactorEnabled ? "Extra security active" : "Recommended for security"}
                  </p>
                </div>
              </div>
              
              {user?.loginAttempts > 0 && (
                <div className="mt-6 p-4 rounded-2xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Security Alert</p>
                      <p className="text-xs text-gray-600">
                        {user.loginAttempts} failed login attempts detected. Consider changing your password.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password & Security */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <CardTitle className="flex items-center gap-3 text-emerald-800">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                Password & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Change Password</Label>
                    <p className="text-xs text-gray-600 mt-1">Update your account password</p>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300">
                        Change
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-emerald-600" />
                          Change Password
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            >
                              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            {isChangingPassword ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Changing...
                              </>
                            ) : (
                              "Change Password"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowPasswordDialog(false)}
                            disabled={isChangingPassword}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      {twoFactorEnabled ? "Enabled - Extra security layer active" : "Add an extra layer of security"}
                    </p>
                  </div>
                  <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant={twoFactorEnabled ? "default" : "outline"} 
                        size="sm" 
                        className={twoFactorEnabled ? "bg-green-600 hover:bg-green-700" : "border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"}
                        onClick={twoFactorEnabled ? disable2FA : handle2FASetup}
                        disabled={isSettingUp2FA}
                      >
                        {isSettingUp2FA ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Setting up...
                          </>
                        ) : twoFactorEnabled ? (
                          "Enabled"
                        ) : (
                          "Enable"
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 md:p-8">
                      <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-emerald-600" />
                          Set Up Two-Factor Authentication
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShow2FADialog(false)} className="ml-auto">
                          <span className="sr-only">Close</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </DialogHeader>
                      <div className="space-y-6">
                        {isSettingUp2FA ? (
                          <div className="text-center py-8">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
                            <p className="text-sm text-gray-600">Setting up 2FA...</p>
                          </div>
                        ) : (
                          <>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-4">
                                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                              </p>
                              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mx-auto">
                                <img src={qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <Label htmlFor="verification-token" className="text-sm font-semibold">
                                Verification Code
                              </Label>
                              <Input
                                id="verification-token"
                                type="text"
                                placeholder="Enter 6-digit code from your app"
                                value={verificationToken}
                                onChange={(e) => setVerificationToken(e.target.value)}
                                maxLength={6}
                                className="text-center text-lg font-mono"
                              />
                              <p className="text-xs text-gray-600">
                                Enter the 6-digit code from your authenticator app to verify setup
                              </p>
                            </div>
                            
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold">Backup Codes</Label>
                              <p className="text-xs text-gray-600">
                                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                    <code className="text-sm font-mono">{code}</code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyBackupCode(code)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={generateNewBackupCodes}
                                className="w-full mt-2"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Generate New Codes
                              </Button>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={enable2FA}
                                disabled={isVerifying2FA || !verificationToken}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                {isVerifying2FA ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  "Enable 2FA"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShow2FADialog(false)}
                                disabled={isVerifying2FA}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 bg-white">
                  <div>
                    <Label className="text-sm font-semibold text-gray-800">Login Notifications</Label>
                    <p className="text-xs text-gray-600 mt-1">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    checked={additionalPreferences.loginNotifications}
                    onCheckedChange={(checked) => handleAdditionalPreferenceChange("loginNotifications", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Current Session</p>
                      <p className="text-xs text-gray-600">
                        {user?.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleString()}` : "Session active"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                </div>
                
                {user?.loginAttempts > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Failed Login Attempts</p>
                        <p className="text-xs text-gray-600">
                          {user.loginAttempts} failed attempts detected
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      {user.loginAttempts} attempts
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Mobile App Session</p>
                      <p className="text-xs text-gray-600">
                        {user?.lastLogin ? `Last active: ${new Date(user.lastLogin).toLocaleString()}` : "No recent activity"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => toast.success("Session revoked successfully")}
                  >
                    Revoke
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Desktop Browser Session</p>
                      <p className="text-xs text-gray-600">
                        {user?.lastLogin ? `Last active: ${new Date(user.lastLogin).toLocaleString()}` : "No recent activity"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => toast.success("Session revoked successfully")}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
              
              <Button variant="outline" className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200" onClick={handleRevokeAllSessions}>
                Revoke All Other Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Security Log */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-50 border-b border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                Security Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Successful login</p>
                    <p className="text-xs text-gray-600">
                      {user?.lastLogin ? `${new Date(user.lastLogin).toLocaleString()}` : "Recent login"}
                    </p>
                  </div>
                </div>
                
                {user?.loginAttempts > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-red-200 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">Failed login attempt</p>
                      <p className="text-xs text-gray-600">
                        {user?.lastLogin ? `${new Date(user.lastLogin).toLocaleString()}` : "Recent failed attempt"}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-200 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Profile updated</p>
                    <p className="text-xs text-gray-600">
                      {user?.updatedAt ? `${new Date(user.updatedAt).toLocaleString()}` : "Profile information updated"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Password changed</p>
                    <p className="text-xs text-gray-600">
                      {user?.lastLogin ? `${new Date(user.lastLogin).toLocaleString()}` : "Password last changed"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Account created</p>
                    <p className="text-xs text-gray-600">
                      {user?.createdAt ? `${new Date(user.createdAt).toLocaleString()}` : "Account creation"}
                    </p>
                  </div>
                </div>
                
                {user?.lastPasswordChange && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">Security settings updated</p>
                      <p className="text-xs text-gray-600">
                        {new Date(user.lastPasswordChange).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <Button variant="outline" className="w-full mt-6 h-12 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200" onClick={handleViewSecurityLog}>
                View Full Security Log
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Remove Payment Method Confirmation Dialog */}
      <Dialog open={!!showRemoveConfirmation} onOpenChange={() => setShowRemoveConfirmation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Remove Payment Method
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to remove this payment method? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleRemovePaymentMethod(showRemoveConfirmation!)}
                disabled={isRemovingPaymentMethod === showRemoveConfirmation}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isRemovingPaymentMethod === showRemoveConfirmation ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelRemovePaymentMethod}
                disabled={isRemovingPaymentMethod === showRemoveConfirmation}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Default Payment Method Confirmation Dialog */}
      <Dialog open={!!showDefaultConfirmation} onOpenChange={() => setShowDefaultConfirmation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="h-5 w-5" />
              Set Default Payment Method
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              This payment method will be used as the default for all future transactions. You can change this anytime.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleSetDefaultPaymentMethod(showDefaultConfirmation!)}
                disabled={isSettingDefault === showDefaultConfirmation}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSettingDefault === showDefaultConfirmation ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Setting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Set as Default
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelSetDefaultPaymentMethod}
                disabled={isSettingDefault === showDefaultConfirmation}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onSuccess={handlePaymentMethodSuccess}
        editPaymentMethod={editingPaymentMethod}
      />
    </div>
  );
};

export default UserProfile;
