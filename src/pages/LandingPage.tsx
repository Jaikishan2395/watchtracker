import React from 'react';
import { Button } from '../components/ui/button';
import { GraduationCap, Users, BookOpen, Award, Check, ChevronRight, Star, Plus, Minus, Mail, Instagram, Linkedin } from 'lucide-react';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <Minus className="h-5 w-5 text-gray-400" />
        ) : (
          <Plus className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-0 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduBridge</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600">Testimonials</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600">FAQ</a>
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Transform Your Learning Journey
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Join thousands of learners worldwide and gain in-demand skills.
            </p>
            <div className="mt-8">
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
                Start Learning Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Edubridge Offers
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Comprehensive learning experience designed to help you succeed
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <GraduationCap className="h-12 w-12 text-blue-600" />,
                title: "Expert Instructors",
                description: "Learn from industry professionals with real-world experience"
              },
              {
                icon: <Users className="h-12 w-12 text-green-600" />,
                title: "Community Learning",
                description: "Join a vibrant community of learners and mentors"
              },
              {
                icon: <BookOpen className="h-12 w-12 text-purple-600" />,
                title: "Comprehensive Courses",
                description: "Access a wide range of courses across various domains"
              },
              {
                icon: <Award className="h-12 w-12 text-orange-500" />,
                title: "Certification",
                description: "Earn recognized certificates upon course completion"
              }
            ].map((feature, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                  <div className="-mt-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white text-white shadow-md mx-auto">
                      {feature.icon}
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 text-center">
                      {feature.title}
                    </h3>
                    <p className="mt-5 text-base text-gray-500 text-center">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Edubridge?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              See how we compare to traditional learning platforms
            </p>
          </div>

          <div className="mt-12">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Features
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Edubridge
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-500">
                      Other Platforms
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {[
                    { feature: "Interactive Learning", edubridge: true, others: false },
                    { feature: "Personalized Learning Paths", edubridge: true, others: false },
                    { feature: "Live Projects & Real-world Applications", edubridge: true, others: false },
                    { feature: "1:1 Mentor Support", edubridge: true, others: false },
                    { feature: "Job Placement Assistance", edubridge: true, others: false },
                    { feature: "Community & Peer Learning", edubridge: true, others: false },
                    { feature: "Lifetime Access to Course Materials", edubridge: true, others: false },
                    { feature: "Industry-Recognized Certifications", edubridge: true, others: true },
                    { feature: "Self-paced Learning", edubridge: true, others: true },
                    { feature: "Video Lectures", edubridge: true, others: true },
                  ].map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {item.feature}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        {item.others ? (
                          <Check className="h-5 w-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Limited</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
                Start Your Journey Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Get started with Edubridge in just a few simple steps
            </p>
          </div>

          <div className="mt-12">
            <div className="relative">
              {/* Progress line */}
              <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
              
              {/* Steps */}
              <div className="relative space-y-10 md:space-y-0 md:grid md:grid-cols-4 md:gap-8">
                {[
                  {
                    number: "01",
                    title: "Sign Up / Log In",
                    description: "Users create an account using their email or phone number. They can set up a profile with their interests, education level, and goals."
                  },
                  {
                    number: "02",
                    title: "Choose Your Path",
                    description: "Select from our range of courses"
                  },
                  {
                    number: "03",
                    title: "Start Learning",
                    description: "Begin your educational journey"
                  },
                  {
                    number: "04",
                    title: "Get Certified",
                    description: "Earn certificates and showcase your skills"
                  }
                ].map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-xl font-bold mb-4 relative z-10">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
              Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Students Say
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Don't just take our word for it - hear from our community
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Web Developer",
                content: "Edubridge transformed my career. The hands-on projects and mentor support were invaluable.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Mike Chen",
                role: "Data Scientist",
                content: "The quality of courses and the community support exceeded my expectations. Highly recommended!",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Emma Wilson",
                role: "UI/UX Designer",
                content: "The project-based learning approach helped me build a strong portfolio that got me hired.",
                rating: 4,
                avatar: "EW"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Read More Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Everything you need to know about Edubridge
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                question: "Do I need any prior experience to start?",
                answer: "No, we offer courses for all skill levels, from beginners to advanced learners. Our platform is designed to help you learn at your own pace, regardless of your starting point."
              },
              {
                question: "Can I learn at my own pace?",
                answer: "Yes, all our courses are self-paced with lifetime access to course materials. You can learn whenever it's convenient for you and revisit the content as needed."
              },
              {
                question: "What kind of support can I expect?",
                answer: "You'll have access to mentor support, community forums, and dedicated teaching assistants. Our team is committed to helping you succeed in your learning journey."
              },
              {
                question: "Are the certificates recognized?",
                answer: "Yes, our certificates are recognized by industry partners and can be shared on LinkedIn. They demonstrate your skills and commitment to professional development."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers. We also offer flexible payment plans for many of our programs."
              },
              {
                question: "Can I get a refund if I'm not satisfied?",
                answer: "Yes, we offer a 30-day money-back guarantee for all our courses. If you're not satisfied with your purchase, simply contact our support team for a full refund."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">Still have questions?</p>
            <Button variant="link" className="text-blue-600 hover:underline">
              Contact our support team <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">EduBridge</span>
              </div>
              <p className="mt-4 text-gray-400">Empowering learners with accessible, high-quality education.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Connect With Us</h3>
              <div className="mt-4 flex space-x-4">
                <a href="mailto:hello@edubridge.com" className="text-gray-400 hover:text-white">
                  <Mail className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                © {new Date().getFullYear()} EduBridge. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;