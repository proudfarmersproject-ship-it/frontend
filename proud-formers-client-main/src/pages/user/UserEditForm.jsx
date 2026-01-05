// ProfileEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Home, Trash2, Plus } from 'lucide-react';
import { getCurrentUser } from '../../services/authService';

const ProfileEditForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [user, setUser] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'customer',
    addresses: []
  });

  // Initialize form with empty address
  const emptyAddress = {
    id: '',
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    pincode: '',
    is_default: false
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get logged-in user from localStorage
      const storedUser = getCurrentUser();
      
      if (!storedUser) {
        navigate('/login');
        return;
      }

      // Fetch current user from API
      const response = await fetch(`http://localhost:4000/users?email=${storedUser.email}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const users = await response.json();
      
      // Find current user in database
      const currentUser = users[0];
      
      if (!currentUser) {
        setError('User not found in database');
        navigate('/login');
        return;
      }

      // Ensure addresses array exists and has at least one address
      const userData = {
        ...currentUser,
        addresses: currentUser.addresses && currentUser.addresses.length > 0 
          ? currentUser.addresses 
          : [{
              ...emptyAddress,
              id: `AD${Date.now()}`,
              full_name: `${currentUser.first_name} ${currentUser.last_name}`,
              phone: currentUser.phone || '',
              email: currentUser.email,
              is_default: true
            }]
      };

      setUser(userData);
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Handle basic user info changes
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle address changes
  const handleAddressChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedAddresses = [...user.addresses];
    
    if (type === 'checkbox') {
      if (name === 'is_default' && checked) {
        // If setting this as default, unset others
        updatedAddresses.forEach((addr, i) => {
          updatedAddresses[i].is_default = i === index;
        });
      } else {
        updatedAddresses[index][name] = checked;
      }
    } else {
      updatedAddresses[index][name] = value;
      
      // If changing name/phone/email in default address, update user info too
      if (updatedAddresses[index].is_default) {
        if (name === 'full_name') {
          const names = value.split(' ');
          setUser(prev => ({
            ...prev,
            first_name: names[0] || '',
            last_name: names.slice(1).join(' ') || ''
          }));
        } else if (name === 'phone') {
          setUser(prev => ({ ...prev, phone: value }));
        } else if (name === 'email') {
          setUser(prev => ({ ...prev, email: value }));
        }
      }
    }
    
    setUser(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
  };

  // Add new address
  const addAddress = () => {
    const newAddress = {
      ...emptyAddress,
      id: `AD${Date.now()}`,
      full_name: `${user.first_name} ${user.last_name}`,
      phone: user.phone,
      email: user.email,
      is_default: user.addresses.length === 0
    };
    
    setUser(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));
  };

  // Remove address
  const removeAddress = (index) => {
    if (user.addresses.length <= 1) {
      alert('You must have at least one address');
      return;
    }
    
    const updatedAddresses = user.addresses.filter((_, i) => i !== index);
    
    // If we removed the default address, set the first one as default
    if (!updatedAddresses.some(addr => addr.is_default)) {
      updatedAddresses[0].is_default = true;
    }
    
    setUser(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!user.first_name.trim() || !user.last_name.trim()) {
        throw new Error('First name and last name are required');
      }

      if (!user.email.trim()) {
        throw new Error('Email is required');
      }

      if (!user.phone.trim() || user.phone.length < 10) {
        throw new Error('Valid phone number is required (minimum 10 digits)');
      }

      // Validate addresses
      for (let i = 0; i < user.addresses.length; i++) {
        const addr = user.addresses[i];
        if (!addr.full_name.trim() || !addr.address_line1.trim() || 
            !addr.city.trim() || !addr.pincode.trim()) {
          throw new Error(`Please fill all required fields in Address ${i + 1}`);
        }
      }

      // Method 1: Update using PATCH to specific user endpoint (recommended)
      try {
        const updateResponse = await fetch(`http://localhost:4000/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user)
        });

        if (updateResponse.ok) {
          setSuccess('Profile updated successfully!');
          
          // Update localStorage with new user data
          localStorage.setItem('user', JSON.stringify({
            email: user.email,
            name: `${user.first_name} ${user.last_name}`
          }));

          // Force refresh in navbar by triggering storage event
          window.dispatchEvent(new Event('storage'));
          return;
        }
      } catch (patchError) {
        console.log('PATCH failed, trying PUT method');
      }

      // Method 2: If PATCH doesn't work, try PUT with the full users array
      const response = await fetch('http://localhost:4000/users');
      const allUsers = await response.json();

      // Update user in the array
      const updatedUsers = allUsers.map(u => 
        u.id === user.id ? user : u
      );

      // Send PUT request to update all users
      const putResponse = await fetch('http://localhost:4000/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUsers)
      });

      if (!putResponse.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      }));

      // Force refresh in navbar by triggering storage event
      window.dispatchEvent(new Event('storage'));

    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    fetchUserData();
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h1>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Personal Information Section */}
          <section className="mb-8">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={user.first_name || ''}
                  onChange={handleUserChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={user.last_name || ''}
                  onChange={handleUserChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    Email Address <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email || ''}
                  onChange={handleUserChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={user.phone || ''}
                  onChange={handleUserChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                />
                <p className="mt-1 text-xs text-gray-500">Format: 9876543210</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={user.role || 'customer'}
                  onChange={handleUserChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </section>

          {/* Addresses Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
              </div>
              <button
                type="button"
                onClick={addAddress}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </button>
            </div>

            {user.addresses.map((address, index) => (
              <div key={address.id} className="mb-6 p-6 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Home className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Address {index + 1}</h4>
                    {address.is_default && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  
                  {user.addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor={`full_name_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`full_name_${index}`}
                      name="full_name"
                      value={address.full_name || ''}
                      onChange={(e) => handleAddressChange(index, e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label htmlFor={`phone_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id={`phone_${index}`}
                      name="phone"
                      value={address.phone || ''}
                      onChange={(e) => handleAddressChange(index, e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10-digit phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor={`email_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id={`email_${index}`}
                      name="email"
                      value={address.email || ''}
                      onChange={(e) => handleAddressChange(index, e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="address.email@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor={`address_line1_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`address_line1_${index}`}
                      name="address_line1"
                      value={address.address_line1 || ''}
                      onChange={(e) => handleAddressChange(index, e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="House no., Building, Street"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor={`address_line2_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id={`address_line2_${index}`}
                      name="address_line2"
                      value={address.address_line2 || ''}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Area, Landmark (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor={`city_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`city_${index}`}
                      name="city"
                      value={address.city || ''}
                      onChange={(e) => handleAddressChange(index, e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor={`pincode_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`pincode_${index}`}
                      name="pincode"
                      value={address.pincode || ''}
                      onChange={(e) => handleAddressChange(index, e)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`is_default_${index}`}
                        name="is_default"
                        checked={address.is_default || false}
                        onChange={(e) => handleAddressChange(index, e)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`is_default_${index}`} className="ml-2 block text-sm text-gray-900">
                        Set as Default Address
                      </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {address.is_default 
                        ? 'This is your primary delivery address' 
                        : 'Make this your primary delivery address'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;