import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Award, Truck, Shield, Leaf, Heart } from 'lucide-react';

export default function PremiumProudFarmer() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const slides = [
    {
      mobile: 'https://images.unsplash.com/photo-1523143093721-2cb542ba354d?q=80&w=676&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      desktop: 'https://images.unsplash.com/photo-1597389030828-c5218bdf7fa4?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Pure Wild Forest Honey',
      subtitle: 'Straight from the Himalayas'
    },
    {
      mobile: 'https://images.unsplash.com/photo-1722895001799-2cdd038737ed?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      desktop: 'https://images.unsplash.com/photo-1657288649124-b80bdee3c17e?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Organic A2 Ghee',
      subtitle: 'Traditional Bull-Driven Process'
    },
    {
      mobile: 'https://plus.unsplash.com/premium_photo-1663926032098-62d3593c3200?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      desktop: 'https://images.unsplash.com/photo-1501925654609-7b41cf395eb8?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Himalayan Pink Salt',
      subtitle: 'Nature\'s Purest Mineral'
    }
  ];

  const categories = [
    { name: 'Organic Ghees', img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', desc: 'Traditional A2 Ghee' },
    { name: 'Wild Honey', img: 'https://plus.unsplash.com/premium_photo-1663851330122-32e1c17b9334?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2lsZCUyMGhvbmV5fGVufDB8fDB8fHww', desc: 'Forest Honey Collection' },
    { name: 'Pink Salts', img: 'https://images.unsplash.com/photo-1614759258004-39da973d3268?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGluayUyMHNhbHR8ZW58MHx8MHx8fDA%3D', desc: 'Himalayan Minerals' },
    { name: 'Natural Sugars', img: 'https://plus.unsplash.com/premium_photo-1726072356923-bf1a9f8faeb0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bmF0dXJhbCUyMHN1Z2FyfGVufDB8fDB8fHww', desc: 'Organic Alternatives' },
    { name: 'Cold-Pressed Oils', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', desc: 'Bull-Driven Process' },
    { name: 'Organic Rice', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', desc: 'Premium Varieties' },
    { name: 'Herbal Powders', img: 'https://images.unsplash.com/photo-1589556165541-4254aa9cfb39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGhlcmJhbCUyMHBvd2RlcnN8ZW58MHx8MHx8fDA%3D', desc: 'Natural Wellness' },
    { name: 'Fresh Mangoes', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', desc: 'Seasonal Delights' }
  ];

  const products = [
    { name: 'Raw Honey (Shivaliks)', price: 320, oldPrice: 384, img: 'https://plus.unsplash.com/premium_photo-1691095182210-a1b3c46a31d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmF3JTIwaG9uZXl8ZW58MHx8MHx8fDA%3D', rating: 5, reviews: 124 },
    { name: 'Organic Buffalo Ghee', price: 900, oldPrice: 1080, img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', rating: 5, reviews: 89 },
    { name: 'Raw Honey (Jim Corbett)', price: 320, oldPrice: 384, img: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmF3JTIwaG9uZXl8ZW58MHx8MHx8fDA%3D', rating: 5, reviews: 156 },
    { name: 'Himalayan Pink Salt', price: 230, oldPrice: 276, img: 'https://images.unsplash.com/photo-1633727783375-750547d0fc21?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGluayUyMHNhbHR8ZW58MHx8MHx8fDA%3D', rating: 5, reviews: 203 },
    { name: 'Wild Forest Honey', price: 600, oldPrice: 720, img: 'https://images.unsplash.com/photo-1623018697148-8350cf18e64e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG9uZXl8ZW58MHx8MHx8fDA%3D', rating: 5, reviews: 178 },
    { name: 'A2 Cow Ghee', price: 900, oldPrice: 1080, img: 'https://plus.unsplash.com/premium_photo-1664647903543-2ef213d1e754?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y293JTIwbWlsa3xlbnwwfHwwfHx8MA%3D%3D', rating: 5, reviews: 145 }
  ];

  const testimonials = [
    { text: 'Their ghee is nutritious and offers great value for money. I am at peace knowing it is chemical-free and organic.', author: 'Sheetal Veena', role: 'Health Enthusiast' },
    { text: "Some honey tastes like sugar syrup, but Proud Farmer's honey tastes incredible and truly fresh.", author: 'Karan Verma', role: 'Fitness Coach' },
    { text: 'Their products are pure in every form! From ingredients to taste, Proud Farmer offers the best of everything.', author: 'Kesha Saxena', role: 'Nutritionist' },
    { text: 'My family and I are health-conscious, and we have been using Proud Farmer\'s organic products for a long time.', author: 'Pawan Rathore', role: 'Chef' },
    { text: 'Their Himalayan salt enhances dishes significantly, and I have noticed positive health changes with its consumption.', author: 'Khushi Pandey', role: 'Food Blogger' }
  ];

  const features = [
    { icon: <Leaf className="w-8 h-8" />, title: '100% Organic', desc: 'Certified pure products' },
    { icon: <Award className="w-8 h-8" />, title: 'Premium Quality', desc: 'Finest ingredients' },
    { icon: <Heart className="w-8 h-8" />, title: 'Farmer Friendly', desc: 'Direct from farmers' },
    { icon: <Shield className="w-8 h-8" />, title: 'Lab Tested', desc: 'Quality assured' },
    { icon: <Truck className="w-8 h-8" />, title: 'Free Shipping', desc: 'On orders above ₹1000' }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="bg-gradient-to-b from-white to-amber-50">
      {/* Hero Slider */}
      <div className="relative">
        <div className="relative h-screen overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <picture>
                <source media="(min-width: 768px)" srcSet={slide.desktop} />
                <img src={slide.mobile} alt={slide.title} className="w-full h-full object-cover" />
              </picture>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-xl sm:text-2xl md:text-3xl mb-6 font-light">{slide.subtitle}</p>
                  <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                    Honoring Farmers, Delivering Purity
                  </p>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                    <a href='/products'>Explore</a>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-12' : 'bg-white/60 w-2 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <section className="bg-white shadow-lg relative z-10 -mt-20 mx-4 md:mx-8 lg:mx-16 rounded-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-50 to-amber-50 rounded-full mb-3 group-hover:scale-110 transition-transform text-green-700">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Explore Our Collection</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our range of premium organic products, sourced directly from farmers
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl aspect-square mb-4 shadow-lg">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm">{cat.desc}</p>
                </div>
              </div>
              <h3 className="text-center font-bold text-lg text-gray-800">{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gradient-to-b from-white to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Featured Collection</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked premium products loved by our customers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="relative overflow-hidden aspect-square">
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full z-10 shadow-lg">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                  </span>
                  <img 
                    src={product.img} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(product.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
                  </div>
                  
                  <p className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wide">Proud Farmer Organics</p>
                  <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2">{product.name}</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-800">₹{product.price}</span>
                    <span className="text-lg text-gray-400 line-through">₹{product.oldPrice}</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="relative h-96 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1600" 
          alt="Organic Ghee" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Premium A2 Organic Ghee</h2>
              <p className="text-xl mb-6">Made with traditional bull-driven method, preserving all nutrients</p>
              <button className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600">Real experiences from our valued customers</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div className="transition-transform duration-500 ease-in-out">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <p className="text-xl md:text-2xl text-gray-700 italic text-center mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </p>
                
                <div className="text-center">
                  <p className="font-bold text-lg text-gray-800">{testimonials[currentTestimonial].author}</p>
                  <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-green-600 w-12' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-br from-green-800 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Proud Farmer?</h2>
            <p className="text-xl opacity-90">Committed to purity, quality, and sustainability</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">100% Organic</h3>
              <p className="opacity-90 leading-relaxed">
                All our products are certified organic, free from chemicals, pesticides, and preservatives.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Farmer Owned</h3>
              <p className="opacity-90 leading-relaxed">
                Direct partnerships with farmers ensure fair prices and support rural communities.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Premium Quality</h3>
              <p className="opacity-90 leading-relaxed">
                Traditional methods combined with modern quality standards for the finest products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Join Our Family</h2>
          <p className="text-xl text-gray-600 mb-8">
            Subscribe for exclusive offers, health tips, and updates on new products
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 focus:border-green-600 focus:outline-none text-lg"
            />
            <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg whitespace-nowrap">
              Subscribe Now
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            🎁 Get 10% off on your first order when you subscribe
          </p>
        </div>
      </section>
    </div>
  );
}