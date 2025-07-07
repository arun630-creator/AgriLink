import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: roleFromUrl || 'buyer',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian mobile number';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one letter and one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'buyer' | 'farmer',
        phone: formData.phone,
      });

      toast.success('Registration successful! Welcome to AgriDirect.');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message.includes('Email already in use')) {
        setErrors({ email: 'Email already in use' });
      } else if (error.message.includes('Phone already in use')) {
        setErrors({ phone: 'Phone number already in use' });
      } else {
        toast.error(error.message || 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base">A</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-green-800">AgriDirect</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <Label className="text-sm sm:text-base">Account Type</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer" className="text-sm sm:text-base">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="farmer" id="farmer" />
                    <Label htmlFor="farmer" className="text-sm sm:text-base">Farmer</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 text-sm sm:text-base ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 text-sm sm:text-base ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`mt-1 text-sm sm:text-base ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 text-sm sm:text-base ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`mt-1 text-sm sm:text-base ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-3"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
