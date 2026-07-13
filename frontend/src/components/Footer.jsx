import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-space-dark border-t border-slate-900/80 pt-16 pb-8 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex flex-col items-start leading-none">
            <Logo className="scale-75 origin-left" />
            <span className="text-[7px] tracking-[0.22em] font-black text-slate-500 uppercase mt-0.5 ml-7">EQUIP. DEFEND. WIN.</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-bold">
            Your ultimate destination for premium superhero battle suits, cosmic weaponry, and academy-approved tactical gear. Trusted by defenders worldwide.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-xs text-slate-400 font-bold">
            <li><Link to="/home" className="hover:text-accent-red transition-colors">Home</Link></li>
            <li><Link to="/shop" className="hover:text-accent-red transition-colors">Shop</Link></li>
            <li><Link to="/shop" className="hover:text-accent-red transition-colors">Categories</Link></li>
            <li><Link to="/shop" className="hover:text-accent-red transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop" className="hover:text-accent-red transition-colors">Sale</Link></li>
            <li><Link to="/home" className="hover:text-accent-red transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3: Customer Service */}
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
            Customer Service
          </h3>
          <ul className="space-y-2 text-xs text-slate-400 font-bold">
            <li><a href="#" className="hover:text-accent-red transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-accent-red transition-colors">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-accent-red transition-colors">Size Guide</a></li>
            <li><a href="#" className="hover:text-accent-red transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-accent-red transition-colors">Track Order</a></li>
            <li><a href="#" className="hover:text-accent-red transition-colors">Contact Us</a></li>
          </ul>
        </div>

      </div>

      {/* Copyright, Socials, Payments Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-500 font-bold gap-6">
        
        <div className="flex flex-col items-center md:items-start gap-1">
          <p>© {new Date().getFullYear()} VaultX. Original Artwork & Designs. Made by Antigravity.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>

        {/* Social Follow Handles */}
        <div className="flex items-center gap-3">
          <span className="text-slate-550 uppercase tracking-widest text-[9px]">ADMIN: ST SARO</span>
          <a href="https://www.instagram.com/st__saro?igsh=MWF4eDA4OHhqdDE0aw==" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <FaInstagram size={14} />
          </a>
        </div>

        {/* Payment Icons */}
        <div className="flex items-center gap-1.5 font-mono text-[8px]">
          <span className="text-slate-550 uppercase tracking-widest text-[9px] mr-1.5">WE ACCEPT:</span>
          <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded uppercase font-black">Visa</span>
          <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded uppercase font-black">MC</span>
          <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded uppercase font-black">UPI</span>
          <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded uppercase font-black">RuPay</span>
          <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded uppercase font-black">Credits</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
