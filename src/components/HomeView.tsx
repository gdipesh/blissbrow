/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Heart,
  ChevronDown,
  Star,
  HeartHandshake,
  Check,
  Zap,
  HelpCircle,
  Gem,
} from "lucide-react";
import { Service, BusinessInfo, BusinessHours } from "../types";
import browBlissLogo from "../image/browbliss.jpg";
interface HomeViewProps {
  services: Service[];
  info: BusinessInfo;
  businessHours: BusinessHours[];
  setRoute: (route: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  services,
  info,
  businessHours,
  setRoute,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Get active services
  const activeServices = services.filter((s) => s.is_active);

  const faqs = [
    {
      q: "Where is your studio located?",
      a: "BrowBliss is a private, home-based threading studio located in a peaceful residential neighborhood of Woodland, CA. To maintain privacy, the exact street address is shared automatically via text and email immediately after booking.",
    },
    {
      q: "How much is an Eyebrow Threading session?",
      a: "Our eyebrow threading is only $6! We focus on offering exceptional, precise styling at highly accessible prices so that regular maintenance is affordable for everyone.",
    },
    {
      q: "Do you accept walk-ins?",
      a: "To ensure each client receives a personalized, unhurried, and intimate experience, we are strictly BY APPOINTMENT ONLY. You can easily book your time slot in less than a minute on our booking page!",
    },
    {
      q: "What methods of payment do you accept?",
      a: "We accept Zelle, Venmo, Apple Cash, and Cash. Badges and instructions are provided at checkout inside the studio.",
    },
    {
      q: "Is threading better than waxing?",
      a: "Yes! Threading is highly recommended by dermatologists because it is 100% natural, chemical-free, and does not peel or damage the top layer of skin. It is extremely precise, removing even the finest facial peach fuzz from the root for longer-lasting results.",
    },
    {
      q: "What is Henna tinting?",
      a: "Henna is a natural plant-based dye that temporarily tints the brow hairs (up to 6 weeks) and the skin underneath (up to 2 weeks), creating a beautiful shadow. It fills in sparse areas for a fuller, makeup-ready brow look! Henna is starting at $10.",
    },
  ];

  const testimonials = [
    {
      name: "Brianna Turner",
      city: "Woodland, CA",
      text: "She does an AMAZING job I always leave very happy and content with how my eyebrows look. Would 100% recommend doesn’t thin out your brows or take to much off. Very superior work. Recommend.",
      rating: 5,
    },
    {
      name: "Alenna R.",
      city: "Davis, CA",
      text: "i recommend her she's been the only one to do my eybrows how i actually want them...it's not a shop it's her home she does a awesome job in my opinion!!",
      rating: 5,
    },
    {
      name: "Nancy.",
      city: "Davis, CA",
      text: "100% recommend BrowBliss Threading! Clean, professional, and amazing results all the time. Best Brows shaping in the town.",
      rating: 5,
    },
  ];

  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
      caption: "Flawless and clean facial threading",
    },
    {
      url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=600",
      caption: "Perfect brow alignment and styling",
    },
    {
      url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
      caption: "Hygienic and dedicated tools",
    },
    {
      url: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=600",
      caption: "Soft botanical beauty vibes",
    },
  ];

  return (
    <div className="bg-cream min-h-screen text-charcoal font-sans">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 md:px-12 py-16 bg-[#FDF6F0] overflow-hidden">
        {/* Background Decorative Elements */}
        <svg
          className="absolute top-0 right-0 opacity-15 pointer-events-none"
          width="400"
          height="400"
          viewBox="0 0 200 200"
        >
          <path
            fill="#C4687A"
            d="M44.7,-76.4C58.1,-69.2,69.2,-56.1,77.3,-41.2C85.4,-26.3,90.5,-9.6,88.7,6.3C86.9,22.2,78.2,37.3,66.8,49.1C55.4,61,41.4,69.6,26.4,74.8C11.3,79.9,-4.9,81.6,-20.5,78.3C-36.1,75.1,-51.2,66.9,-63.5,54.8C-75.7,42.7,-85.2,26.7,-88.1,9.8C-91,-7,-87.3,-24.8,-78,-39.2C-68.7,-53.6,-53.8,-64.7,-38.7,-71.2C-23.7,-77.7,-8.4,-79.6,7.6,-79.6C23.6,-79.6,44.7,-76.4,44.7,-76.4Z"
            transform="translate(100 100)"
          />
        </svg>

        <div className="absolute top-20 left-10 w-48 h-48 bg-blush/20 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-16 right-16 opacity-10 rotate-12 pointer-events-none hidden md:block">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="#C9A96E">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Visual Brow Icon and Lines Decor */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl z-10"
        >
          {/* Slogan pill */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-dusty/10 text-dusty text-xs font-semibold tracking-widest uppercase mb-6 border border-dusty/20">
            <Gem size={12} className="text-gold animate-pulse" />
            Professional • Precise • Affordable
          </span>

          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-semibold text-dusty tracking-tight mb-6 leading-tight">
            Beautiful Brows,
            <br />
            <span className="italic font-normal text-gold">Happy You</span>
          </h2>

          <p className="text-lg md:text-xl text-charcoal/80 max-w-xl mx-auto font-light leading-relaxed mb-10">
            "Enhance your natural beauty with perfect brows and flawless skin!"
            Offered in an intimate public-private home studio in Woodland, CA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setRoute("/book")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-dusty text-white font-semibold tracking-wider uppercase text-sm hover:bg-dusty/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-dusty/25 flex items-center justify-center gap-2"
            >
              <Clock size={16} />
              Book Appointment
            </button>

            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-dusty/30 text-dusty font-semibold tracking-wider uppercase text-sm hover:bg-blush/10 transition-all duration-305 flex items-center justify-center gap-2"
            >
              Explore Menu & Pricing
            </a>
          </div>

          {/* Phone quick call/text details */}
          <div className="mt-8 flex items-center justify-center gap-2 text-charcoal/70 text-sm">
            <Phone size={14} className="text-dusty" />
            <span>Call or Text: </span>
            <a
              href={`tel:${info.phone}`}
              className="font-bold underline text-dusty hover:text-dusty/80"
            >
              {info.phone}
            </a>
          </div>
        </motion.div>

        {/* Decorative SVG Brows Illustration */}
        <div className="mt-12 z-10 opacity-75 max-w-md w-full px-8 pointer-events-none">
          <svg
            viewBox="0 0 400 100"
            className="w-full text-dusty/30"
            stroke="currentColor"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            {/* Left Brow */}
            <path d="M 50,70 Q 110,35 170,55" />
            {/* Left Eye Closed Lashes */}
            <path d="M 70,80 Q 110,95 150,80" strokeWidth="1.5" />
            <path d="M 85,87 L 78,94" strokeWidth="1.5" />
            <path d="M 110,90 L 110,98" strokeWidth="1.5" />
            <path d="M 135,87 L 142,94" strokeWidth="1.5" />

            {/* Right Brow */}
            <path d="M 230,55 Q 290,35 350,70" />
            {/* Right Eye Closed Lashes */}
            <path d="M 250,80 Q 290,95 330,80" strokeWidth="1.5" />
            <path d="M 265,87 L 258,94" strokeWidth="1.5" />
            <path d="M 290,90 L 290,98" strokeWidth="1.5" />
            <path d="M 315,87 L 322,94" strokeWidth="1.5" />

            {/* Sweet subtle heart in the middle */}
            <path
              d="M 200,60 C 197,55 192,55 190,58 C 188,61 193,67 200,72 C 207,67 212,61 210,58 C 208,55 203,55 200,60 Z"
              fill="#C4687A"
              stroke="none"
              className="opacity-40"
            />
          </svg>
        </div>
      </section>

      {/* ================= THE BROW MENU card style ================= */}
      <section id="services" className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-sm font-sans tracking-[0.25em] text-dusty uppercase font-semibold mb-2">
            Pricing Menu
          </h3>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">
            Services & Precise Shaping
          </h2>
          <div className="w-24 h-[1px] bg-dusty/40 mx-auto mt-4 mb-2"></div>
          <p className="text-sm text-charcoal/60 max-w-md mx-auto italic">
            Meticulously mapped to matching structure. Strictly sterile cotton
            strands.
          </p>
        </div>

        {/* Dynamic Service List styled like clean paper flyers */}
        <div className="bg-white border-2 border-blush/20 rounded-3xl p-8 md:p-12 shadow-xl shadow-dusty/5 relative overflow-hidden">
          {/* Vintage border ornament */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blush via-gold to-blush"></div>

          <div className="space-y-8">
            {activeServices.length === 0 ? (
              <p className="text-center text-charcoal/60 py-6">
                No services are loaded at the moment.
              </p>
            ) : (
              activeServices.map((service) => (
                <div key={service.id} className="group">
                  <div className="dotted-leader-container">
                    <span className="font-serif text-xl md:text-2xl font-semibold text-charcoal flex items-center gap-2 group-hover:text-dusty/90 transition-colors">
                      {service.name === "Eyebrow Threading" && (
                        <Heart size={16} className="text-dusty fill-dusty/20" />
                      )}
                      {service.name === "Full Face" && (
                        <Sparkles size={16} className="text-gold" />
                      )}
                      {service.name === "Henna" && (
                        <Star size={16} className="text-gold fill-gold/10" />
                      )}
                      {service.name}
                    </span>
                    <span className="dotted-leader"></span>
                    <span className="font-serif text-xl md:text-2xl font-bold text-dusty">
                      ${service.price}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-charcoal/60 mt-1 pl-1 font-light italic leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Accept Payments Badges Section */}
          <div className="mt-14 pt-8 border-t border-blush/20 text-center">
            <h4 className="text-xs font-sans tracking-widest text-charcoal/50 uppercase font-semibold mb-6">
              Accepted Store Payments
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cream border border-blush/10 hover:border-dusty/30 transition-all">
                <span className="text-xs font-semibold text-dusty tracking-widest uppercase">
                  Zelle
                </span>
                <span className="text-[9px] text-charcoal/50 mt-1">
                  Instant Transfer
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cream border border-blush/10 hover:border-dusty/30 transition-all">
                <span className="text-xs font-semibold text-[#008CFF] tracking-widest uppercase">
                  Venmo
                </span>
                <span className="text-[9px] text-charcoal/50 mt-1">
                  @BrowBlissStudio
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cream border border-blush/10 hover:border-dusty/30 transition-all">
                <span className="text-xs font-semibold text-charcoal tracking-widest uppercase">
                   Cash
                </span>
                <span className="text-[9px] text-charcoal/50 mt-1">
                  Tap/Phone Link
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cream border border-blush/10 hover:border-dusty/30 transition-all">
                <span className="text-xs font-semibold text-gold tracking-widest uppercase">
                  Cash
                </span>
                <span className="text-[9px] text-charcoal/50 mt-1">
                  
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DETAILED ABOUT SECTION ================= */}
      <section className="bg-white py-24 px-6 md:px-12 border-y border-blush/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 relative">
            <div className="absolute top-3 left-3 -right-3 -bottom-3 rounded-3xl border-2 border-gold/50 pointer-events-none"></div>
            <img
              src={browBlissLogo}
              alt="Intimate custom brow studio Woodland CA"
              className="rounded-3xl shadow-xl w-full z-10 relative object-cover h-[420px]"
            />
          </div>

          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-10 h-0.5 bg-dusty"></span>
              <span className="text-xs font-sans tracking-widest text-dusty uppercase font-semibold">
                An Intimate Sanctuary
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal leading-tight">
              Woodland’s Private
              <br />
              <span className="italic font-normal text-gold">Home Studio</span>
            </h2>

            <p className="text-charcoal/80 leading-relaxed font-light text-base">
              {info.about_text}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blush/10 flex items-center justify-center">
                  <Check size={12} className="text-dusty" />
                </div>
                <span className="text-sm text-charcoal/90 font-medium">
                  Hygienic, premium sanitary single-use organic cotton threads
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blush/10 flex items-center justify-center">
                  <Check size={12} className="text-dusty" />
                </div>
                <span className="text-sm text-charcoal/90 font-medium">
                  Calming skincare application using soft Aveeno cream post-threading
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setRoute("/book")}
                className="px-6 py-3 rounded-full bg-dusty hover:bg-dusty/90 hover:scale-[1.02] text-white text-xs font-bold tracking-widest uppercase transition-all"
              >
                Schedule Intimate Care
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GALLERY SECTION ================= */}
      {/* <section className="py-24 px-6 md:px-12 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-sm font-sans tracking-[0.25em] text-dusty uppercase font-semibold mb-2">
              Our Gallery
            </h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">
              Fresh Arches & Glows
            </h2>
            <div className="w-24 h-[1px] bg-dusty/40 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-2xl shadow-md bg-white border border-blush/10 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-305 flex items-end p-4">
                    <p className="text-xs font-medium text-white italic tracking-wide">
                      {image.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ================= REVIEWS SECTION ================= */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-cream to-blush/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-sm font-sans tracking-[0.25em] text-dusty uppercase font-semibold mb-2">
              Client Testimonials
            </h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">
              What Our Happy Guests Say
            </h2>
            <div className="w-24 h-[1px] bg-dusty/40 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-blush/20 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-gold mb-4">
                    {[...Array(test.rating)].map((_, idx) => (
                      <Star key={idx} size={16} className="fill-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-charcoal/80 italic leading-relaxed mb-6 font-light">
                    "{test.text}"
                  </p>
                </div>
                <div className="border-t border-cream pt-4">
                  <p className="text-sm font-semibold text-charcoal">
                    {test.name}
                  </p>
                  <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">
                    {test.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LOCATION & BUSINESS HOURS ================= */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
          {/* Work Hours card */}
          <div className="md:w-1/2 bg-cream/50 rounded-3xl p-8 border border-blush/20 h-fit">
            <h3 className="text-xl font-serif font-bold text-dusty mb-6 flex items-center gap-2">
              <Clock size={18} />
              Studio Business Hours
            </h3>

            <div className="space-y-4 font-sans text-sm">
              {businessHours.map((hr) => (
                <div
                  key={hr.id}
                  className="flex justify-between items-center pb-2 border-b border-blush/10"
                >
                  <span className="font-semibold text-charcoal">
                    {hr.day_name}
                  </span>
                  {hr.is_closed ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-charcoal/15 text-charcoal/60 uppercase tracking-wider font-semibold">
                      Closed
                    </span>
                  ) : (
                    <span className="text-charcoal/80 font-medium">
                      {hr.open_time} AM — {hr.close_time} 
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-charcoal/40 uppercase tracking-widest text-center mt-6 italic">
              * Services strictly by appointment only
            </p>
          </div>

          {/* Woodland privacy card */}
          <div className="md:w-1/2 flex flex-col justify-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blush/20 flex items-center justify-center text-dusty">
              <MapPin size={24} />
            </div>

            <h2 className="text-4xl font-serif font-bold text-charcoal">
              Woodland, California Private Location
            </h2>

            {/* <p className="text-charcoal/80 leading-relaxed font-light">
              BrowBliss operates out of a delightful private home setting
              directly within Woodland, CA. This allows us to cut massive
              commercial salon overhead and provide high-end, luxurious detail
              styling back to our clients for only $6.
            </p> */}

            {/* <div className="p-4 rounded-2xl bg-cream border border-gold/30 flex items-start gap-3">
              <ShieldCheck
                className="text-gold flex-shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dusty">
                  Address Privacy Guaranteed
                </p>
                <p className="text-xs text-charcoal/70 mt-1">
                  To ensure private safety, the exact street address card is
                  instantly messaged to your phone and email right after setting
                  your time slot.
                </p>
              </div>
            </div> */}

            <div className="pt-2">
              <button
                onClick={() => setRoute("/book")}
                className="px-6 py-3 rounded-full bg-dusty hover:bg-dusty/95 font-semibold tracking-wider uppercase text-xs text-white"
              >
                Launch Easy Booking Sequence
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="py-24 px-6 md:px-12 bg-cream border-t border-blush/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-sm font-sans tracking-[0.25em] text-dusty uppercase font-semibold mb-2">
              Got Questions?
            </h3>
            <h2 className="text-4xl font-serif font-bold text-charcoal">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-[1px] bg-dusty/40 mx-auto mt-4"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-blush/20 overflow-hidden shadow-sm transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-6 flex justify-between items-center hover:bg-cream/10 transition-colors"
                  >
                    <span className="font-sans font-semibold text-charcoal text-base md:text-lg pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-dusty flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-charcoal/70 font-light border-t border-cream leading-relaxed font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SUBTLE CONVERGING BANNER ================= */}
      <section className="py-20 bg-gradient-to-r from-dusty/10 via-blush/20 to-dusty/10 border-y border-blush/10 text-center px-6">
        <div className="max-w-xl mx-auto">
          <Heart className="mx-auto text-dusty animate-pulse mb-6" size={24} />
          <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">
            Are you ready for lovely lines?
          </h2>
          <p className="text-sm text-charcoal/70 mb-8 font-light">
            Book your private session in seconds and look your sparkling best.
          </p>
          <button
            onClick={() => setRoute("/book")}
            className="px-8 py-3.5 rounded-full bg-dusty text-white font-bold tracking-widest uppercase text-xs hover:scale-105 transition-all shadow-lg shadow-dusty/20"
          >
            Select Service & Reserve Now
          </button>
        </div>
      </section>
    </div>
  );
};
