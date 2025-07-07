
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageCircle, Clock, HelpCircle, BookOpen, Package } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+91 98765 43210",
      hours: "9 AM - 6 PM (Mon-Sat)",
      color: "text-green-600"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed queries via email",
      contact: "support@agridirect.com",
      hours: "Response within 2 hours",
      color: "text-blue-600"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant chat with our support agents",
      contact: "Available on website",
      hours: "24/7 Available",
      color: "text-purple-600"
    }
  ];

  const faqCategories = [
    {
      category: "Orders & Payment",
      faqs: [
        { q: "How do I place an order?", a: "You can place orders through our marketplace or custom order page." },
        { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, UPI, and net banking." },
        { q: "Can I cancel my order?", a: "Yes, you can cancel orders before they are picked up from the farm." }
      ]
    },
    {
      category: "Delivery & Shipping",
      faqs: [
        { q: "What are your delivery charges?", a: "Free delivery on orders above ₹500, otherwise ₹50-100 based on location." },
        { q: "How can I track my order?", a: "You'll receive a tracking link via SMS and email after order confirmation." },
        { q: "Do you deliver on weekends?", a: "Yes, we deliver 7 days a week including holidays." }
      ]
    },
    {
      category: "Quality & Returns",
      faqs: [
        { q: "What if the produce is not fresh?", a: "We guarantee freshness. Contact us within 24 hours for replacement or refund." },
        { q: "Can I return products?", a: "Yes, you can return products within 24 hours if not satisfied with quality." },
        { q: "How do you ensure quality?", a: "All products are quality checked before dispatch and delivered in temperature-controlled vehicles." }
      ]
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'track':
        navigate('/orders');
        break;
      case 'history':
        navigate('/orders');
        break;
      case 'return':
        navigate('/orders');
        break;
      case 'account':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🤝 Customer Support</h1>
          <p className="text-xl text-gray-600">
            We're here to help! Get quick assistance for all your queries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-2 space-y-8">
            {/* Support Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {supportOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <IconComponent className={`h-12 w-12 ${option.color} mx-auto mb-4`} />
                      <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                      <p className="font-medium text-gray-900 mb-1">{option.contact}</p>
                      <p className="text-xs text-gray-500">{option.hours}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Contact Form */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle>📝 Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input type="email" placeholder="Enter your email" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input placeholder="Enter your phone number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Query Type
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select query type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order Related</SelectItem>
                          <SelectItem value="delivery">Delivery Issue</SelectItem>
                          <SelectItem value="payment">Payment Problem</SelectItem>
                          <SelectItem value="quality">Quality Complaint</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order ID (if applicable)
                    </label>
                    <Input placeholder="Enter your order ID" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea 
                      placeholder="Describe your query in detail..."
                      rows={5}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Send Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3 border-b pb-2">
                        {category.category}
                      </h3>
                      <div className="space-y-3">
                        {category.faqs.map((faq, faqIndex) => (
                          <div key={faqIndex} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{faq.q}</h4>
                            <p className="text-gray-600 text-sm">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg">⚡ Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('track')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Track My Order
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('history')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Order History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('return')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Return/Refund
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('account')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Account Issues
                </Button>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg">🕒 Support Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone Support</span>
                  <span className="text-sm font-medium">9 AM - 6 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Live Chat</span>
                  <span className="text-sm font-medium">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email Response</span>
                  <span className="text-sm font-medium">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Emergency Support</span>
                  <span className="text-sm font-medium">24/7</span>
                </div>
              </CardContent>
            </Card>

            {/* Help Resources */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">📚 Help Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-green-700 hover:bg-green-100"
                  onClick={() => navigate('/marketplace')}
                >
                  How to Place Orders
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-green-700 hover:bg-green-100"
                  onClick={() => navigate('/checkout')}
                >
                  Payment Guidelines
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-green-700 hover:bg-green-100"
                  onClick={() => navigate('/delivery')}
                >
                  Delivery Information
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-green-700 hover:bg-green-100"
                  onClick={() => navigate('/farmers')}
                >
                  Quality Standards
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-green-700 hover:bg-green-100"
                  onClick={() => navigate('/orders')}
                >
                  Return Policy
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-red-800 mb-2">🚨 Emergency Support</h4>
                <p className="text-sm text-red-700 mb-3">
                  For urgent delivery or quality issues
                </p>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  Call Now: +91 99999 00000
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
