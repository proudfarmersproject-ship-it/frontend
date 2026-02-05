import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Check, Loader2, X, AlertCircle } from "lucide-react";

// IMPORTANT: Replace with your actual API key from https://getaddress.io/
const GETADDRESS_API_KEY = "J7zhpYMuQ0ysOF4uFYp8JA49709";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    postcode: "",
    address1: "",
    address2: "",
    city: "",
    county: "",
    selectedAddress: null,
  });

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanPostcode = (postcode) => {
    return postcode.toUpperCase().replace(/\s+/g, '');
  };

  const fetchAddresses = async (postcode) => {
    const cleanedPostcode = cleanPostcode(postcode);
    
    if (cleanedPostcode.length < 5) {
      setAddresses([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setDebugInfo(`Searching for: ${cleanedPostcode}`);
    
    try {
      const url = `https://api.getAddress.io/find/${cleanedPostcode}?api-key=${GETADDRESS_API_KEY}&expand=true`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your getAddress.io API key.');
        } else if (response.status === 404) {
          throw new Error('No addresses found for this postcode.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.addresses && data.addresses.length > 0) {
        const formattedAddresses = data.addresses.map((addr, index) => {
          const parts = [];
          if (addr.line_1) parts.push(addr.line_1);
          if (addr.line_2) parts.push(addr.line_2);
          if (addr.town_or_city) parts.push(addr.town_or_city);
          if (addr.county) parts.push(addr.county);
          
          return {
            id: `${index}-${Date.now()}`,
            line1: addr.line_1 || "",
            line2: addr.line_2 || "",
            townOrCity: addr.town_or_city || "",
            county: addr.county || "",
            postcode: addr.postcode || cleanedPostcode,
            display: parts.join(', ')
          };
        });

        console.log('Formatted addresses:', formattedAddresses);
        setAddresses(formattedAddresses);
        setShowDropdown(true);
        setDebugInfo(`Found ${formattedAddresses.length} addresses`);
      } else {
        setAddresses([]);
        setError("No addresses found for this postcode");
        setDebugInfo("No results");
      }
    } catch (err) {
      console.error('Address fetch error:', err);
      setError(err.message);
      setAddresses([]);
      setShowDropdown(false);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostcodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    setForm(prev => ({ ...prev, postcode: value }));
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    const cleanedValue = value.replace(/\s/g, '');
    
    if (cleanedValue.length >= 5) {
      debounceTimer.current = setTimeout(() => {
        fetchAddresses(value);
      }, 600);
    } else {
      setAddresses([]);
      setShowDropdown(false);
      setError("");
      setDebugInfo("");
    }
  };

  const handleAddressSelect = (address) => {
    console.log('Selected address:', address);
    
    setForm(prev => ({
      ...prev,
      selectedAddress: address,
      address1: address.line1,
      address2: address.line2,
      city: address.townOrCity,
      county: address.county,
      postcode: address.postcode
    }));
    
    setShowDropdown(false);
    setDebugInfo("Address selected");
  };

  const handleManualAddressChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name.startsWith('address') || name === 'city' || name === 'county') {
      setForm(prev => ({ ...prev, selectedAddress: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    console.log('Form submitted:', form);
    alert('Registration successful! Check console for form data.');
  };

  const clearSearch = () => {
    setAddresses([]);
    setShowDropdown(false);
    setError("");
    setDebugInfo("");
  };

  const testConnection = async () => {
    setDebugInfo("Testing API connection...");
    try {
      const response = await fetch(`https://api.getAddress.io/find/SW1A1AA?api-key=${GETADDRESS_API_KEY}`);
      if (response.ok) {
        setDebugInfo("✓ API connection successful!");
        setTimeout(() => setDebugInfo(""), 3000);
      } else {
        setDebugInfo(`✗ API Error: ${response.status}`);
      }
    } catch (err) {
      setDebugInfo(`✗ Connection failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Register with your UK address</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    UK Postcode *
                  </label>
                  <button
                    type="button"
                    onClick={testConnection}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Test API
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.postcode}
                    onChange={handlePostcodeChange}
                    className="pl-10 pr-10 w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. SW1A 1AA or HA4 0HD"
                  />
                  {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {addresses.length > 0 && !isLoading && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {debugInfo && (
                  <p className="mt-2 text-xs text-gray-500">
                    {debugInfo}
                  </p>
                )}
                
                {showDropdown && addresses.length > 0 && (
                  <div ref={dropdownRef} className="relative z-50 mt-2">
                    <div className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-500 px-3 py-2 bg-gray-50 rounded">
                          {addresses.length} address{addresses.length !== 1 ? 'es' : ''} found
                        </p>
                        <div className="mt-1">
                          {addresses.map((address) => (
                            <button
                              key={address.id}
                              type="button"
                              onClick={() => handleAddressSelect(address)}
                              className="w-full text-left px-3 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 rounded group"
                            >
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {address.line1}
                                  </p>
                                  {address.line2 && (
                                    <p className="text-sm text-gray-600">
                                      {address.line2}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {address.townOrCity}{address.county && `, ${address.county}`}
                                  </p>
                                </div>
                                {form.selectedAddress?.id === address.id && (
                                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && !isLoading && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                
                {form.selectedAddress && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Address selected
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      {form.address1}
                      {form.address2 && `, ${form.address2}`}
                      {form.city && `, ${form.city}`}
                      {form.county && `, ${form.county}`}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="address1"
                    value={form.address1}
                    onChange={handleManualAddressChange}
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="House number and street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    name="address2"
                    value={form.address2}
                    onChange={handleManualAddressChange}
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Flat, apartment, suite"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Town/City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleManualAddressChange}
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., London"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County
                    </label>
                    <input
                      type="text"
                      name="county"
                      value={form.county}
                      onChange={handleManualAddressChange}
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Greater London"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="07123 456789"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Create Account
            </button>

            <p className="text-center text-gray-600 pt-4">
              Already have an account?{" "}
              <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                Sign in here
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">
            🔧 Troubleshooting Guide:
          </p>
          <ol className="text-sm text-blue-800 ml-4 list-decimal space-y-1">
            <li>Click "Test API" to verify your connection</li>
            <li>Check the browser console (F12) for detailed error messages</li>
            <li>Try test postcodes: <strong>SW1A 1AA</strong>, <strong>M1 1AE</strong>, <strong>HA4 0HD</strong></li>
            <li>Get your FREE API key from <a href="https://getaddress.io/" target="_blank" rel="noopener noreferrer" className="underline font-medium">getAddress.io</a></li>
          </ol>
        </div>
      </div>
    </div>
  );
}